const express = require("express");
const {
  createOrder,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
} = require("../controllers/orders.js");
const auth = require("../auth/middleware.js");
const orderRouter = express.Router();

orderRouter.post("/", auth(), createOrder);
orderRouter.get("/my", auth(), getMyOrders);
orderRouter.get("/", auth("admin"), getAllOrders);
orderRouter.get("/:id", auth(), getOrderById);
orderRouter.patch("/:id/status", auth("admin"), updateOrderStatus);

module.exports = orderRouter;
