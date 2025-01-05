import { nanoid } from 'nanoid'
import { BEING_PACKED, CANCELED, FRONT_END_URL, MIDTRANS_API_URL, MIDTRANS_APP_URL, MIDTRANS_SERVER_KEY, PENDING_PAYMENT } from '../../utils/constant.js'
import { transactionRepository } from './trasaction.repository.js'
import { userService } from '../user/user.service.js'
import { cartRepository } from '../cart/cart.repository.js'
import crypto from 'crypto'
import { orderService } from '../order/order.service.js'
import { orderRepository } from '../order/order.repository.js'
import fetch from 'node-fetch'
import { productsRepository } from '../product/product.repository.js'

export const createTrasaction = async (req, res) => {
  try {
    const { transaction_details, item_details, customer_details, shipping_address } = req.body

    const payloadGetShipping = {
      userId: customer_details.user_id,
      shippingId: shipping_address.addressId
    }

    const address = await userService.getShippingAddressById(payloadGetShipping)

    const transaction_id = `TRX-${nanoid(4)}-${nanoid(8)}`

    const user = await userService.getProfileById(customer_details.user_id)

    if (!user.user_details) {
      return res.status(400).json({
        errorDetail: 'error_incomplete_profile',
        msg: 'please complete your profile'
      })
    }

    const payloadReqToken = {
      "transaction_details": {
        "order_id": transaction_id,
        "gross_amount": transaction_details.gross_amount
      },
      "credit_card": {
        "secure": true
      },
      "item_details": item_details.map(item => ({
        "id": item.product_id,
        "price": item.price,
        "quantity": item.quantity,
        "name": item.name.length > 50 ? item.name.substring(0, 50) : item.name
      })),
      "customer_details": {
        "first_name": user?.user_details.fullname,
        "last_name": "",
        "email": user.email,
        "phone": user.user_details.phone,
        "shipping_address": {
          "first_name": address.addresses[0].recipient_name,
          "phone": address.addresses[0].phone,
          "address": address.addresses[0].complete_address,
          "city": address.addresses[0].city
        }
      },
      "callbacks": {
        finish: `${FRONT_END_URL}/users/order_status?transation_id=${transaction_id}`,
        error: `${FRONT_END_URL}/users/order_status?transation_id=${transaction_id}`,
        pending: `${FRONT_END_URL}/users/order_status?transation_id=${transaction_id}`
      }
    }

    const authString = btoa(`${MIDTRANS_SERVER_KEY}`)
    const response = await fetch(`${MIDTRANS_APP_URL}/snap/v1/transactions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Basic ${authString}`
      },
      body: JSON.stringify(payloadReqToken)
    })

    const data = await response.json()

    if (response.status !== 201) {
      return res.status(500).json({
        status: 'error',
        msg: 'Failed to create transaction'
      })
    }

    const productIds = item_details.map(product => product.product_id)
    await cartRepository.deleteCartsByProductIds(productIds)

    const payloadOrder = {
      transaction_id,
      user_id: customer_details.user_id,
      shipping_address_id: shipping_address.addressId,
      status: PENDING_PAYMENT,
      total: transaction_details.gross_amount,
      snap_token: data.token,
      snap_redirect_url: data.redirect_url
    }

    const createOrder = await transactionRepository.createOrder(payloadOrder)
    const orderItems = item_details.map(item => ({
      product_id: item.product_id,
      qty: item.quantity,
      sizeOrder: item.size.size,
      size: item.size.sizeId,
      total: item.total
    }))

    const payloadOrderItems = {
      order_id: createOrder?._id,
      items: orderItems
    }

    if (createOrder) {
      await transactionRepository.createOrderItems(payloadOrderItems)
      await productsRepository.updateQuantitySizeProduct(orderItems)
    }

    res.status(201).json({
      status: 'success',
      msg: 'Order successfully!',
      data: {
        id: transaction_id,
        status: PENDING_PAYMENT,
        snap_token: data.token,
        snap_redirect_url: data.redirect_url
      }
    })
  } catch (error) {
    console.log(error)
  }
}

export const getSnapRedirectUrl = async (req, res) => {
  try {
    const snapToken = req.params.snapToken
    const response = await fetch(`${MIDTRANS_APP_URL}/snap/v1/transactions/${snapToken}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    })

    const data = await response.json()
    res.status(200).json({
      status: true,
      data: data
    })
  } catch (error) {
    console.log(error)
  }
}

const updateStatusBaseOnMidtransResponse = async (transaction_id, data) => {
  const hash = crypto.createHash('sha512').update(`${transaction_id}${data.status_code}${data.gross_amount}${MIDTRANS_SERVER_KEY}`).digest('hex')
  if (data.signature_key !== hash) {
    return {
      status: false,
      msg: 'Invalid Signature Key'
    }
  }

  let response = null
  let transactionStatus = data.transaction_status
  let fraudStatus = data.fraud_status

  if (transactionStatus == 'capture') {
    if (fraudStatus == 'accept') {
      const transaction = await orderRepository.updateStatusOrderByTransactionId(transaction_id, BEING_PACKED)
      response = transaction
    }
  } else if (transactionStatus == 'settlement') {
    const transaction = await orderRepository.updateStatusOrderByTransactionId(transaction_id, BEING_PACKED)
    response = transaction
  } else if (transactionStatus == 'cancel' ||
    transactionStatus == 'deny' ||
    transactionStatus == 'expire') {
    const transaction = await orderRepository.updateStatusOrderByTransactionId(transaction_id, CANCELED)
    response = transaction
  } else if (transactionStatus == 'pending') {
    const transaction = await orderRepository.updateStatusOrderByTransactionId(transaction_id, PENDING_PAYMENT)
    response = transaction
  }

  return {
    status: true,
    response: response
  }
}

export const transactionNotification = async (req, res) => {
  try {
    const data = req.body

    const getOrderByTransactionId = await orderService.getOrderByTransactionId(data.order_id)

    const updateStatusOrder = await updateStatusBaseOnMidtransResponse(getOrderByTransactionId[0].transaction_id, data)

    res.status(200).json({
      status: true,
      msg: 'OK',
      response: updateStatusOrder
    })
  } catch (error) {
    console.log(error)
    res.status(500).json({
      status: false,
      msg: error.message
    })
  }
}

export const cancelTransactionByTransactionId = async (req, res) => {
  try {
    const transactionId = req.body.transactionId

    const authString = btoa(`${MIDTRANS_SERVER_KEY}`)
    const response = await fetch(`${MIDTRANS_API_URL}/v2/${transactionId}/cancel`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Basic ${authString}`
      }
    })

    console.log(response)
  } catch (error) {
    console.log(error)
  }
}