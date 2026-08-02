const express = require("express");
const {
  sendMessage,
  getAllMessages,
  markAsRead,
  deleteMessage,
} = require("../controllers/contact.js");
const auth = require("../auth/middleware.js");
const contactRouter = express.Router();

contactRouter.post("/", sendMessage);
contactRouter.get("/", auth("admin"), getAllMessages);
contactRouter.patch("/:id/read", auth("admin"), markAsRead);
contactRouter.delete("/:id", auth("admin"), deleteMessage);

module.exports = contactRouter;
