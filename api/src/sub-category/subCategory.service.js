import mongoose from "mongoose"
import { subCategoryRepository } from "./subCategory.repository.js"

const getAllSubCategories = async (page, limit, column, sortDirection, filter_search, search) => {
  if (!page) {
    page = 1
  }
  if (!limit) {
    limit = 10
  }
  if (!sortDirection) {
    sortDirection = 'desc'
  }
  if (!column) {
    column = 'created_at'
  }
  if (!filter_search) {
    filter_search = 'all'
  }

  const subCategories = await subCategoryRepository.findAllSubCategories(page, limit, column, sortDirection, filter_search, search)
  return subCategories
}

const getSubCategoryById = async (id) => {
  // cek type id
  if (!mongoose.Types.ObjectId.isValid(id)) throw Error('Sub category tidak ditemukan')

  const subCategory = await subCategoryRepository.findSubCategoryById(id)
  if (!subCategory) throw Error('Sub category tidak ditemukan')

  return subCategory
}

const getSubCategoriesByCategoryId = async (id) => {
  // cek type id
  if (!mongoose.Types.ObjectId.isValid(id)) throw Error('Sub category tidak ditemukan')

  const subCategory = await subCategoryRepository.findSubCategoriesByCategoryId(id)
  if (!subCategory) throw Error('Sub category tidak ditemukan')

  return subCategory
}

const createSubCategory = async (data) => {

  // cek sub category
  if (data.newSubCategory.categoryId === '' || data.newSubCategory.categoryId === 'Pilih Kategori') {
    throw Error('Pilih Kategori!')
  }

  // cek duplicate title
  const findSubCategoryByTitle = await subCategoryRepository.findSubCategoryByTitle({
    $regex: new RegExp('^' + data.newSubCategory.title + '$', 'i')
  })
  if (findSubCategoryByTitle) {
    throw Error('Title sudah digunakan!')
  }

  // cek duplicate slug
  const findSubCategoryBySlug = await subCategoryRepository.findSubCategoryBySlug(data.newSubCategory.slug)
  if (findSubCategoryBySlug) {
    throw Error('Slug sudah digunakan!')
  }

  const subCategory = await subCategoryRepository.insertSubCategory(data)

  return subCategory
}

const editSubCategoryById = async (id, subCategoryData) => {
  // cek category id
  await getSubCategoryById(id)

  // cek request
  if (subCategoryData.title === '') throw Error('Title tidak boleh kosong')
  if (subCategoryData.slug === '') throw Error('Slug tidak boleh kosong')
  if (subCategoryData.categoryId === '' || subCategoryData.categoryId === 'Pilih Kategori') throw Error('Pilih Kategori')

  // cek duplicate title
  const findSubCategoryByTitle = await subCategoryRepository.findSubCategoryByTitle({
    $regex: new RegExp('^' + subCategoryData.title + '$', 'i')
  })
  if (findSubCategoryByTitle &&
    subCategoryData.title.toLowerCase() !== subCategoryData.oldTitle.toLowerCase())
    throw Error('Title sudah digunakan!')

  // cek duplicate slug
  const findSubCategoryBySlug = await subCategoryRepository.findSubCategoryBySlug(subCategoryData.slug)
  if (findSubCategoryBySlug && subCategoryData.slug !== subCategoryData.oldSlug)
    throw Error('Slug sudah digunakan!')

  const subCategory = await subCategoryRepository.updateSubCategory(id, subCategoryData)
  return subCategory
}

const deleteSubCategoryById = async (data) => {
  await getSubCategoryById(data.subCategoryId)
  await subCategoryRepository.deleteSubCategory(data)
}

export const subCategoryService = {
  getAllSubCategories,
  getSubCategoryById,
  getSubCategoriesByCategoryId,
  createSubCategory,
  editSubCategoryById,
  deleteSubCategoryById,
}