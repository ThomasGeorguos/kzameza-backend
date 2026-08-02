const express = require('express')
const { getCart, addToCart, updateCart, removeFromCart, clearCart } = require('../controllers/cart.js')
const cartRouter = express.Router()
const auth = require('../auth/middleware.js')


cartRouter.get('/', auth(), getCart)
cartRouter.post('/', auth(), addToCart)
cartRouter.put('/', auth(), updateCart)
cartRouter.delete('/', auth(), removeFromCart)
cartRouter.delete('/clear', auth(), clearCart)

module.exports = cartRouter