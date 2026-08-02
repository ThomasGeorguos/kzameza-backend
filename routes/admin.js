const express = require('express')
const {createProduct, getAllProducts, getProductById, updateProduct,deleteProduct, upload} = require('../controllers/admin.js')
const auth = require('../auth/middleware.js')
const adminRouter = express.Router()
adminRouter.post('/',auth('admin') ,upload.single('coverImage'),createProduct)
adminRouter.get('/',getAllProducts)
adminRouter.get('/:id',getProductById)
adminRouter.patch('/:id',auth('admin'),updateProduct)
adminRouter.delete('/:id',auth('admin'),deleteProduct)

module.exports = adminRouter