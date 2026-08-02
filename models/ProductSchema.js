const mongoose = require('mongoose')
const ProductSchema = new mongoose.Schema({
    title:{
        type:String,
        required:true
    },
  
    description:{
        type:String,
        required:true
    },
  
    price:{
        type:Number,
        required:true
    },
  
    stock:{
        type:Number,
        required:true,
        default:0
    },
    isFeatured:{
        type:Boolean,
        default:false
    },
    isOnSale:{
        type:Boolean,
    },
    discountPercent:{
        type:String,
    },
    category:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
        required:true
    },
    coverImage:{
        type:String,
        required:true
    }
    
  
})
module.exports = mongoose.model('Product',ProductSchema)