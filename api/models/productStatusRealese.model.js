import mongoose from "mongoose";

const productStatusRealeseSchema = new mongoose.Schema({
  product_status_realese_title: { type: String, required: true }
})
const productStatusRealese = mongoose.model('productStatusRealese', productStatusRealeseSchema)
export default productStatusRealese