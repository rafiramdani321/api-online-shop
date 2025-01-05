import Role from "../../models/role.model.js"
import { userRepository } from "../user/user.repository.js"
import bcrypt from 'bcryptjs'
import { authRepository } from "./auth.repository.js"
import mongoose from "mongoose"
import jwt from 'jsonwebtoken'

const createUser = async (newUserData) => {
  try {

    // cek duplicate username
    const findUserByUsername = await userRepository.findUserByUsername({
      $regex: new RegExp('^' + newUserData.username + '$', 'i')
    })
    if (findUserByUsername) {
      throw {
        status: false,
        msg: 'Username sudah digunakan!'
      }
    }

    // cek duplicate email
    const findUserByEmail = await userRepository.findUserByEmail(newUserData.email)
    if (findUserByEmail) {
      throw {
        status: false,
        msg: 'Email sudah digunakan!'
      }
    }

    // cek match password
    if (newUserData.password !== newUserData.confirmPassword) {
      throw {
        status: false,
        msg: 'Konfirmasi password tidak sama!'
      }
    }

    // hash password
    const hashPassword = await bcrypt.hash(newUserData.password, 10)

    // get role user (default role user)
    const role = await Role.findOne({ roleName: 'user' })
    if (!role) {
      throw {
        status: false,
        msg: 'Type role user not found'
      }
    }

    const user = await userRepository.insertUser({
      username: newUserData.username,
      email: newUserData.email,
      password: hashPassword,
      roleId: role._id
    })

    return user
  } catch (error) {
    throw error
  }
}

const loginUser = async (userData) => {
  try {
    // cek email
    const user = await userRepository.findUserByEmail(userData.email)
    if (!user) {
      throw {
        status: false,
        msg: 'email / password salah!'
      }
    }

    // cek password
    const matchPassword = await bcrypt.compare(userData.password, user.password)
    if (!matchPassword) {
      throw {
        status: false,
        msg: 'email / password salah'
      }
    }

    // cek verify account
    const verify = await userRepository.checkVerifyAccountUser(user._id)
    if (!verify) {
      throw {
        status: false,
        msg: 'Akun anda belum terverifikasi, cek email anda!'
      }
    }

    const data = {
      userId: user._id,
      username: user.username,
      email: user.email,
      roleId: user.roleId
    }

    // set access token
    const accessToken = jwt.sign(data, process.env.ACCESS_TOKEN, {
      expiresIn: '15s'
    })
    const refreshToken = jwt.sign(data, process.env.REFRESH_TOKEN, {
      expiresIn: '1d'
    })

    // update refresh token
    await userRepository.updateRefreshToken(data.userId, refreshToken)

    return { accessToken, refreshToken }
  } catch (error) {
    throw error
  }
}

const verifyEmail = async (userId, userToken) => {
  try {

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw {
        status: false,
        msg: 'Invalid Link id user'
      }
    }

    // cek user
    const user = await userRepository.findUserById(new mongoose.Types.ObjectId(userId))
    if (!user) {
      throw {
        status: false,
        msg: 'Invalid Link user'
      }
    }

    // cek token
    const token = await authRepository.findTokenByUser(userId, userToken)
    if (!token) {
      throw {
        status: false,
        msg: 'Invalid Link id token'
      }
    }

    // cek token exp
    if (token.verifyExp < Date.now()) {
      await authRepository.removeTokenExp(userId, userToken)
      throw {
        status: false,
        msg: 'Token expired, silahkan registrasi ulang!'
      }
    }

    const verify = await authRepository.updateVerifyEmail(userId, userToken)
    return verify
  } catch (error) {
    throw error
  }
}

export const authService = {
  createUser,
  verifyEmail,
  loginUser,
}