import mongoose from "mongoose";
import Product from "../../models/product.model.js"
import productStatusRealese from "../../models/productStatusRealese.model.js";
import sizeProductModel from '../../models/sizeProduct.model.js'
import Categories from "../../models/category.mode.js";
import { categoryRepository } from "../category/category.repository.js";

const findAllProducts = async (page, limit, column, sortDirection, filter_search, search, product_realese, minPrice, maxPrice, sizes) => {
  const pageInt = parseInt(page)
  const limitInt = parseInt(limit)

  let queryOptions = {
    $and: [
      { 'product_status': true }
    ]
  };

  const findProductRealese = await productStatusRealese.findOne({ product_status_realese_title: product_realese });
  if (product_realese) {
    queryOptions.$and.push({
      'id_product_realese': findProductRealese?._id
    });
  }

  if (search) {
    let searchQuery = { $regex: new RegExp(search, 'i') };
    if (['title', 'slug', 'category.title', 'category.slug', 'sub_category.title', 'sub_category.slug'].includes(filter_search)) {
      queryOptions.$and.push({
        [filter_search]: searchQuery
      });
    } else {
      queryOptions.$and.push({
        $or: [
          { 'title': searchQuery },
          { 'slug': searchQuery },
          { 'category.title': searchQuery },
          { 'category.slug': searchQuery },
          { 'sub_category.title': searchQuery },
          { 'sub_category.slug': searchQuery }
        ]
      });
    }
  }

  if (minPrice && maxPrice) {
    queryOptions.$and.push({
      'price': {
        $gte: parseInt(minPrice),
        $lte: parseInt(maxPrice)
      }
    });
  }

  if (sizes) {
    const sizeArray = sizes.split(',').map(size => parseInt(size.trim()))
    queryOptions.$and.push({
      'sizes.size': { $in: sizeArray }
    })
  }

  let findProducts = await Product.aggregate([
    {
      $lookup: {
        from: 'categories',
        localField: 'id_category',
        foreignField: '_id',
        as: 'category'
      },
    },
    {
      $unwind: {
        path: '$category'
      }
    },
    {
      $lookup: {  // Menambahkan lookup ke SubCategories
        from: 'subcategories',
        localField: 'id_sub_category',
        foreignField: '_id',
        as: 'sub_category'
      }
    },
    {
      $unwind: {
        path: '$sub_category',
        preserveNullAndEmptyArrays: true // Menjaga array jika kosong atau bernilai null
      }
    },
    {
      $addFields: { // Menambahkan field baru jika subkategori adalah null
        sub_category: { $ifNull: ['$sub_category', { _id: null, title: null }] }
      }
    },
    {
      $lookup: {  // Menambahkan lookup ke productStatusRealese
        from: 'productstatusrealeses',
        localField: 'id_product_realese',
        foreignField: '_id',
        as: 'product_status_realese'
      }
    },
    {
      $unwind: {  // Unwind jika diperlukan
        path: '$product_status_realese'
      }
    },
    {
      $lookup: {
        from: 'sizeproducts',
        localField: '_id',
        foreignField: 'id_product',
        as: 'sizes'
      }
    },
    {
      $match: queryOptions
    },
    {
      $sort: {
        [column]: sortDirection === 'desc' ? -1 : 1
      }
    },
    {
      $facet: {
        data: [
          { $skip: (pageInt) * limitInt },
          { $limit: limitInt }
        ],
        totalRows: [
          {
            $count: 'count'
          }
        ]
      }
    }
  ])

  const totalRows = findProducts[0]?.totalRows[0]?.count;
  const totalPage = Math.ceil(totalRows / limitInt);

  return {
    data: findProducts[0].data,
    page: pageInt,
    limit: limitInt,
    totalRows,
    totalPage
  }
}

const findProductById = async (id) => {
  const product = await Product.findById(id).populate('id_category').populate('id_sub_category')
  const sizesProduct = await findAllSizesProductByIdProduct(id)
  return { product, sizesProduct }
}

const findProductByIds = async (ids) => {
  const products = await Product.find({ _id: { $in: ids } })
    .populate('id_category').populate('id_sub_category')

  return products
}

const findProductByTitle = async (title) => {
  const product = await Product.findOne({ title, product_status: true })
  return product
}

const findProductBySlug = async (slug) => {
  const product = await Product.findOne({ slug, product_status: true }).populate('id_category').populate('id_sub_category')
  const sizesProduct = await findAllSizesProductByIdProduct(product?._id)
  return { product, sizesProduct }
}

const findProductByCategoryId = async (idCategory) => {
  const product = await Product.find({ id_category: idCategory })
  return product
}

const findProductByCategorySlug = async (page, limit, column, sortDirection, search, product_realese, slug, minPrice, maxPrice, sizes) => {
  const pageInt = parseInt(page)
  const limitInt = parseInt(limit)

  let queryOptions = {
    $and: [
      { 'category.slug': slug },
      { 'product_status': true }
    ]
  }

  const findProductRealese = await productStatusRealese.findOne({ product_status_realese_title: product_realese })
  if (product_realese) {
    queryOptions.$and.push({
      'id_product_realese': findProductRealese?._id
    })
  }

  if (search) {
    let searchQuery = { $regex: new RegExp(search, 'i') }
    queryOptions.$and.push({
      $or: [
        { 'title': searchQuery },
        { 'slug': searchQuery },
        { 'category.title': searchQuery },
        { 'category.slug': searchQuery },
        { 'sub_category.title': searchQuery },
        { 'sub_category.slug': searchQuery },
      ]
    })
  }

  if (minPrice && maxPrice) {
    queryOptions.$and.push({
      'price': {
        $gte: parseInt(minPrice), $lte: parseInt(maxPrice)
      }
    })
  }

  if (sizes) {
    const sizeArray = sizes.split(',').map(size => parseInt(size.trim()))
    queryOptions.$and.push({
      'sizes.size': { $in: sizeArray }
    })
  }

  let findProductsByCategorySlug = await Product.aggregate([
    {
      $lookup: {
        from: 'categories',
        localField: 'id_category',
        foreignField: '_id',
        pipeline: [
          {
            $project: {
              _id: 1,
              title: 1,
              slug: 1,
              status_category: 1,
            }
          }
        ],
        as: 'category'
      }
    },
    {
      $unwind: "$category"
    },
    {
      $lookup: {
        from: 'subcategories',
        localField: 'id_sub_category',
        foreignField: '_id',
        pipeline: [
          {
            $project: {
              _id: 1,
              title: 1,
              slug: 1,
              id_category: 1,
              status_sub_category: 1
            }
          }
        ],
        as: 'sub_category'
      }
    },
    {
      $unwind: "$sub_category"
    },
    {
      $lookup: {
        from: 'productstatusrealeses',
        localField: 'id_product_realese',
        foreignField: '_id',
        as: 'product_status_realese'
      }
    },
    {
      $unwind: "$product_status_realese"
    },
    {
      $lookup: {
        from: 'sizeproducts',
        localField: '_id',
        foreignField: 'id_product',
        as: 'sizes'
      }
    },
    {
      $match: queryOptions
    },
    {
      $sort: {
        [column]: sortDirection === 'desc' ? -1 : 1
      }
    },
    {
      $facet: {
        data: [
          { $skip: (pageInt) * limitInt },
          { $limit: limitInt }
        ],
        totalRows: [
          {
            $count: 'count'
          }
        ]
      }
    }
  ]);

  const totalRows = findProductsByCategorySlug[0]?.totalRows[0]?.count
  const totalPage = Math.ceil(totalRows / limitInt)

  return {
    data: findProductsByCategorySlug[0].data,
    page: pageInt,
    limit: limitInt,
    totalRows,
    totalPage
  }

}

const findProductBySubCategorySlug = async (page, limit, column, sortDirection, search, product_realese, slug, minPrice, maxPrice, sizes) => {
  const pageInt = parseInt(page)
  const limitInt = parseInt(limit)

  let queryOptions = {
    $and: [
      { 'sub_category.slug': slug },
      { 'product_status': true }
    ]
  }

  const findProductRealese = await productStatusRealese.findOne({ product_status_realese_title: product_realese })
  if (product_realese) {
    queryOptions.$and.push({
      'id_product_realese': findProductRealese?._id
    })
  }

  if (search) {
    let searchQuery = { $regex: new RegExp(search, 'i') }
    queryOptions.$and.push({
      $or: [
        { 'title': searchQuery },
        { 'slug': searchQuery },
        { 'category.title': searchQuery },
        { 'category.slug': searchQuery },
        { 'sub_category.title': searchQuery },
        { 'sub_category.slug': searchQuery }
      ]
    })
  }

  if (minPrice && maxPrice) {
    queryOptions.$and.push({
      'price': {
        $gte: parseInt(minPrice), $lte: parseInt(maxPrice)
      }
    })
  }

  if (sizes) {
    const sizeArray = sizes.split(',').map(size => parseInt(size.trim()))
    queryOptions.$and.push({
      'sizes.size': { $in: sizeArray }
    })
  }

  let products = await Product.aggregate([
    {
      $lookup: {
        from: 'categories',
        localField: 'id_category',
        foreignField: '_id',
        pipeline: [
          {
            $project: {
              _id: 1,
              title: 1,
              slug: 1,
              status_category: 1,
            }
          }
        ],
        as: 'category'
      }
    },
    {
      $unwind: "$category"
    },
    {
      $lookup: {
        from: 'subcategories',
        localField: 'id_sub_category',
        foreignField: '_id',
        pipeline: [
          {
            $project: {
              _id: 1,
              title: 1,
              slug: 1,
              id_category: 1,
              status_sub_category: 1
            }
          }
        ],
        as: 'sub_category'
      }
    },
    {
      $unwind: "$sub_category"
    },
    {
      $lookup: {
        from: 'productstatusrealeses',
        localField: 'id_product_realese',
        foreignField: '_id',
        as: 'product_status_realese'
      }
    },
    {
      $unwind: "$product_status_realese"
    },
    {
      $lookup: {
        from: 'sizeproducts',
        localField: '_id',
        foreignField: 'id_product',
        as: 'sizes'
      }
    },
    {
      $match: queryOptions
    },
    {
      $sort: {
        [column]: sortDirection === 'desc' ? -1 : 1
      }
    },
    {
      $facet: {
        data: [
          { $skip: (pageInt) * limitInt },
          { $limit: limitInt }
        ],
        totalRows: [
          {
            $count: 'count'
          }
        ]
      }
    }
  ])

  const totalRows = products[0]?.totalRows[0]?.count
  const totalPage = Math.ceil(totalRows / limitInt)

  return {
    data: products[0].data,
    page: pageInt,
    limit: limitInt,
    totalRows,
    totalPage
  }
}

const insertProduct = async (productData) => {

  const findProductStatusByTitle = await productStatusRealese.findOne({ product_status_realese_title: 'unrealese' })
  const price = (productData.newProduct.price).replace(/\./g, '')

  const product = await new Product({
    title: productData.newProduct.title,
    slug: productData.newProduct.slug,
    description: productData.newProduct.description,
    id_category: productData.newProduct.category,
    id_sub_category: productData.newProduct.subCategoryId ? productData.newProduct.subCategoryId : null,
    price: parseInt(price),
    image: productData.fileName,
    url: productData.url,
    id_product_realese: findProductStatusByTitle?._id || null,
    created_by: productData.user.email,
    updated_by: productData.user.email
  }).save()
  return product
}

const updateProduct = async (dataNewProduct) => {
  const product = await Product.updateOne({ _id: dataNewProduct.idProduct }, {
    $set: {
      title: dataNewProduct.title,
      slug: dataNewProduct.slug,
      description: dataNewProduct.description,
      price: dataNewProduct.price,
      id_category: dataNewProduct.id_category,
      id_sub_category: dataNewProduct.id_sub_category ? dataNewProduct.id_sub_category : null,
      url: dataNewProduct.url,
      image: dataNewProduct.image,
      updated_by: dataNewProduct.user.email,
    }
  })
  return product
}

const deleteProductById = async (dataProduct) => {
  const product = await Product.findByIdAndUpdate({ _id: dataProduct.productId }, {
    $set: { product_status: 0, deleted_by: dataProduct.user.email, deletedAt: Date.now() }
  })
  return product
}

const findSizeProductById = async (idSizeProduct) => {
  const sizeProduct = await sizeProductModel.findOne({ _id: idSizeProduct })
  return sizeProduct
}

const findSizeProductByIdProductAndSize = async (dataProduct) => {
  const sizeProduct = await sizeProductModel.findOne({
    id_product: dataProduct.idProduct,
    size: dataProduct?.addSize || dataProduct?.size
  })
  return sizeProduct
}

const findAllSizesProductByIdProduct = async (id) => {
  const sizesProduct = await sizeProductModel.find({
    id_product: id
  }).sort({ size: 1 })
  return sizesProduct
}

const insertSizeProduct = async (dataProduct) => {
  const sizeProduct = await new sizeProductModel({
    size: dataProduct.addSize,
    id_product: dataProduct.idProduct,
    stock: dataProduct.addStock
  }).save()
  return sizeProduct
}

const updateSizeProduct = async (dataSizeProduct) => {
  const sizeProduct = await sizeProductModel.updateOne({
    _id: dataSizeProduct.idSizeProduct
  }, {
    $set: { size: dataSizeProduct.size, stock: dataSizeProduct.stock }
  })
  return sizeProduct
}

const deleteSizeProductById = async (idSizeProduct) => {
  const sizeProduct = await sizeProductModel.findByIdAndDelete({ _id: idSizeProduct })
  return sizeProduct
}

const findAllProductStatusRealese = async () => {
  const productStatus = await productStatusRealese.find({})
  return productStatus
}

const findProductStatusRealeseById = async (id) => {
  const productStatus = await productStatusRealese.findById(id)
  return productStatus
}

const updateProductStatusToRealese = async (data) => {
  await Product.updateOne({ _id: data.productId }, {
    $set: { id_product_realese: new mongoose.Types.ObjectId(data.statusRealeseId) }
  })
  return {
    msg: 'The product was successfully changed to released'
  }
}

const updateProductStatusToUnrealese = async (data) => {
  await Product.updateOne({ _id: data.productId }, {
    $set: { id_product_realese: new mongoose.Types.ObjectId(data.statusRealeseId) }
  })
  return {
    msg: 'The product has been successfully changed to unreleased'
  }
}

const findAllSizeProduct = async () => {
  const sizeProducts = await sizeProductModel.find()
  return sizeProducts
}

const updateQuantitySizeProduct = async (data) => {
  for (const item of data) {
    const sizeProduct = await sizeProductModel.findById(item.size)
    if (sizeProduct) {
      sizeProduct.stock -= item.qty
      await sizeProduct.save()
    }
  }
}

export const productsRepository = {
  findAllProducts,
  findProductById,
  findProductByTitle,
  findProductBySlug,
  findProductByCategoryId,
  findProductByCategorySlug,
  findProductBySubCategorySlug,
  insertProduct,
  updateProduct,
  deleteProductById,
  findSizeProductById,
  findAllSizesProductByIdProduct,
  findSizeProductByIdProductAndSize,
  insertSizeProduct,
  updateSizeProduct,
  deleteSizeProductById,
  findAllProductStatusRealese,
  findProductStatusRealeseById,
  updateProductStatusToRealese,
  updateProductStatusToUnrealese,
  findProductByIds,
  updateQuantitySizeProduct,
  findAllSizeProduct
}