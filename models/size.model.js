import mongoose from "mongoose";

const sizeAllSchema = mongoose.Schema({
  size: { type: Number, required: true }
})
const sizeAll = mongoose.model('size', sizeAllSchema)
export default sizeAll