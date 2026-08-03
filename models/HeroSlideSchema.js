const mongoose = require("mongoose");

const HeroSlideSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    image: {
      type: String,
      required: true,
    },
    eyebrow: {
      type: String,
      default: "",
    },
    title: {
      type: String,
      default: "",
    },
    highlight: {
      type: String,
      default: "",
    },
    description: {
      type: String,
      default: "",
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("HeroSlide", HeroSlideSchema);
