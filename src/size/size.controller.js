import { sizesService } from "./size.service.js"

const getSizes = async (req, res) => {
  try {
    const sizes = await sizesService.getSizes()
    res.status(200).json(sizes)
  } catch (error) {
    console.log(error)
  }
}

export const sizesControllers = {
  getSizes,
}