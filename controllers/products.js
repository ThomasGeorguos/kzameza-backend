const Product = require("../models/ProductSchema");
const Category = require("../models/CategorySchema");
const upload = require("../config/upload.js");
const createProduct = async (req, res) => {
  try {
    const {
      title,
      description,
      price,
      stock,
      isFeatured,
      isOnSale,
      discountPercent,
      category,
    } = req.body;
    if (
      !title.trim() ||
      !description.trim() ||
      price == null ||
      stock == null
    ) {
      return res
        .status(400)
        .json({ message: "please fill all the required fields" });
    }
    if (!req.file) {
      return res.status(400).json({
        message: "please upload product image",
      });
    }
    const newProduct = new Product({
      title,
      description,
      price,
      stock,
      isFeatured,
      isOnSale,
      discountPercent,
      category,
      coverImage: req.file?.path,
    });
    await newProduct.save();
    return res
      .status(201)
      .json({ message: "product created successfully", product: newProduct });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find().populate("category", "name");
    return res.status(200).json({ products });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate(
      "category",
      "name",
    );
    if (!product) {
      return res.status(404).json({ message: "product not found" });
    }
    return res.status(200).json({ product });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
const updateProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate("category", "name");
    if (!product) {
      return res.status(404).json({ message: "product not found" });
    }
    return res
      .status(200)
      .json({ message: "product updated successfully", product });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id).populate(
      "category",
      "name",
    );
    if (!product) {
      return res.status(404).json({ message: "product not found" });
    }
    return res.status(200).json({ message: "product deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
const getProductsByCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.categoryId);

    const products = await Product.find({
      category: req.params.categoryId,
    })
      .populate("category")
      .sort({ stock: -1 });

    return res.status(200).json({
      products,
      category,
    });
  } catch (error) {
    return res.status(500).json({
      error: error.message,
    });
  }
};
module.exports = {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  upload,
  getProductsByCategory,
};
