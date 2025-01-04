import mongoose from 'mongoose'

const categorySchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true },
  status_category: {
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
const Categories = mongoose.model('category', categorySchema)
export default Categories