import mongoose from "mongoose";

const cartSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Types.ObjectId,
    ref: 'User', required: true
  },
  productId: {
    type: mongoose.Types.ObjectId,
    ref: 'product',
    required: true
  },
  qty: {
    type: Number,
    required: true
  },
  size: {
    type: mongoose.Types.ObjectId,
    ref: 'sizeProduct',
    required: true
  },
  noted: {
    type: String
  },
  total: {
    type: Number,
    required: true
  }
})

const Cart = mongoose.model('cart', cartSchema)
export default Cart