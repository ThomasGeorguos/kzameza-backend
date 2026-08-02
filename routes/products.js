const express = require("express");
const {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  upload,
  getProductsByCategory,
} = require("../controllers/products.js");
const auth = require("../auth/middleware.js");
const productRouter = express.Router();
productRouter.post(
  "/",
  auth("admin"),
  upload.single("coverImage"),
  createProduct,
);
productRouter.get("/", getAllProducts);
productRouter.get("/:id", getProductById);
productRouter.get("/category/:categoryId", getProductsByCategory);
productRouter.patch("/:id", auth("admin"), updateProduct);
productRouter.delete("/:id", auth("admin"), deleteProduct);

module.exports = productRouter;
