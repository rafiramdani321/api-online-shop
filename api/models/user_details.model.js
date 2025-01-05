import mongoose from "mongoose";

const userDetailsSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Types.ObjectId,
    required: true,
    unique: true,
    ref: 'user'
  },
  fullname: {
    type: String,
    required: true
  },
  dateOfBirth: {
    type: Date
  },
  gender: {
    type: String
  },
  phone: {
    type: String,
    unique: true,
    required: true,
  }
})

const UserDetails = mongoose.model('User_detail', userDetailsSchema)
export default UserDetails