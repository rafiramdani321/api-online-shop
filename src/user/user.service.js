import mongoose from "mongoose"
import { userRepository } from "./user.repository.js"
import { unlink } from 'fs'

const getProfileById = async (idUser) => {
  const user = await userRepository.findUserProfile(idUser)
  if (!user) {
    throw Error('user not found')
  }
  return user
}

const addUserDetails = async (data) => {
  await getProfileById(data.userId)

  // cek duplicate username
  const findUsername = await userRepository.findUserByUsername(
    {
      $regex: new RegExp('^' + data.username + '$', 'i')
    }
  )
  if (findUsername && data.userId != findUsername._id) {
    throw Error('username has been used!')
  }

  // cek duplicate email
  const findUserEmail = await userRepository.findUserByEmail(data.email)
  if (findUserEmail && data.userId != findUserEmail._id) {
    throw Error('email has been used!')
  }

  // cek duplicate phone
  const findUserPhone = await userRepository.findUserByPhone(data.phone)
  if (findUserPhone && data.userId != findUserPhone.user_id) {
    throw Error('phone has been used!')
  }

  const user = await userRepository.insertUserDetails(data)
  return user
}

const getShippingAddressByUserId = async (userId) => {
  await getProfileById(userId)

  const shippingAddress = await userRepository.findShippingAddressByUserId(userId)
  return shippingAddress
}

const getShippingAddressById = async (data) => {
  await getProfileById(data.userId)
  const shippingAddress = await userRepository.findShippingAddressById(data)

  if (!shippingAddress) {
    throw Error('Data shipping not found!')
  }

  return shippingAddress
}

const addShippingAddress = async (data) => {

  // cek user id
  await getProfileById(data.userId)

  // cek shipping data max 3 from user
  const shippingUser = await userRepository.findShippingAddressByUserId(data.userId)
  const maxShippingAddresUser = 3
  if (shippingUser) {
    if (shippingUser.addresses.length >= maxShippingAddresUser) {
      throw Error('You cannot add shipping address, because you have 3 shipping address!')
    }
  }

  // change status shipping to false
  if (shippingUser) {
    if (data.status && shippingUser.addresses.length > 0) {
      await userRepository.updateStatusShippingToFalse(data.userId)
    }
  }

  const userShippingAddress = await userRepository.insertShippingAddress(data)
  return userShippingAddress
}

const updateStatusShippingToTrue = async (data) => {
  await getProfileById(data.userId)

  // get shipping by by userId
  const shippingUser = await userRepository.findShippingAddressByUserId(data.userId)
  // change status shipping to false
  if (shippingUser) {
    if (data.status && shippingUser.addresses.length > 0) {
      await userRepository.updateStatusShippingToFalse(data.userId)
    }
  }

  const changeStatusShipping = await userRepository.updateStatusShippingToTrue(data)
  return changeStatusShipping

}

const updateShippingAddress = async (data) => {
  const shipping = await userRepository.findShippingAddressById(data.userId, data.shippingId)
  if (!shipping) {
    throw Error('Shipping user not found!')
  }

  const updateShipping = await userRepository.updateShippingAddress(data)
  return updateShipping
}

const deleteShippingAddress = async (data) => {

  const shipping = await userRepository.findShippingAddressById(data.userId, data.shippingId)
  if (!shipping) {
    throw Error('Shipping user not found!')
  }

  const getShippingByUserId = await userRepository.findShippingAddressByUserId(data.userId)
  const minShippingAddressUser = 1
  if (getShippingByUserId[0]?.addresses?.length <= minShippingAddressUser) {
    throw Error('You must have at least one shipping address')
  }

  const deleteShipping = await userRepository.deleteShippingAddress(data)
  return deleteShipping
}

const uploadImageUserProfile = async (data) => {
  // cek type file
  if (!(data.allowType).includes((data.ext).toLowerCase())) {
    throw Error('Format file not valid!')
  }

  // cek size file
  if (data.fileSize > 6000000) {
    throw Error('size image min 5 MB!')
  }

  // save image
  data.file.mv(
    `./public/images/user_profile/${data.fileName}`, async (err) => {
      const uploadImage = await userRepository.insertImageProfile(data)
      return uploadImage
    }
  )
}

const updateImageUserProfile = async (data) => {
  // cek type file
  if (!(data.allowType).includes((data.ext).toLowerCase())) {
    throw Error('Format file not valid!')
  }

  // cek size file
  if (data.fileSize > 6000000) {
    throw Error('size image min 5 MB!')
  }

  const imageUser = await userRepository.findImageUserById(data.imageId)

  // update image
  const filePath = `./public/images/user_profile/${imageUser.fileName}`
  unlink(filePath, (err) => {
    if (err) {
      throw Error(err)
    }
  })

  data.file.mv(
    `./public/images/user_profile/${data.fileName}`, async (err) => {
      if (err) {
        throw Error(err)
      }

      const updateImageUser = await userRepository.updateImageProfile(data)
      return updateImageUser
    }
  )
}

export const userService = {
  getProfileById,
  addUserDetails,
  getShippingAddressByUserId,
  addShippingAddress,
  updateShippingAddress,
  deleteShippingAddress,
  updateStatusShippingToTrue,
  uploadImageUserProfile,
  updateImageUserProfile,
  getShippingAddressById
}