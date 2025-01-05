import mongoose from "mongoose";

const tokenSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true },
  token: { type: String, required: true },
  verifyExp: { type: Date, required: true }
})
const Tokens = mongoose.model('token', tokenSchema)
export default Tokens
