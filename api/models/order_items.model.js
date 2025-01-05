import mongoose from "mongoose";

const orderItemsSchema = new mongoose.Schema({
  order_id: { type: mongoose.Types.ObjectId, required: true, unique: true, ref: 'order' },
  items: [
    {
      product_id: { type: mongoose.Types.ObjectId, required: true, ref: 'product' },
      qty: { type: Number, required: true },
      sizeOrder: { type: String, required: true },
      size: { type: mongoose.Types.ObjectId, required: true, ref: 'sizeProduct' },
      total: { type: Number, required: true }
    }
  ]
})

const orderItems = mongoose.model('order_item', orderItemsSchema)
export default orderItems