const Order = require("../models/OrderSchema");
const Cart = require("../models/CartSchema");
const Product = require("../models/ProductSchema");

// العميل بيأكد الاوردر من الكارت بتاعه
const createOrder = async (req, res) => {
  try {
    const { fullName, phone, address, city, notes } = req.body;

    if (
      !fullName?.trim() ||
      !phone?.trim() ||
      !address?.trim() ||
      !city?.trim()
    ) {
      return res.status(400).json({
        message: "please fill all the required shipping fields",
      });
    }

    const cart = await Cart.findOne({ user: req.user.id }).populate(
      "items.product",
      "title price coverImage stock",
    );

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Your cart is empty" });
    }

    // تأكيد إن كل المنتجات لسه متاحة بالكمية المطلوبة قبل ما نأكد الاوردر
    for (const item of cart.items) {
      if (!item.product) {
        return res.status(400).json({
          message: "One of the products in your cart no longer exists",
        });
      }
      if (item.product.stock < item.quantity) {
        return res.status(400).json({
          message: `${item.product.title} is out of stock, only ${item.product.stock} left`,
        });
      }
    }

    const orderItems = cart.items.map((item) => ({
      product: item.product._id,
      title: item.product.title,
      coverImage: item.product.coverImage,
      price: item.price,
      quantity: item.quantity,
    }));

    const totalItems = orderItems.reduce((acc, it) => acc + it.quantity, 0);
    const totalPrice = orderItems.reduce(
      (acc, it) => acc + it.price * it.quantity,
      0,
    );

    const order = new Order({
      user: req.user.id,
      items: orderItems,
      totalItems,
      totalPrice,
      shippingAddress: { fullName, phone, address, city, notes },
      status: "pending",
    });

    await order.save();

    // ينقص من الستوك بمجرد ما الاوردر يتأكد
    for (const item of cart.items) {
      await Product.findByIdAndUpdate(item.product._id, {
        $inc: { stock: -item.quantity },
      });
    }

    // فضي الكارت بعد ما الاوردر يتحفظ
    cart.items = [];
    cart.totalItems = 0;
    cart.totalPrice = 0;
    cart.totalAmount = 0;
    await cart.save();

    return res.status(201).json({
      message: "Order placed successfully",
      order,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// أوردرات العميل نفسه
const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id }).sort({
      createdAt: -1,
    });
    return res.status(200).json({ orders });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// اوردر واحد بالتفصيل (للعميل صاحب الاوردر أو الادمن)
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate(
      "user",
      "name email phoneNumber",
    );

    if (!order) {
      return res.status(404).json({ message: "order not found" });
    }

    if (
      req.user.role !== "admin" &&
      order.user._id.toString() !== req.user.id
    ) {
      return res.status(403).json({ message: "Access denied" });
    }

    return res.status(200).json({ order });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// كل الاوردرات - للادمن بس
const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("user", "name email phoneNumber")
      .sort({ createdAt: -1 });
    return res.status(200).json({ orders });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// تغيير حالة الاوردر - للادمن بس
const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const allowed = ["pending", "confirmed", "cancelled"];

    if (!allowed.includes(status)) {
      return res.status(400).json({ message: "invalid status value" });
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "order not found" });
    }

    const wasCancelled = order.status === "cancelled";
    const willBeCancelled = status === "cancelled";

    if (!wasCancelled && willBeCancelled) {
      // الاوردر بيتلغي - نرجّع الكمية للستوك
      for (const item of order.items) {
        await Product.findByIdAndUpdate(item.product, {
          $inc: { stock: item.quantity },
        });
      }
    } else if (wasCancelled && !willBeCancelled) {
      // الاوردر كان ملغي وبيترجع تاني - نتأكد إن فيه ستوك كفاية قبل ما ننقص تاني
      for (const item of order.items) {
        const product = await Product.findById(item.product);
        if (!product || product.stock < item.quantity) {
          return res.status(400).json({
            message: `Cannot restore this order, ${item.title} no longer has enough stock`,
          });
        }
      }
      for (const item of order.items) {
        await Product.findByIdAndUpdate(item.product, {
          $inc: { stock: -item.quantity },
        });
      }
    }

    order.status = status;
    await order.save();
    await order.populate("user", "name email phoneNumber");

    if (!order) {
      return res.status(404).json({ message: "order not found" });
    }

    return res.status(200).json({ message: "order status updated", order });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createOrder,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
};
