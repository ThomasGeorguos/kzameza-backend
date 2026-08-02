const express = require("express");
const {
  createCategory,
  getCategories,
  updateCategory,
  deleteCategory,
} = require("../controllers/category.js");
const auth = require("../auth/middleware.js");
const categoryRouter = express.Router();
categoryRouter.post("/", auth("admin"), createCategory);
categoryRouter.get("/", getCategories);
categoryRouter.patch("/:id", auth("admin"), updateCategory);
categoryRouter.delete("/:id", auth("admin"), deleteCategory);

module.exports = categoryRouter;
