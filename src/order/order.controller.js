import { orderService } from "./order.service.js"

const getOrderByUserId = async (req, res) => {
  try {
    const userId = req.params.userId
    const response = await orderService.getOrderByUserId(userId)
    res.status(200).json({
      status: true,
      data: response
    })
  } catch (error) {
    res.status(400).json({
      status: false,
      msg: error.message
    })
  }
}
    
const getOrderByTransactionId = async (req, res) => {
  try {
    const transaction_id = req.query.transaction_id
    const order = await orderService.getOrderByTransactionId(transaction_id)

    res.status(200).json({
      status: true,
      data: order 
    })
  } catch (error) {
    res.status(400).json({
      status: false,
      msg: error.message
    })
  }
}

export const orderController = {
  getOrderByUserId,
  getOrderByTransactionId,
}