const express = require("express");
const {
  createHeroSlide,
  getHeroSlides,
  updateHeroSlide,
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
heroSlideRouter.patch(
  "/:id",
  auth("admin"),
  upload.single("image"),
  updateHeroSlide,
);
heroSlideRouter.delete("/:id", auth("admin"), deleteHeroSlide);

module.exports = heroSlideRouter;
