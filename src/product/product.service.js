import mongoose from "mongoose"
import { productsRepository } from "./product.repository.js"
import path from 'path'
import { unlink } from "fs"
import fs from 'fs'

const getAllProducts = async (page, limit, column, sortDirection, filter_search, search, product_realese, minPrice, maxPrice, sizes) => {
  if (!page) {
    page = 1
  }
  if (!limit) {
    limit = 10
  }
  if (!column) {
    column = 'created_at'
  }
  if (!sortDirection) {
    sortDirection = 'desc'
  }
  if (!filter_search) {
    filter_search = 'all'
  }

  const products = await productsRepository.findAllProducts(page, limit, column, sortDirection, filter_search, search, product_realese, minPrice, maxPrice, sizes)
  return products
}

const getProductById = async (id) => {
  // cek type id
  if (!mongoose.Types.ObjectId.isValid(id)) throw Error('Product tidak ditemukan!')

  const products = await productsRepository.findProductById(id)
  if (!products) throw Error('Produk tidak ditemukan!')

  return products
}

const getProductBySlug = async (slug) => {
  const product = await productsRepository.findProductBySlug(slug)
  if (!product) throw Error('Product tidak ditemukan!')
  return product
}

const getProductByCategoryId = async (idCategory) => {
  const product = await productsRepository.findProductByCategoryId(idCategory)
  if (!product) throw Error('Product tidak ditemukan!')
  return product
}

const getProductByCategorySlug = async (page, limit, column, sortDirection, search, product_realese, slug, minPrice, maxPrice, sizes) => {
  if (!page) {
    page = 0
  }
  if (!limit) {
    limit = 10
  }
  if (!column) {
    column = 'created_at'
  }
  if (!sortDirection) {
    sortDirection = 'desc'
  }

  if (!slug) {
    throw Error('Product not found!')
  }
  const products = await productsRepository.findProductByCategorySlug(page, limit, column, sortDirection, search, product_realese, slug, minPrice, maxPrice, sizes)
  return products
}

const getProductBySubCategorySlug = async (page, limit, column, sortDirection, search, product_realese, slug, minPrice, maxPrice, sizes) => {
  if (!page) {
    page = 0
  }
  if (!limit) {
    limit = 10
  }
  if (!column) {
    column = 'created_at'
  }
  if (!sortDirection) {
    sortDirection = 'desc'
  }

  if (!slug) {
    throw Error('Product not found!')
  }
  const products = await productsRepository.findProductBySubCategorySlug(page, limit, column, sortDirection, search, product_realese, slug, minPrice, maxPrice, sizes)
  return products
}

const createProduct = async (dataNewProduct) => {
  // cek type file
  if (!(dataNewProduct.allowType).includes((dataNewProduct.ext).toLowerCase())) {
    throw Error("Yang anda upload bukan gambar!")
  }
  // cek size file
  if (dataNewProduct.fileSize > 6000000) {
    throw Error('Ukuran gambar tidak boleh datri 5 MB')
  }

  // cek duplicate title
  const findProductByTitle = await productsRepository.findProductByTitle(
    { $regex: new RegExp('^' + dataNewProduct.newProduct.title + '$', 'i') }
  )
  if (findProductByTitle) throw Error('Title sudah digunakan!')

  // cek duplicate slug
  const findProductBySlug = await productsRepository.findProductBySlug(dataNewProduct.newProduct.slug)
  if (findProductBySlug.product !== null) throw Error('Slug sudah digunakan!')

  // save file image
  dataNewProduct.file.mv(`./public/images/${dataNewProduct.fileName}`, async (err) => {
    if (err) throw Error(err)
    const product = await productsRepository.insertProduct(dataNewProduct)
    return product
  })
}

const editProduct = async (dataProduct) => {
  // cek type id
  const product = await getProductById(dataProduct.idProduct)

  // cek duplicate title
  const findProductByTitle = await productsRepository.findProductByTitle(
    { $regex: new RegExp('^' + dataProduct.body.title + '$', 'i') }
  )
  if (findProductByTitle && (dataProduct.body.title).toLowerCase() !== (dataProduct.body.oldTitle).toLowerCase()) {
    throw Error('Title sudah digunakan!')
  }

  // cek duplicate slug
  const findProductBySlug = await productsRepository.findProductBySlug(dataProduct.body.slug)
  if (findProductBySlug.product && (dataProduct.body.slug).toLowerCase() !== (dataProduct.body.oldSlug).toLowerCase()) {
    throw Error('Slug sudah digunakan!')
  }

  let fileName
  let file
  if (dataProduct.reqFiles === null) {
    fileName = dataProduct.body.image
  } else {
    file = dataProduct.reqFiles.image
    const fileSize = file.data.length
    const ext = path.extname(file.name)
    fileName = file.md5 + ext
    const allowType = ['.png', '.jpg', '.jpeg']

    // validation ext image
    if (!allowType.includes(ext.toLowerCase())) {
      throw Error('Yang anda inputkan bukan Gambar!! (png, jpg, jpeg)')
    }
    // validation file size
    if (fileSize > 6000000) throw Error('Gambar tidak boleh lebih dari 6 MB')

    // update image
    const filePath = `./public/images/${product.product.image}`
    unlink(filePath, (err) => {
      if (err) return console.log(err)
    })

    file.mv(`./public/images/${fileName}`, (err) => {
      if (err) return console.log(err)
    })
  }

  const url = `${dataProduct.reqProtocol}://${dataProduct.reqGetHost}/images/${fileName}`
  const dataNewProduct = {
    idProduct: dataProduct.idProduct,
    title: dataProduct.body.title,
    slug: dataProduct.body.slug,
    description: dataProduct.body.description,
    price: dataProduct.body.price,
    id_category: dataProduct.body.category,
    id_sub_category: dataProduct.body.subCategoryId,
    url,
    image: fileName,
    user: dataProduct.user
  }

  const newProduct = await productsRepository.updateProduct(dataNewProduct)
  return newProduct
}

const deleteProductById = async (dataProduct) => {
  // cek type id
  await getProductById(dataProduct.productId)
  const product = await productsRepository.deleteProductById(dataProduct)

  const filePath = `./public/images/${product.image}`;
  const deletedFileName = `${path.basename(filePath, path.extname(filePath))}-deleted${path.extname(filePath)}`;
  const deletedFilePath = path.join(path.dirname(filePath), deletedFileName);

  fs.rename(filePath, deletedFilePath, (err) => {
    if (err) {
      console.error(err);
    } else {
      console.log(`File ${product.image} berhasil dihapus dan diubah namanya menjadi ${deletedFileName}`);
    }
  });
  return product
}

const getSizeProductById = async (idSizeProduct) => {
  // cek type id
  if (!mongoose.Types.ObjectId.isValid(idSizeProduct)) {
    throw Error('Size produk tidak ditemukan!')
  }
  const sizeProduct = await productsRepository.findSizeProductById(idSizeProduct)
  if (!sizeProduct) throw Error('Size produk tidak ditemukan!')

  return sizeProduct
}

const getSizeProductByIdProduct = async (idProduct) => {
  const sizeProduct = await productsRepository.findSizeProductByIdProductAndSize(idProduct)
}

const createSizeProduct = async (dataProduct) => {
  // cek duplicate size
  const findSizeProductByIdProduct = await productsRepository.findSizeProductByIdProductAndSize(dataProduct)
  if (findSizeProductByIdProduct) {
    throw Error('size already exists!')
  }

  const sizeProduct = await productsRepository.insertSizeProduct(dataProduct)
  return sizeProduct
}

const editSizeProductById = async (dataSizeProduct) => {
  await getSizeProductById(dataSizeProduct.idSizeProduct)

  const duplicateSize = await productsRepository.findSizeProductByIdProductAndSize(dataSizeProduct)
  if (duplicateSize && duplicateSize.size !== dataSizeProduct.oldSize) {
    throw new Error('Size product sudah ada!')
  }

  if (dataSizeProduct.size === "") throw Error('Ukuran tidak boleh kosong!')
  if (dataSizeProduct.stock === "") throw Error('Stok tidak boleh kosong!')

  const sizeProduct = await productsRepository.updateSizeProduct(dataSizeProduct)
  return sizeProduct
}

const deleteSizeProductById = async (idSizeProduct) => {
  await getSizeProductById(idSizeProduct)
  const sizeProduct = await productsRepository.deleteSizeProductById(idSizeProduct)
  return sizeProduct
}

const getProductStatusRealese = async () => {
  const productRealese = await productsRepository.findAllProductStatusRealese()
  return productRealese
}

const updateProductRealese = async (data) => {
  await getProductById(data.productId)

  let productRealese
  const findStatusRealeseById = await productsRepository.findProductStatusRealeseById(data.statusRealeseId)
  if (findStatusRealeseById) {
    if (findStatusRealeseById.product_status_realese_title === 'realese') {
      // cek apakah product mempunyai size
      const findSizeProduct = await productsRepository.findAllSizesProductByIdProduct(data.productId)
      if (!findSizeProduct || findSizeProduct.length === 0) {
        throw {
          typeError: 'size product not found',
          msg: 'Cannot change the product status to realesed, because this product does not yet have a size. Please add the product size first!'
        }
      }
      productRealese = await productsRepository.updateProductStatusToRealese(data)
    } else if (findStatusRealeseById.product_status_realese_title === 'unrealese') {
      productRealese = await productsRepository.updateProductStatusToUnrealese(data)
    }
  }
  return productRealese
}

const getSizesProduct = async () => {
  const sizeProducts = await productsRepository.findAllSizeProduct()
  return sizeProducts
}

export const productsService = {
  getAllProducts,
  getProductById,
  getProductBySlug,
  getProductByCategoryId,
  getProductByCategorySlug,
  getProductBySubCategorySlug,
  createProduct,
  editProduct,
  deleteProductById,
  getSizeProductById,
  createSizeProduct,
  editSizeProductById,
  deleteSizeProductById,
  getProductStatusRealese,
  updateProductRealese,
  getSizesProduct,
}