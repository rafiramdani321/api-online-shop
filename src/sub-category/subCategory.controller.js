import { jwtDecode } from "jwt-decode"
import { subCategoryService } from "./subCategory.service.js"

const getSubCategories = async (req, res) => {
  try {
    let { page, limit, column, sortDirection, filter_search, search } = req.query
    const subCategories = await subCategoryService.getAllSubCategories(page, limit, column, sortDirection, filter_search, search)
    res.status(200).json({
      status: 200,
      data: subCategories.data,
      page: subCategories.page,
      limit: subCategories.limit,
      totalRows: subCategories.totalRows,
      totalPage: subCategories.totalPage
    })
  } catch (error) {
    console.log(error)
    res.status(400).send(error)
  }
}

const getSubCategoryById = async (req, res) => {
  try {
    const subCategoryId = req.params.id
    const subCategory = await subCategoryService.getSubCategoryById(subCategoryId)
    res.status(200).json(subCategory)
  } catch (error) {
    res.status(400).json({
      status: false,
      msg: error.message
    })
  }
}

const getSubCategoriesByCategoryId = async (req, res) => {
  try {
    const categoryId = req.params.id
    const subCategories = await subCategoryService.getSubCategoriesByCategoryId(categoryId)
    res.status(200).json(subCategories)
  } catch (error) {
    res.status(400).json({
      status: false,
      msg: error.message
    })
  }
}

const addSubCategory = async (req, res) => {
  try {
    const newSubCategory = req.body
    const token = req.cookies.refreshToken
    const decodeToken = await jwtDecode(token)

    const data = {
      newSubCategory, user: decodeToken
    }
    await subCategoryService.createSubCategory(data)

    res.status(201).json({
      status: true,
      msg: 'Sub category added successfully'
    })
  } catch (error) {
    res.status(400).json({
      msg: error.message
    })
  }
}

const editSubCategoryById = async (req, res) => {
  try {
    const subCategoryId = req.params.id
    const subCategoryData = req.body

    await subCategoryService.editSubCategoryById(subCategoryId, subCategoryData)
    res.status(201).json({
      status: true,
      msg: 'Sub category changed successfully!',
    })
  } catch (error) {
    res.status(400).json({
      status: false,
      msg: error.message
    })
  }
}

const deleteSubCategoryById = async (req, res) => {
  try {
    const subCategoryId = req.params.id
    const token = req.cookies.refreshToken
    const decodeToken = await jwtDecode(token)

    const data = {
      subCategoryId, user: decodeToken
    }
    await subCategoryService.deleteSubCategoryById(data)

    res.status(200).json({
      status: true,
      msg: 'Sub category successfully deleted!!'
    })
  } catch (error) {
    console.log(error)
    res.status(400).json({
      status: false,
      msg: error.message
    })
  }
}

export const subCategoryController = {
  getSubCategories,
  getSubCategoryById,
  getSubCategoriesByCategoryId,
  addSubCategory,
  editSubCategoryById,
  deleteSubCategoryById,
}