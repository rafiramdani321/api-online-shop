import mongoose from "mongoose";

const orderShcema = new mongoose.Schema({
  transaction_id: { type: String, required: true, unique: true },
  user_id: { type: mongoose.Types.ObjectId, ref: 'user' },
  shipping_address_id: { type: mongoose.Types.ObjectId, required: true, ref: 'shipping_address' },
  status: { type: String, required: true },
  total: { type: Number, required: true },
  snap_token: { type: String, required: true },
  snap_redirect_url: { type: String, required: true },
  created_at: { type: Date, required: true },
  updated_at: { type: Date, required: true },
})

const Orders = mongoose.model('order', orderShcema)
export default Orders