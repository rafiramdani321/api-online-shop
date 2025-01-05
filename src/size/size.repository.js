import sizeAll from '../../models/size.model.js'
import sizeProductModel from '../../models/sizeProduct.model.js'

const findAllSizes = async () => {
  const sizes = await sizeAll.find({})
  return sizes
}

export const sizeRepository = {
  findAllSizes,
}

