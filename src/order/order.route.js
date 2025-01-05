import express from 'express'
import { orderController } from './order.controller.js'

const routerOrder = express.Router()

routerOrder.get('/:userId', orderController.getOrderByUserId)
routerOrder.get('/', orderController.getOrderByTransactionId)

export default routerOrder