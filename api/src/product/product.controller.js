import { productsService } from "./product.service.js"
import path from 'path'
import { jwtDecode } from 'jwt-decode'

const getProducts = async (req, res) => {
  try {
    let { page, limit, column, sortDirection, filter_search, search, product_realese, minPrice, maxPrice, sizes } = req.query
    const products = await productsService.getAllProducts(page, limit, column, sortDirection, filter_search, search, product_realese, minPrice, maxPrice, sizes)
    res.status(200).json({
      status: true,
      data: products.data,
      page: products.page,
      limit: products.limit,
      totalRows: products.totalRows,
      totalPage: products.totalPage,
      msg: "Data fetched product successfully",
    })
  } catch (error) {
    console.log(error)
    res.status(400).json({
      status: false,
      msg: error.message
    })
  }
}

const getProductById = async (req, res) => {
  try {
    const productId = req.params.productId

    const product = await productsService.getProductById(productId)
    res.json(product)
  } catch (error) {
    res.status(400).json({
      status: false,
      msg: error.message
    })
  }
}

const getProductBySlug = async (req, res) => {
  try {
    const productSlug = req.params.productSlug

    const product = await productsService.getProductBySlug(productSlug)
    res.json(product)
  } catch (error) {
    res.status(400).json({
      status: false,
      msg: error.message
    })
  }
}

const getProductByCategoryId = async (req, res) => {
  try {
    const idCategory = req.params.id
    const product = await productsService.getProductByCategoryId(idCategory)
    res.json({
      status: true,
      data: product
    })
  } catch (error) {
    res.status(400).json({
      status: false,
      msg: error.message
    })
  }
}

const getProductByCategorySlug = async (req, res) => {
  try {
    let { page, limit, column, sortDirection, search, product_realese, slug, minPrice, maxPrice, sizes } = req.query
    const product = await productsService.getProductByCategorySlug(page, limit, column, sortDirection, search, product_realese, slug, minPrice, maxPrice, sizes)
    res.status(200).json(product)
  } catch (error) {
    res.status(400).json({
      status: false,
      msg: error.message
    })
  }
}

const getProductBySubCategorySlug = async (req, res) => {
  try {
    let { page, limit, column, sortDirection, search, product_realese, slug, minPrice, maxPrice, sizes } = req.query
    const product = await productsService.getProductBySubCategorySlug(page, limit, column, sortDirection, search, product_realese, slug, minPrice, maxPrice, sizes)
    res.status(200).json(product)
  } catch (error) {
    res.status(400).json({
      status: false,
      msg: error.message
    })
  }
}

const addProduct = async (req, res) => {
  try {
    if (req.files == null) throw Error("Tidak ada file yang diupload!")

    const newProduct = req.body
    const files = req.files
    const file = files?.file
    const fileSize = file?.data?.length
    const ext = path.extname(file.name)
    const fileName = file.md5 + ext
    const url = `${req.protocol}://${req.get('host')}/images/${fileName}`
    const allowType = ['.png', '.jpg', '.jpeg']
    const token = req.cookies.refreshToken

    const decodeToken = await jwtDecode(token)

    const dataNewProduct = {
      newProduct, fileSize, url, allowType, fileName, ext, file, user: decodeToken
    }

    await productsService.createProduct(dataNewProduct)
    res.status(200).json({
      status: true,
      msg: 'Produk berhasil ditambahkan!'
    })

  } catch (error) {
    console.log(error)
    res.status(400).json({
      status: false,
      msg: error.message
    })
  }
}

const editProduct = async (req, res) => {
  try {
    const reqFiles = req.files
    const idProduct = req.params.id
    const body = req.body
    const reqProtocol = req.protocol
    const reqGetHost = req.get('host')
    const token = req.cookies.refreshToken

    const decodeToken = await jwtDecode(token)

    const dataProduct = {
      reqFiles, idProduct, body, reqProtocol, reqGetHost, user: decodeToken
    }

    await productsService.editProduct(dataProduct)
    res.status(200).json({
      status: true,
      msg: 'Produk berhasil diubah!'
    })
  } catch (error) {
    console.log(error)
    res.status(400).json({
      status: false,
      msg: error.message
    })
  }
}

const deleteProduct = async (req, res) => {
  try {
    const productId = req.params.id
    const token = req.cookies.refreshToken
    const decodeToken = await jwtDecode(token)

    const dataProduct = {
      productId,
      user: decodeToken
    }
    await productsService.deleteProductById(dataProduct)
    res.status(200).json({
      status: true,
      msg: 'Produk berhasil dihapus!'
    })
  } catch (error) {
    res.status(400).json({
      status: false,
      msg: error.message
    })
  }
}

const getSizesProduct = async (req, res) => {
  try {
    const sizeProduct = await productsService.getSizesProduct()
    res.status(200).json({
      status: true,
      data: sizeProduct
    })
  } catch (error) {
    res.status(400).json({
      status: false,
      msg: error.message
    })
  }
}

const getSizeProductById = async (req, res) => {
  try {
    const idSizeProduct = req.params.id

    const sizeProduct = await productsService.getSizeProductById(idSizeProduct)
    res.json({
      status: true,
      data: sizeProduct
    })
  } catch (error) {
    res.status(400).json({
      status: false,
      msg: error.message
    })
  }
}

const addSizeProduct = async (req, res) => {
  try {
    const dataProduct = req.body

    await productsService.createSizeProduct(dataProduct)
    res.status(200).json({
      status: true,
      msg: 'size and stock added successfully!'
    })
  } catch (error) {
    res.status(400).json({
      status: false,
      msg: error.message
    })
  }
}

const editSizeProductById = async (req, res) => {
  try {
    const dataSizeProduct = req.body
    await productsService.editSizeProductById(dataSizeProduct)
    res.status(200).json({
      status: true,
      msg: 'size and stock changed successfully!'
    })
  } catch (error) {
    res.status(400).json({
      status: false,
      msg: error.message
    })
  }
}

const deleteSizeProductById = async (req, res) => {
  try {
    const idSizeProduct = req.params.id
    await productsService.deleteSizeProductById(idSizeProduct)
    res.status(200).json({
      status: true,
      msg: 'ukuran dan stok berhasil dihapus!'
    })
  } catch (error) {
    res.status(400).json({
      status: false,
      msg: error.message
    })
  }
}

const getProductStatusRealese = async (req, res) => {
  try {
    const productStatusRealese = await productsService.getProductStatusRealese()
    res.status(200).json({
      status: true,
      data: productStatusRealese
    })
  } catch (error) {
    console.log(error)
    res.status(400).json({
      status: false,
      msg: error.message
    })
  }
}

const editProductRealese = async (req, res) => {
  try {
    const data = req.body
    const productRealese = await productsService.updateProductRealese(data)
    res.status(200).json({
      status: true,
      msg: productRealese.msg
    })
  } catch (error) {
    res.status(400).json({
      status: false,
      msg: error.message || error
    })
  }
}

export const productContollers = {
  getProducts,
  getProductById,
  getProductBySlug,
  getProductByCategoryId,
  getProductByCategorySlug,
  getProductBySubCategorySlug,
  addProduct,
  editProduct,
  deleteProduct,
  getSizeProductById,
  addSizeProduct,
  editSizeProductById,
  deleteSizeProductById,
  getProductStatusRealese,
  editProductRealese,
  getSizesProduct
}