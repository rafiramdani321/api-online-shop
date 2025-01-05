import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true },
  description: { type: String, required: true },
  id_category: { type: mongoose.Types.ObjectId, required: true, ref: 'category' },
  id_sub_category: { type: mongoose.Types.ObjectId, ref: 'SubCategories' },
  price: { type: Number, required: true },
  image: { type: String, required: true },
  url: { type: String, required: true },
  id_product_realese: { type: mongoose.Types.ObjectId, ref: 'productStatusRealese', required: true },
  product_status: { type: Boolean, default: true },
  deletedAt: { type: Date, default: null },
  created_by: { type: String, required: true },
  updated_by: { type: String, required: true },
  deleted_by: { type: String, default: null }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
});
const Product = mongoose.model('product', productSchema)
export default Product  