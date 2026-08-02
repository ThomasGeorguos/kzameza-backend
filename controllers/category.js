const Category = require("../models/CategorySchema");
const Product = require("../models/ProductSchema");
const createCategory = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name.trim()) {
      return res.status(400).json({ message: "name is required" });
    }
    const newCategory = new Category({ name });
    await newCategory.save();
    return res.status(201).json({
      message: "category created successfully",
      category: newCategory,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
const getCategories = async (req, res) => {
  try {
    const categories = await Category.find();
    return res.status(200).json({ categories });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const updateCategory = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name?.trim()) {
      return res.status(400).json({ message: "name is required" });
    }
    const category = await Category.findByIdAndUpdate(
      req.params.id,
      { name },
      { new: true, runValidators: true },
    );
    if (!category) {
      return res.status(404).json({ message: "category not found" });
    }
    return res
      .status(200)
      .json({ message: "category updated successfully", category });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const deleteCategory = async (req, res) => {
  try {
    const productsCount = await Product.countDocuments({
      category: req.params.id,
    });

    if (productsCount > 0) {
      return res.status(400).json({
        message: `Can't delete this category, it still has ${productsCount} product(s) linked to it`,
      });
    }

    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) {
      return res.status(404).json({ message: "category not found" });
    }
    return res.status(200).json({ message: "category deleted successfully" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createCategory,
  getCategories,
  updateCategory,
  deleteCategory,
};
