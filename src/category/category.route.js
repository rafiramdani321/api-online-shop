import express from 'express'
import { categoryController } from './category.controller.js'
import { addAndUpdateCategoryValidation, validationResults } from '../../validation/index.js'
import { verifyTokenAccessAdmin } from '../../middleware/middleware.js'

export const categoryRouter = express.Router()

categoryRouter.get('/', categoryController.getCategories)

categoryRouter.get('/:id', categoryController.getCategoryById)

// with middleware admin
categoryRouter.post('/',
  verifyTokenAccessAdmin,
  addAndUpdateCategoryValidation,
  validationResults,
  categoryController.addCategory
)

categoryRouter.put('/:id',
  verifyTokenAccessAdmin,
  addAndUpdateCategoryValidation,
  validationResults,
  categoryController.editCategoryById)

categoryRouter.delete('/:id',
  verifyTokenAccessAdmin,
  categoryController.deleteCategoryById
)