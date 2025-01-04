import Cart from "../../models/cart.model.js";
import Product from "../../models/product.model.js";

const findCartByUserId = async (userId) => {
  const carts = await Cart.find({ userId }).populate('productId').populate('size')
  return carts
}

const insertCart = async (dataProduct) => {
  const cartProduct = await new Cart({
    size: dataProduct.cartSizeId,
    qty: dataProduct.qty,
    noted: dataProduct.cartNote,
    total: dataProduct.total,
    productId: dataProduct.idProduct,
    userId: dataProduct.idUser
  }).save()
  return cartProduct
}

const deleteCartById = async (idCart) => {
  const cartProduct = await Cart.findByIdAndDelete(idCart)
  return cartProduct
}

const deleteCartsByProductIds = async (productIds) => {
  const carts = await Cart.deleteMany({ productId: { $in: productIds } })

  return carts
}

export const cartRepository = {
  insertCart,
  findCartByUserId,
  deleteCartById,
  deleteCartsByProductIds,
} 