import express from 'express'
import { sizesControllers } from './size.controller.js'

export const sizesRouter = express.Router()

sizesRouter.get('/', sizesControllers.getSizes)