import express from 'express'
import { productContollers } from './product.controller.js'
import { addProductValidation, addSizeProductValidation, validationResults } from '../../validation/index.js'

export const productRouter = express.Router()

productRouter.get('/', productContollers.getProducts)
productRouter.get('/id/:productId', productContollers.getProductById)
productRouter.get('/slug/:productSlug', productContollers.getProductBySlug)
productRouter.post('/',
  addProductValidation, validationResults,
  productContollers.addProduct
)
productRouter.get('/category/:id', productContollers.getProductByCategoryId)
productRouter.get('/productsByCategorySlug/', productContollers.getProductByCategorySlug)
productRouter.get('/productsBySubCategorySlug/', productContollers.getProductBySubCategorySlug)
productRouter.put('/:id',
  addProductValidation, validationResults,
  productContollers.editProduct
)
productRouter.delete('/:id', productContollers.deleteProduct)

// size product
productRouter.get('/sizes', productContollers.getSizesProduct)
productRouter.get('/sizes/:id', productContollers.getSizeProductById)
productRouter.post('/sizes',
  addSizeProductValidation, validationResults,
  productContollers.addSizeProduct
)
productRouter.put('/sizes/edit', productContollers.editSizeProductById)
productRouter.delete('/delete/sizes/:id', productContollers.deleteSizeProductById)
productRouter.get('/status-realese', productContollers.getProductStatusRealese)
productRouter.put('/edit/status-realese', productContollers.editProductRealese)