const express = require("express");
const {
  createHeroSlide,
  getHeroSlides,
  deleteHeroSlide,
} = require("../controllers/heroSlides.js");
const auth = require("../auth/middleware.js");
const upload = require("../config/upload.js");
const heroSlideRouter = express.Router();

heroSlideRouter.post(
  "/",
  auth("admin"),
  upload.single("image"),
  createHeroSlide,
);
heroSlideRouter.get("/", getHeroSlides);
heroSlideRouter.delete("/:id", auth("admin"), deleteHeroSlide);

module.exports = heroSlideRouter;
