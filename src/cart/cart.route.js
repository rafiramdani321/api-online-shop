import express from 'express'
import { cartControllers } from './cart.controller.js'

export const cartRouter = express.Router()

cartRouter.get('/', cartControllers.getCartsByUserId)
cartRouter.post('/', cartControllers.addCartProduct)
cartRouter.delete('/:id', cartControllers.deleteCartById)