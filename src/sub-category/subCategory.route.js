import express from 'express'
import { subCategoryController } from './subCategory.controller.js'
import { addSubCategoryValidation, validationResults } from '../../validation/index.js'
import { verifyTokenAccessAdmin } from '../../middleware/middleware.js'

export const routerSubCategory = express.Router()

routerSubCategory.get('/', subCategoryController.getSubCategories)
routerSubCategory.get('/:id', subCategoryController.getSubCategoryById)
routerSubCategory.get('/category/:id', subCategoryController.getSubCategoriesByCategoryId)

// admin verify token
routerSubCategory.post('/',
  verifyTokenAccessAdmin,
  addSubCategoryValidation, validationResults,
  subCategoryController.addSubCategory
)
routerSubCategory.put('/:id',
  verifyTokenAccessAdmin,
  subCategoryController.editSubCategoryById
)
routerSubCategory.delete('/:id',
  verifyTokenAccessAdmin,
  subCategoryController.deleteSubCategoryById
)
