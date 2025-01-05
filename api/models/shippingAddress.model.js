import mongoose from "mongoose";

const shippingAddressSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Types.ObjectId,
    required: true
  },
  addresses: [
    {
      recipient_name: {
        type: String,
        required: true
      },
      phone: {
        type: String,
        required: true
      },
      address_label: {
        type: String,
        required: true
      },
      city: {
        type: String,
        required: true
      },
      complete_address: {
        type: String,
        required: true
      },
      note_to_courier: {
        type: String
      },
      status: {
        type: Boolean,
        required: true
      }
    }
  ]
})

const ShippingAddress = mongoose.model('Shipping_address', shippingAddressSchema)
export default ShippingAddress