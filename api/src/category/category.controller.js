import { jwtDecode } from "jwt-decode"
import { categoryService } from "./category.service.js"

const getCategories = async (req, res) => {
  try {
    let { page, limit, column, sortDirection, filter_search, search } = req.query
    const categories = await categoryService.getAllCategories(page, limit, column, sortDirection, filter_search, search)
    res.status(200).json({
      status: 200,
      data: categories.data,
      page: categories.page,
      limit: categories.limit,
      totalRows: categories.totalRows,
      totalPage: categories.totalPage
    })
  } catch (error) {
    res.status(400).json({
      msg: error.message
    })
  }
}

const getCategoryById = async (req, res) => {
  try {
    const categoryId = req.params.id
    const category = await categoryService.getCategoryById(categoryId)
    res.status(200).json(category)
  } catch (error) {
    res.status(400).json({
      msg: error.message
    })
  }
}

const addCategory = async (req, res) => {
  try {
    const newCategoryData = req.body
    const token = req.cookies.refreshToken
    const decodeToken = await jwtDecode(token)

    const data = {
      newCategoryData, user: decodeToken
    }

    const category = await categoryService.createCategory(data)
    res.status(201).json({
      msg: 'Category added successfully!',
      data: category,
      status: true
    })
  } catch (error) {
    res.status(400).json({
      msg: error.message
    })
  }
}

const editCategoryById = async (req, res) => {
  try {
    const categoryId = req.params.id
    const categoryData = req.body

    const category = await categoryService.editCategoryById(categoryId, categoryData)
    res.status(201).json({
      status: true,
      msg: 'Category updated successfully!',
      data: category
    })
  } catch (error) {
    res.status(400).json({
      msg: error.message
    })
  }
}

const deleteCategoryById = async (req, res) => {
  try {
    const categoryId = req.params.id
    const token = req.cookies.refreshToken
    const decodeToken = await jwtDecode(token)

    const data = {
      categoryId, user: decodeToken
    }
    await categoryService.deleteCategory(data)

    res.status(200).json({
      msg: 'The category and its subcategories have been successfully deleted!',
      status: true
    })
  } catch (error) {
    console.log(error)
    res.status(400).json({
      msg: error.message
    })
  }
}

export const categoryController = {
  getCategories,
  getCategoryById,
  addCategory,
  editCategoryById,
  deleteCategoryById,
}