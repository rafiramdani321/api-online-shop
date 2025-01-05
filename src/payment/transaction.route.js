import express from 'express'
import { cancelTransactionByTransactionId, createTrasaction, getSnapRedirectUrl, transactionNotification } from './transaction.controller.js'

const routerTrasaction = express.Router()

// middleware auth
routerTrasaction.post('/', createTrasaction)
routerTrasaction.get('/snap/:snapToken', getSnapRedirectUrl)
routerTrasaction.post('/notification', transactionNotification)
routerTrasaction.post('/cancel', cancelTransactionByTransactionId)

export default routerTrasaction