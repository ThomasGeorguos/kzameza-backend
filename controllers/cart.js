const Cart = require("../models/CartSchema");
const Product = require("../models/ProductSchema");

// حساب التوتالز
const calcTotals = (cart) => {
  cart.totalItems = cart.items.reduce((acc, item) => acc + item.quantity, 0);
  cart.totalPrice = cart.items.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0,
  );
  cart.totalAmount = cart.totalPrice;
};

const getCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user.id }).populate(
      "items.product",
      "title price description coverImage stock",
    );
    if (!cart) {
      cart = new Cart({ user: req.user.id, items: [] });
      await cart.save();
    }
    return res.status(200).json({ success: true, cart });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error retrieving cart",
      error: error.message,
    });
  }
};

const addToCart = async (req, res) => {
  try {
    const { productId } = req.body;

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    let cart = await Cart.findOne({ user: req.user.id });

    if (!cart) {
      cart = new Cart({
        user: req.user.id,
        items: [],
      });
    }

    const existingItem = cart.items.find(
      (it) => (it.product?._id || it.product).toString() === productId,
    );

    const currentQty = existingItem ? existingItem.quantity : 0;
    const itemIndex = cart.items.findIndex(
      (it) => (it.product?._id || it.product).toString() === productId,
    );

    if (currentQty + 1 > product.stock) {
      return res.status(400).json({
        success: false,
        message: `Only ${product.stock} left in stock`,
      });
    }

    if (itemIndex > -1) {
      cart.items[itemIndex].quantity += 1;
    } else {
      cart.items.push({
        product: productId,
        price: product.price,
        quantity: 1,
      });
    }

    calcTotals(cart);

    await cart.save();

    const populatedCart = await Cart.findById(cart._id).populate(
      "items.product",
      "title description price coverImage stock",
    );

    return res.status(200).json({
      success: true,
      cart: populatedCart,
    });
  } catch (error) {
    console.error("ADD TO CART ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Error adding to cart",
      error: error.message,
    });
  }
};

const updateCart = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    if (quantity < 1)
      return res.status(400).json({ message: "Quantity must be at least 1" });

    let cart = await Cart.findOne({ user: req.user.id });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    const item = cart.items.find((it) => it.product.toString() === productId);
    if (!item)
      return res.status(404).json({ message: "Item not found in cart" });

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: "Product not found" });

    if (quantity > product.stock) {
      return res.status(400).json({
        success: false,
        message: `Only ${product.stock} left in stock`,
      });
    }

    item.quantity = quantity;

    calcTotals(cart);
    await cart.save();
    await cart.populate(
      "items.product",
      "title description price coverImage stock",
    );

    return res.status(200).json({ success: true, cart });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error updating cart", error: error.message });
  }
};

const removeFromCart = async (req, res) => {
  try {
    const { productId } = req.body;

    let cart = await Cart.findOne({ user: req.user.id });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    const itemIndex = cart.items.findIndex(
      (it) => it.product.toString() === productId,
    );
    if (itemIndex === -1)
      return res.status(404).json({ message: "Item not found in cart" });

    const item = cart.items[itemIndex];

    cart.items.splice(itemIndex, 1);

    calcTotals(cart);
    await cart.save();

    const populatedCart = await Cart.findById(cart._id).populate(
      "items.product",
      "title description price coverImage stock",
    );

    return res.status(200).json({
      success: true,
      cart: populatedCart,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error removing item", error: error.message });
  }
};

const clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    cart.items = [];
    calcTotals(cart);
    await cart.save();

    const populatedCart = await Cart.findById(cart._id).populate(
      "items.product",
      "title description price coverImage stock",
    );

    return res.status(200).json({
      success: true,
      message: "Cart cleared",
      cart: populatedCart,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error clearing cart", error: error.message });
  }
};

module.exports = { getCart, addToCart, updateCart, removeFromCart, clearCart };
