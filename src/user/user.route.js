import express from 'express'
import { userController } from './user.controller.js'
import { checkAuthAccessEditedUser, verifyTokenAccess } from '../../middleware/middleware.js'
import { addShippingAddressValidation, updateUserForCustomer, validationResults } from '../../validation/index.js'

export const userRouter = express.Router()

userRouter.use(verifyTokenAccess)
userRouter.get('/profile', userController.getProfileById)
userRouter.post('/', updateUserForCustomer, validationResults, userController.addUserDetail)
userRouter.get('/shipping-address', userController.getShippingAddressByUserId)
userRouter.get('/shipping-address/address', userController.getAddressByUserIdAndAddressId)
userRouter.post('/add-shipping', addShippingAddressValidation, validationResults, userController.addShippingAddress)
userRouter.put('/update-shipping', addShippingAddressValidation, validationResults, userController.updateShippingAddress)
userRouter.put('/delete-shipping', userController.deleteShippingAddress)
userRouter.put('/update-status-shipping', userController.updateStatusShippingToTrue)
userRouter.post('/upload-image-profile', userController.addImageProfile)
userRouter.put('/update-image-profile', userController.updateImageProfile)