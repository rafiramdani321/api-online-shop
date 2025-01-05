import mongoose from "mongoose";

const imageUserProfileSchema = mongoose.Schema({
  userId: {
    type: mongoose.Types.ObjectId,
    required: true,
    unique: true
  },
  fileName: {
    type: String,
    required: true,
    unique: true
  },
  image_url: {
    type: String,
    required: true,
    unique: true
  }
})

const imageUserProfile = mongoose.model('userProfileImage', imageUserProfileSchema)
export default imageUserProfile