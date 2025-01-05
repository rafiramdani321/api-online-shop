import mongoose from "mongoose";

const sizeSchema = mongoose.Schema({
  size: { type: Number, required: true },
  id_product: { type: mongoose.Schema.Types.ObjectId, ref: 'product', required: true },
  stock: { type: Number, required: true, default: 0 }
})
const Size = mongoose.model('sizeProduct', sizeSchema)
export default Size