import { cartRepository } from "./cart.repository.js"
import jwt from 'jsonwebtoken'

const getCartsByUserIdService = async (token) => {
  if (!token) {
    throw Error('Unauthorize')
  }
  return new Promise((resolve, reject) => {
    jwt.verify(token, process.env.REFRESH_TOKEN, async (err, decoded) => {
      if (err) {
        reject(new Error('Dilarang'));
      }

      try {
        const carts = await cartRepository.findCartByUserId(decoded.userId);
        resolve(carts);
      } catch (error) {
        reject(error);
      }
    });
  });
}

const addCartProduct = async (dataProduct) => {
  const cartProduct = await cartRepository.insertCart(dataProduct)
  return cartProduct
}

const deleteCartById = async (idCart) => {
  const cartProduct = cartRepository.deleteCartById(idCart)
  return cartProduct
}

export const cartService = {
  addCartProduct,
  getCartsByUserIdService,
  deleteCartById,
}