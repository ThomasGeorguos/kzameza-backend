const User = require("../models/UserSchema");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const signup = async (req, res) => {
  const { email, password, name, phoneNumber } = req.body;

  if (
    !email?.trim() ||
    !password?.trim() ||
    !name?.trim() ||
    !phoneNumber?.trim()
  ) {
    return res.status(400).json({
      message: "Email, password, name and phone number are required",
    });
  }

  const emailNormalized = email.toLowerCase().trim();

  const user = await User.findOne({ email: emailNormalized });

  if (user) {
    return res.status(400).json({ message: "User already exists" });
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  const newUser = new User({
    email: emailNormalized, // ✅ مهم جداً
    password: hashedPassword,
    name,
    phoneNumber,
    role: "user",
  });

  await newUser.save();

  const safeUser = await User.findById(newUser._id).select("-password");

  return res.status(201).json({
    message: "User registered successfully",
    user: safeUser,
    role: newUser.role,
  });
};

const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email?.trim() || !password?.trim()) {
    return res.status(400).json({
      message: "Email and password are required",
    });
  }

  const emailNormalized = email.toLowerCase().trim();

  const user = await User.findOne({ email: emailNormalized });

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(400).json({
      message: "Invalid email or password",
    });
  }

  const role = (user.role || "user").trim();

  const token = jwt.sign(
    {
      id: user._id,
      role: role,
    },
    process.env.SECRET_KEY,
    { expiresIn: "7d" },
  );

  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  const safeUser = await User.findById(user._id).select("-password");

  return res.status(200).json({
    message: "User logged in successfully",
    user: safeUser,
    role,
    redirect: role === "admin" ? "/admin" : "/",
  });
};
const verify = async (req, res) => {
  try {
    console.log("Cookies:", req.cookies);

    const token = req.cookies?.token;

    if (!token) {
      console.log("No token");
      return res.status(401).json({
        isAuthenticated: false,
        message: "No token provided",
      });
    }

    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    console.log("Decoded:", decoded);

    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      console.log("User not found");
      return res.status(401).json({
        isAuthenticated: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      isAuthenticated: true,
      user,
      role: user.role,
    });
  } catch (error) {
    console.log(error);
    return res.status(401).json({
      isAuthenticated: false,
      message: "Invalid token",
    });
  }
};
const logout = (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });
  return res.status(200).json({ message: "Logged out successfully" });
};
const getUserById = async (req, res) => {
  try {
    const userId = req.params.id;

    // 🔒 user نفسه أو admin فقط
    if (req.user.role !== "admin" && req.user.id !== userId) {
      return res.status(403).json({ message: "Not allowed" });
    }

    const user = await User.findById(userId).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({ user });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
const updateUser = async (req, res) => {
  try {
    // 🔒 Authorization: user نفسه أو admin فقط
    if (req.user.id !== req.params.id && req.user.role !== "admin") {
      return res.status(403).json({
        message: "Forbidden",
      });
    }

    const { name, email, phoneNumber, password, oldPassword, role } = req.body;
    const updateData = {};

    // ✅ name
    if (name) updateData.name = name;

    // 🔐 email (admin only + normalized + uniqueness check)
    if (email) {
      if (req.user.role !== "admin") {
        return res.status(403).json({
          message: "Only admin can update email",
        });
      }

      const emailNormalized = email.toLowerCase().trim();

      const exists = await User.findOne({
        email: emailNormalized.toLowerCase(),
      });

      if (exists && exists._id.toString() !== req.params.id) {
        return res.status(400).json({
          message: "Email already in use",
        });
      }

      updateData.email = emailNormalized;
    }

    // 📱 phoneNumber
    if (phoneNumber) updateData.phoneNumber = phoneNumber;

    // 👑 role (admin only)
    if (role) {
      if (req.user.role !== "admin") {
        return res.status(403).json({
          message: "Only admin can update role",
        });
      }
      if (req.user.id === req.params.id) {
        return res.status(400).json({
          message: "You can't change your own role",
        });
      }
      if (!["user", "admin"].includes(role)) {
        return res.status(400).json({ message: "Invalid role value" });
      }
      updateData.role = role;
    }

    // 🔐 password (with old password check)
    if (password) {
      if (!oldPassword) {
        return res.status(400).json({
          message: "Old password is required",
        });
      }

      const user = await User.findById(req.params.id).select("password");
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const isMatch = await bcrypt.compare(oldPassword, user.password);

      if (!isMatch) {
        return res.status(400).json({
          message: "Old password is incorrect",
        });
      }

      const hashedPassword = await bcrypt.hash(password, 12);
      updateData.password = hashedPassword;
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true },
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    return res.status(200).json({
      message: "User updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    return res.status(500).json({
      error: error.message,
    });
  }
};
// كل اليوزرز - للادمن بس
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    return res.status(200).json({ users });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// مسح يوزر - للادمن بس
const deleteUser = async (req, res) => {
  try {
    if (req.user.id === req.params.id) {
      return res
        .status(400)
        .json({ message: "You can't delete your own account" });
    }

    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

module.exports = {
  signup,
  login,
  getUserById,
  updateUser,
  verify,
  logout,
  getAllUsers,
  deleteUser,
};
// tt
