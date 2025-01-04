import mongoose from "mongoose"
import { userService } from "../user/user.service.js"
import { orderRepository } from "./order.repository.js"

const getOrderByUserId = async (userId) => {
  if (!mongoose.Types.ObjectId.isValid(userId)) throw Error('Invalid user id')

  await userService.getProfileById(userId)

  const ordersData = await orderRepository.findAllOrderByUserId(userId)
  if (ordersData.length <= 0) throw Error('Data not found')

  return ordersData
}

const getOrderByTransactionId = async (transactionId) => {
  const order = await orderRepository.findOrderByTransactionId(transactionId)

  if (!order) throw Error('Invalid Transaction_id')
  return order
}

export const orderService = {
  getOrderByUserId,
  getOrderByTransactionId,
}