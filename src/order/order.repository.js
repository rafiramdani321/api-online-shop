import mongoose from "mongoose";
import Orders from "../../models/order.model.js"
import orderItems from "../../models/order_items.model.js";

const findAllOrderByUserId = async (userId) => {
  const queryOptions = {
    user_id: new mongoose.Types.ObjectId(userId)
  }

  const orders = await Orders.aggregate([
    {
      $match: queryOptions
    },
    {
      $lookup: {
        from: 'shipping_addresses',
        let: { order_user_id: '$user_id', order_shipping_address_id: '$shipping_address_id' },
        pipeline: [
          {
            $unwind: '$addresses'
          },
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ['$user_id', '$$order_user_id'] },
                  { $eq: ['$addresses._id', '$$order_shipping_address_id'] }
                ]
              }
            }
          },
          {
            $project: {
              _id: 0,
              shipping_address: '$addresses'
            }
          }
        ],
        as: 'shipping_address_details'
      }
    },
    {
      $unwind: {
        path: '$shipping_address_details',
        preserveNullAndEmptyArrays: true
      }
    },
    {
      $lookup: {
        from: 'order_items',
        localField: '_id',
        foreignField: 'order_id',
        as: 'order_items'
      }
    },
    {
      $unwind: {
        path: '$order_items',
        preserveNullAndEmptyArrays: true
      }
    },
    {
      $unwind: {
        path: '$order_items.items',
        preserveNullAndEmptyArrays: true
      }
    },
    {
      $lookup: {
        from: 'products',
        localField: 'order_items.items.product_id',
        foreignField: '_id',
        as: 'product_info',
        pipeline: [
          {
            $project: {
              _id: 1,
              title: 1,
              slug: 1,
              price: 1,
              image: 1,
              url: 1
            }
          }
        ]
      }
    },
    {
      $unwind: {
        path: '$product_info',
        preserveNullAndEmptyArrays: true
      }
    },
    {
      $lookup: {
        from: 'sizeproducts',
        localField: 'order_items.items.size',
        foreignField: '_id',
        as: 'size_info',
        pipeline: [
          {
            $project: {
              id_product: 0
            }
          }
        ]
      }
    },
    {
      $unwind: {
        path: '$size_info',
        preserveNullAndEmptyArrays: true
      }
    },
    {
      $group: {
        _id: {
          order_id: '$_id',
          order_item_id: '$order_items._id'
        },
        transaction_id: { $first: '$transaction_id' },
        user_id: { $first: '$user_id' },
        shipping_address_id: { $first: '$shipping_address_id' },
        shipping_address: { $first: '$shipping_address_details.shipping_address' },
        status: { $first: '$status' },
        total: { $first: '$total' },
        snap_token: { $first: '$snap_token' },
        snap_redirect_url: { $first: '$snap_redirect_url' },
        created_at: { $first: '$created_at' },
        updated_at: { $first: '$updated_at' },
        order_item_id: { $first: '$order_items._id' },
        order_id: { $first: '$order_items.order_id' },
        items: {
          $push: {
            product_id: '$order_items.items.product_id',
            qty: '$order_items.items.qty',
            size: '$order_items.items.size',
            size_info: '$size_info',
            total: '$order_items.items.total',
            _id: '$order_items.items._id',
            product_info: '$product_info'
          }
        },
      }
    },
    {
      $group: {
        _id: '$_id.order_id',
        transaction_id: { $first: '$transaction_id' },
        user_id: { $first: '$user_id' },
        shipping_address_id: { $first: '$shipping_address_id' },
        shipping_address: { $first: '$shipping_address' },
        status: { $first: '$status' },
        total: { $first: '$total' },
        snap_token: { $first: '$snap_token' },
        snap_redirect_url: { $first: '$snap_redirect_url' },
        created_at: { $first: '$created_at' },
        updated_at: { $first: '$updated_at' },
        order_items: {
          $push: {
            _id: '$_id.order_item_id',
            order_id: '$order_id',
            items: '$items',
            __v: '$__v'
          }
        },
      }
    }
  ]);

  return orders
}

const findOrderByTransactionId = async (transactionId) => {
  const queryOptions = {
    transaction_id: transactionId
  }

  const order = await Orders.aggregate([
    {
      $match: queryOptions
    },
    {
      $lookup: {
        from: 'shipping_addresses',
        let: { order_user_id: '$user_id', order_shipping_address_id: '$shipping_address_id' },
        pipeline: [
          {
            $unwind: '$addresses'
          },
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ['$user_id', '$$order_user_id'] },
                  { $eq: ['$addresses._id', '$$order_shipping_address_id'] }
                ]
              }
            }
          },
          {
            $project: {
              _id: 0,
              shipping_address: '$addresses'
            }
          }
        ],
        as: 'shipping_address_details'
      }
    },
    {
      $unwind: {
        path: '$shipping_address_details',
        preserveNullAndEmptyArrays: true
      }
    },
    {
      $lookup: {
        from: 'order_items',
        localField: '_id',
        foreignField: 'order_id',
        as: 'order_items'
      }
    },
    {
      $unwind: {
        path: '$order_items',
        preserveNullAndEmptyArrays: true
      }
    },
    {
      $unwind: {
        path: '$order_items.items',
        preserveNullAndEmptyArrays: true
      }
    },
    {
      $lookup: {
        from: 'products',
        localField: 'order_items.items.product_id',
        foreignField: '_id',
        as: 'product_info',
        pipeline: [
          {
            $project: {
              _id: 1,
              title: 1,
              slug: 1,
              price: 1,
              image: 1,
              url: 1
            }
          }
        ]
      }
    },
    {
      $unwind: {
        path: '$product_info',
        preserveNullAndEmptyArrays: true
      }
    },
    {
      $lookup: {
        from: 'sizeproducts',
        localField: 'order_items.items.size',
        foreignField: '_id',
        as: 'size_info',
        pipeline: [
          {
            $project: {
              id_product: 0
            }
          }
        ]
      }
    },
    {
      $unwind: {
        path: '$size_info',
        preserveNullAndEmptyArrays: true
      }
    },
    {
      $group: {
        _id: {
          order_id: '$_id',
          order_item_id: '$order_items._id'
        },
        transaction_id: { $first: '$transaction_id' },
        user_id: { $first: '$user_id' },
        shipping_address_id: { $first: '$shipping_address_id' },
        shipping_address: { $first: '$shipping_address_details.shipping_address' },
        status: { $first: '$status' },
        total: { $first: '$total' },
        snap_token: { $first: '$snap_token' },
        snap_redirect_url: { $first: '$snap_redirect_url' },
        created_at: { $first: '$created_at' },
        updated_at: { $first: '$updated_at' },
        order_item_id: { $first: '$order_items._id' },
        order_id: { $first: '$order_items.order_id' },
        items: {
          $push: {
            product_id: '$order_items.items.product_id',
            qty: '$order_items.items.qty',
            sizeOrder: '$order_items.items.sizeOrder',
            size: '$order_items.items.size',
            size_info: '$size_info',
            total: '$order_items.items.total',
            _id: '$order_items.items._id',
            product_info: '$product_info'
          }
        },
      }
    },
    {
      $group: {
        _id: '$_id.order_id',
        transaction_id: { $first: '$transaction_id' },
        user_id: { $first: '$user_id' },
        shipping_address_id: { $first: '$shipping_address_id' },
        shipping_address: { $first: '$shipping_address' },
        status: { $first: '$status' },
        total: { $first: '$total' },
        snap_token: { $first: '$snap_token' },
        snap_redirect_url: { $first: '$snap_redirect_url' },
        created_at: { $first: '$created_at' },
        updated_at: { $first: '$updated_at' },
        order_items: {
          $push: {
            _id: '$_id.order_item_id',
            order_id: '$order_id',
            items: '$items',
            __v: '$__v'
          }
        },
      }
    }
  ]);

  return order
}

const updateStatusOrderByTransactionId = async (transaction_id, status) => {
  const order = await Orders.updateOne(
    { transaction_id }, {
    $set: {
      status
    }
  }
  )
  return order
}

const updateQuantityProduct = async (data) => {
  console.log(data)
}

export const orderRepository = {
  findAllOrderByUserId,
  findOrderByTransactionId,
  updateStatusOrderByTransactionId,
  updateQuantityProduct
}