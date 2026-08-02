const express = require("express");
const {
  signup,
  login,
  getUserById,
  updateUser,
  verify,
  logout,
  getAllUsers,
  deleteUser,
} = require("../controllers/users");
const auth = require("../auth/middleware");
const usersRouter = express.Router();
usersRouter.post("/signup", signup);
usersRouter.post("/login", login);
usersRouter.post("/logout", logout);
usersRouter.get("/verify", verify);
usersRouter.get("/", auth("admin"), getAllUsers);
usersRouter.put("/:id", auth(), updateUser);
usersRouter.get("/:id", auth(), getUserById);
usersRouter.delete("/:id", auth("admin"), deleteUser);
module.exports = usersRouter;
