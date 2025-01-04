import { sizeRepository } from "./size.repository.js"

const getSizes = async () => {
  const sizes = await sizeRepository.findAllSizes()
  return sizes
}

export const sizesService = {
  getSizes,
}