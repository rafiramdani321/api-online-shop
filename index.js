import express from "express";
import fileUpload from "express-fileupload";
import dotenv from 'dotenv'
import cors from 'cors'
import cookieParser from "cookie-parser";
import connectDb from "./config/Db.js";
import { categoryRouter } from "./src/category/category.route.js";
import { routerAuth } from "./src/auth/auth.route.js";
import { routerSubCategory } from "./src/sub-category/subCategory.route.js";
import { productRouter } from "./src/product/product.route.js";
import { sizesRouter } from "./src/size/size.route.js";
import { cartRouter } from "./src/cart/cart.route.js";
import { userRouter } from './src/user/user.route.js'
import routerTrasaction from "./src/payment/transaction.route.js";
import routerOrder from "./src/order/order.route.js";
import compression from 'compression'

export const app = express()
dotenv.config()

// validation connect db
connectDb().then(() => { console.log('Connected to database') }).catch((error) => { console.log(`Error connecting to database: ${error}`) })

// setup middleware
app.use(compression())
app.use(cors({
  credentials: true, origin: 'http://localhost:5173'
}))
app.use(express.json())
app.use(fileUpload())
app.use(express.static('public'))
app.use(cookieParser())

app.use("/", () => {
  return "Hello World";
});

// setup routes
app.use('/api/auth', routerAuth)
app.use('/api/user', userRouter)
app.use('/api/categories', categoryRouter)
app.use('/api/products', productRouter)
app.use('/api/sub-categories', routerSubCategory)
app.use('/api/sizes', sizesRouter)
app.use('/api/carts', cartRouter)
app.use('/api/transaction', routerTrasaction)
app.use('/api/order', routerOrder)

// server
const port = process.env.PORT
app.listen(port, () => console.log(`Server running on port ${port}`))