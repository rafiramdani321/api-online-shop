import mongoose from "mongoose";

const subCategorySchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true },
  id_category: { type: mongoose.Types.ObjectId, required: true, ref: 'category' },
  status_sub_category: {
    type: Boolean,
    default: true,
    required: true,
  },
  deletedAt: { type: Date, default: null },
  created_by: { type: String, required: true },
  updated_by: { type: String, required: true },
  deleted_by: { type: String, default: null }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
})
const SubCategories = mongoose.model('SubCategories', subCategorySchema)
export default SubCategories