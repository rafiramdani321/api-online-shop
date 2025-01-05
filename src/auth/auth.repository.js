import { sendMail } from "../../config/verifEmail.js"
import Tokens from "../../models/token.model.js"
import dotenv from 'dotenv'
import Users from "../../models/users.model.js"

dotenv.config()

const createTokenRegistrasi = async (tokenData) => {
  const token = await new Tokens({
    userId: tokenData.userId,
    token: tokenData.token,
    verifyExp: tokenData.verifyExp
  }).save()

  // send email
  const message = `Verifikasi akun anda : ${process.env.BASE_URL}/user/verify/${token.userId}/${token.token}`
  await sendMail(tokenData.email, `Verifikasi account : `, message)
}

// find tokens by user id & token
const findTokenByUser = async (userId, userToken) => {
  const token = await Tokens.findOne({
    userId,
    token: userToken
  })
  return token
}

// remove token exp
const removeTokenExp = async (userId, userToken) => {
  await Tokens.findOneAndRemove({
    userId,
    token: userToken
  })
  await Users.findOneAndRemove({
    _id: userId
  })
}

// update verify email
const updateVerifyEmail = async (userId, userToken) => {
  const verify = await Users.updateOne({ _id: userId }, {
    $set: { verified: true }
  })
  await Tokens.findOneAndRemove({ userId, token: userToken })

  return verify
}

export const authRepository = {
  createTokenRegistrasi,
  findTokenByUser,
  updateVerifyEmail,
  removeTokenExp,
}