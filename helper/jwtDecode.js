import jwt from 'jsonwebtoken';

export const decodedToken = async (token) => {
  try {
    const decode = jwt.verify(token, process.env.ACCESS_TOKEN)
    console.log(decode)
    return decode
  } catch (error) {
    console.log(error)
  }
}