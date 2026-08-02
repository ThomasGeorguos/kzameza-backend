const { body, validationResult } = require("express-validator");

// ── Middleware عشان يرجع الـ errors ──
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: errors.array()[0].msg, // أول error بس عشان يتعرض في الفرونت
      errors: errors.array(), // كل الـ errors لو محتاجها
    });
  }
  next();
};

// ── Signup Validation ──
const signupValidation = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Name is required")
    .isLength({ min: 4 })
    .withMessage("Name must be at least 4 characters")
    .isLength({ max: 20 })
    .withMessage("Name must not exceed 20 characters"),

  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .matches(/^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/)
    .withMessage("Invalid email format"),

  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters")
    .matches(/(?=.*[a-zA-Z])(?=.*[0-9])/)
    .withMessage("Password must contain both letters and numbers"),

  body("phoneNumber")
    .trim()
    .notEmpty()
    .withMessage("Phone number is required")
    .matches(/^(010|011|012|015)[0-9]{8}$/)
    .withMessage("Phone number must start with 010, 011, 012, or 015"),

  handleValidationErrors,
];

// ── Login Validation ──
const loginValidation = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .matches(/^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/)
    .withMessage("Invalid email format"),

  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters"),

  handleValidationErrors,
];

module.exports = { signupValidation, loginValidation };
