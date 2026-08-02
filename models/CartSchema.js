const mongoose = require('mongoose')
const CartItemSchema = new mongoose.Schema({
    product :{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
    }, 
    quantity:{
        type: Number,
        required: true,
        min:1,
        default:1
    },
    price:{
        type: Number,
        required: true,

    }
})
const CartSchema = new mongoose.Schema({
user:{
    type: mongoose.Schema.Types.ObjectId,
    ref:'User'
},
items:[CartItemSchema],
totalAmount:{
    type: Number,
    default:0
},
totslItems:{
    type: Number,
    default:0
},
totalPrice:{
    type: Number,
    default:0
}
})
module.exports = mongoose.model('Cart',CartSchema)