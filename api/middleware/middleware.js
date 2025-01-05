import jwt from "jsonwebtoken";
import { jwtDecode } from "jwt-decode";

export const verifyTokenAccessAdmin = async (req, res, next) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]
  if (token == null) return res.sendStatus(401)
  jwt.verify(token, process.env.ACCESS_TOKEN, (err, decoded) => {
    if (err) return res.status(401).json({ status: false, msg: 'Token tidak valid atau kadaluarsa' })
    if (decoded?.roleId?.roleName !== 'admin') {
      return res.sendStatus(403)
    } else {
      req.email = decoded.email
      next()
    }
  })
}

export const verifyTokenAccess = (req, res, next) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]
  if (token == null) return res.sendStatus(401)
  jwt.verify(token, process.env.ACCESS_TOKEN, (err, decoded) => {
    if (err) return res.status(401).json({ status: false, msg: 'Token tidak valid atau kadaluarsa' })
    req.email = decoded.email
    req.userId = decoded.userId
    next()
  })
}

// export const verifyUserAccessEdited = (req, res, next) => {
//   const authHeader = req.headers['authorization']
//   const token = authHeader && authHeader.split(' ')[1]
//   if (token == null) return res.sendStatus(401)
//   jwt.verify(token, process.env.ACCESS_TOKEN, (err, decoded) => {
//     if (err) return res.status(401).json({ status: false, msg: 'Token tidak valid atau kadaluarsa' })
//     console.log(decoded)
//   })
// }

export const checkAuthAccessEditedUser = (req, res, next) => {
  const token = req.cookies.refreshToken
  const user = jwtDecode(token)
  if (user.userId !== req.body.userId) {
    return res.status(401).json({
      status: false,
      msg: 'unauthorize'
    })
  }
  next()
}