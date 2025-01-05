import Orders from "../../models/order.model.js"
import orderItems from "../../models/order_items.model.js"

const createOrder = async (data) => {
  const order = await new Orders({
    transaction_id: data.transaction_id,
    user_id: data.user_id,
    shipping_address_id: data.shipping_address_id,
    status: data.status,
    total: data.total,
    snap_token: data.snap_token,
    snap_redirect_url: data.snap_redirect_url,
    created_at: Date.now(),
    updated_at: Date.now()
  }).save()

  return order
}

const createOrderItems = async (data) => {
  await new orderItems(
    {
      order_id: data.order_id,
      items: data.items
    }
  ).save()
}

export const transactionRepository = {
  createOrder,
  createOrderItems
}