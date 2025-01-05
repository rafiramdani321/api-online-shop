import { cartService } from "./cart.service.js"

const getCartsByUserId = async (req, res) => {
  try {
    const token = req.cookies.refreshToken
    const carts = await cartService.getCartsByUserIdService(token)
    res.status(200).json({
      status: true,
      data: carts
    })
  } catch (error) {
    res.status(400).json({
      status: false,
      msg: error.message
    })
  }
}

const addCartProduct = async (req, res) => {
  try {
    const dataProduct = req.body
    await cartService.addCartProduct(dataProduct)
    res.status(200).json({
      status: true,
      msg: 'Product berhasil ditambahkan ke keranjang!'
    })
  } catch (error) {
    console.log(error)
    res.status(400).json({
      status: false,
      msg: error.message
    })
  }
}

const deleteCartById = async (req, res) => {
  try {
    const cartId = req.params.id
    await cartService.deleteCartById(cartId)
    res.status(200).json({
      status: true,
      msg: 'Cart has been deleted!'
    })
  } catch (error) {
    res.status(400).json({
      status: false,
      msg: error.message
    })
  }
}

export const cartControllers = {
  getCartsByUserId,
  addCartProduct,
  deleteCartById,
}