import express from 'express'
import { authController } from './auth.controller.js'
import { LoginValidation, RegisterValidation, validationResults } from '../../validation/index.js'

export const routerAuth = express.Router()

routerAuth.post('/register',
  RegisterValidation, validationResults, authController.registrasi
)
routerAuth.get('/user/verify/:id/:token',
  authController.verifyEmail
)
routerAuth.post('/login',
  LoginValidation, validationResults, authController.login
)
routerAuth.get('/token',
  authController.refreshToken
)
routerAuth.delete('/logout', authController.logout)