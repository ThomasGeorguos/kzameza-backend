const ContactMessage = require("../models/ContactMessageSchema");

// أي حد يقدر يبعت رسالة، مش لازم يكون عامل لوجين
const sendMessage = async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;

    if (!name?.trim() || !email?.trim() || !message?.trim()) {
      return res.status(400).json({
        message: "please fill all the required fields",
      });
    }

    const newMessage = new ContactMessage({
      name,
      email,
      phone,
      subject,
      message,
    });
    await newMessage.save();

    return res.status(201).json({
      message: "Message sent successfully",
      contactMessage: newMessage,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// كل الرسائل - للادمن بس
const getAllMessages = async (req, res) => {
  try {
    const messages = await ContactMessage.find().sort({ createdAt: -1 });
    return res.status(200).json({ messages });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// تعليم الرسالة كمقروءة - للادمن بس
const markAsRead = async (req, res) => {
  try {
    const message = await ContactMessage.findByIdAndUpdate(
      req.params.id,
      { isRead: true },
      { new: true },
    );

    if (!message) {
      return res.status(404).json({ message: "message not found" });
    }

    return res
      .status(200)
      .json({ message: "marked as read", contactMessage: message });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// مسح رسالة - للادمن بس
const deleteMessage = async (req, res) => {
  try {
    const message = await ContactMessage.findByIdAndDelete(req.params.id);

    if (!message) {
      return res.status(404).json({ message: "message not found" });
    }

    return res.status(200).json({ message: "message deleted successfully" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

module.exports = { sendMessage, getAllMessages, markAsRead, deleteMessage };
