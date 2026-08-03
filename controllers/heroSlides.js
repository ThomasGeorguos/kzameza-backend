const HeroSlide = require("../models/HeroSlideSchema");

const createHeroSlide = async (req, res) => {
  try {
    const { product, eyebrow, title, highlight, description, order } = req.body;

    if (!product) {
      return res.status(400).json({ message: "product is required" });
    }
    if (!req.file) {
      return res.status(400).json({ message: "please upload a slide image" });
    }

    const newSlide = new HeroSlide({
      product,
      image: req.file.path,
      eyebrow,
      title,
      highlight,
      description,
      order: order || 0,
    });

    await newSlide.save();
    await newSlide.populate("product");

    return res.status(201).json({
      message: "hero slide created successfully",
      slide: newSlide,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const getHeroSlides = async (req, res) => {
  try {
    const slides = await HeroSlide.find()
      .populate("product")
      .sort({ order: 1, createdAt: 1 });
    return res.status(200).json({ slides });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const updateHeroSlide = async (req, res) => {
  try {
    const { id } = req.params;
    const { product, eyebrow, title, highlight, description, order } = req.body;

    const updateData = {};
    if (product !== undefined) updateData.product = product;
    if (eyebrow !== undefined) updateData.eyebrow = eyebrow;
    if (title !== undefined) updateData.title = title;
    if (highlight !== undefined) updateData.highlight = highlight;
    if (description !== undefined) updateData.description = description;
    if (order !== undefined) updateData.order = order;
    if (req.file) updateData.image = req.file.path;

    const slide = await HeroSlide.findByIdAndUpdate(id, updateData, {
      new: true,
    }).populate("product");

    if (!slide) {
      return res.status(404).json({ message: "hero slide not found" });
    }

    return res.status(200).json({
      message: "hero slide updated successfully",
      slide,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const deleteHeroSlide = async (req, res) => {
  try {
    const { id } = req.params;
    const slide = await HeroSlide.findByIdAndDelete(id);
    if (!slide) {
      return res.status(404).json({ message: "hero slide not found" });
    }
    return res.status(200).json({ message: "hero slide deleted successfully" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createHeroSlide,
  getHeroSlides,
  updateHeroSlide,
  deleteHeroSlide,
};
