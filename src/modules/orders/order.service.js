// import * as orderRepository from "./order.repository.js";

// import Cart from "../cart/cart.model.js";
// import Offer from "../offer/offer.model.js";
// import Coupon from "../coupon/coupon.model.js";
// import { incrementCouponUsage } from "../coupon/coupon.service.js";

// // =======================================
// // CREATE ORDER
// // =======================================

// export const createOrder = async (orderData) => {

//     const cart = await Cart.findOne({
//         user: orderData.user,
//         isDeleted: false
//     })
//     .populate({
//         path: "items.product",
//         populate: {
//             path: "offer"
//         }
//     })
//     .populate("coupon");

//     if (!cart || cart.items.length === 0) {
//         throw new Error("Cart is empty");
//     }

//     let totalAmount = 0;

//     const orderItems = [];

//     for (const item of cart.items) {

//         const product = item.product;

//         const originalPrice = product.pricing.sellingPrice;

//         let finalPrice = originalPrice;

//         let discountAmount = 0;

//         let offerId = null;

//         if (
//             product.offer &&
//             product.offer.isActive &&
//             new Date(product.offer.startDate) <= new Date() &&
//             new Date(product.offer.endDate) >= new Date()
//         ) {

//             offerId = product.offer._id;

//             if (product.offer.discountType === "PERCENT") {

//                 discountAmount =
//                     (originalPrice * product.offer.discountValue) / 100;

//             } else {

//                 discountAmount =
//                     product.offer.discountValue;

//             }

//             finalPrice =
//                 originalPrice - discountAmount;
//         }

//         totalAmount += finalPrice * item.quantity;

//         orderItems.push({

//             product: product._id,

//             title: product.name,

//             quantity: item.quantity,

//             originalPrice,

//             discountAmount,

//             price: finalPrice,

//             offer: offerId,

//             imageUrl: product.images?.[0]?.url || ""

//         });

//     }

//     orderData.orderItems = orderItems;

//     orderData.totalAmount = totalAmount;

//     const order = await orderRepository.createOrder(orderData);

//     return order;

// };




// // =======================================
// // GET ORDER BY ID
// // =======================================

// export const getOrderById = async(orderId)=>{


//     const order = await orderRepository.findOrderById(
//         orderId
//     );


//     if(!order){

//         throw new Error(
//             "Order not found"
//         );

//     }


//     return order;

// };




// // =======================================
// // GET USER ORDERS
// // =======================================

// export const getUserOrders = async(userId)=>{


//     const orders = 
//     await orderRepository.findOrdersByUserId(
//         userId
//     );


//     return orders;

// };




// // =======================================
// // GET ALL ORDERS (ADMIN)
// // =======================================

// export const getAllOrders = async()=>{


//     const orders =
//     await orderRepository.findAllOrders();


//     return orders;

// };




// // =======================================
// // UPDATE ORDER STATUS
// // =======================================

// export const updateOrderStatus = async(

//     orderId,

//     status

// )=>{


//     const order =

//     await orderRepository.findOrderById(
//         orderId
//     );



//     if(!order){

//         throw new Error(
//             "Order not found"
//         );

//     }



//     const updatedOrder =

//     await orderRepository.updateOrderStatus(

//         orderId,

//         status

//     );



//     return updatedOrder;

// };




// // =======================================
// // UPDATE PAYMENT STATUS
// // =======================================

// export const updatePaymentStatus = async(

//     orderId,

//     paymentStatus,

//     paymentId

// )=>{


//     const order =

//     await orderRepository.findOrderById(
//         orderId
//     );



//     if(!order){

//         throw new Error(
//             "Order not found"
//         );

//     }



//     const updatedOrder =

//     await orderRepository.updatePaymentStatus(

//         orderId,

//         paymentStatus,

//         paymentId

//     );



//     return updatedOrder;

// };



import * as orderRepository
  from "./order.repository.js";

import {
  getInventoryByProductId
} from "../inventory/inventory.repository.js";

import {
  removeStockService
} from "../inventory/inventory.service.js";


// ======================================================
// CREATE ORDER
// ======================================================

export const createOrder = async (

  orderData,

  createdBy

) => {

  const isWalkIn =
    orderData.orderSource === "WALK_IN";


  // ====================================================
  // WALK-IN STOCK CHECK
  // ====================================================

  if (isWalkIn) {

    if (
      !orderData.orderItems ||
      !Array.isArray(
        orderData.orderItems
      ) ||
      orderData.orderItems.length === 0
    ) {

      throw new Error(
        "Walk-in order must contain products"
      );

    }


    for (
      const item
      of orderData.orderItems
    ) {

      const quantity =
        Number(item.quantity);


      if (
        !quantity ||
        quantity < 1
      ) {

        throw new Error(
          `Invalid quantity for ${
            item.title || "product"
          }`
        );

      }


      const inventory =
        await getInventoryByProductId(
          item.product
        );


      if (!inventory) {

        throw new Error(
          `Inventory not found for ${
            item.title || item.product
          }`
        );

      }


      const currentStock =
        Number(
          inventory.currentStock || 0
        );


      const reservedStock =
        Number(
          inventory.reservedStock || 0
        );


      const availableStock =
        currentStock -
        reservedStock;


      if (
        availableStock <
        quantity
      ) {

        throw new Error(

          `${
            item.title || "Product"
          } has only ${
            availableStock
          } stock available`

        );

      }

    }

  }


  // ====================================================
  // CREATE ORDER
  // ====================================================

  const order =
    await orderRepository.createOrder(
      orderData
    );


  // ====================================================
  // WALK-IN STOCK DECREASE
  // ====================================================

  if (isWalkIn) {

    for (
      const item
      of orderData.orderItems
    ) {

      await removeStockService(

        item.product,

        Number(item.quantity),

        createdBy,

        "ORDER",

        `Walk-in sale - Order ${order._id}`

      );

    }

  }


  // ====================================================
  // ONLINE
  // ====================================================

  if (
    orderData.orderSource ===
    "ONLINE"
  ) {

    console.log(
      "ONLINE ORDER CREATED - STOCK NOT CHANGED"
    );

  }


  return order;

};


// ======================================================
// GET ORDER BY ID
// ======================================================

export const getOrderById =
  async (orderId) => {

    const order =
      await orderRepository.findOrderById(
        orderId
      );


    if (!order) {

      throw new Error(
        "Order not found"
      );

    }


    return order;

  };


// ======================================================
// GET USER ORDERS
// ======================================================

export const getUserOrders =
  async (userId) => {

    return await
      orderRepository.findOrdersByUserId(
        userId
      );

  };


// ======================================================
// GET ALL ORDERS
// ======================================================

export const getAllOrders =
  async () => {

    return await
      orderRepository.findAllOrders();

  };


// ======================================================
// UPDATE ORDER STATUS
// ======================================================

export const updateOrderStatus =
  async (
    orderId,
    status
  ) => {

    const order =
      await orderRepository.findOrderById(
        orderId
      );


    if (!order) {

      throw new Error(
        "Order not found"
      );

    }


    return await
      orderRepository.updateOrderStatus(

        orderId,

        status

      );

  };


// ======================================================
// UPDATE PAYMENT STATUS
// ======================================================

export const updatePaymentStatus =
  async (
    orderId,
    paymentStatus,
    paymentId = ""
  ) => {

    const order =
      await orderRepository.findOrderById(
        orderId
      );


    if (!order) {

      throw new Error(
        "Order not found"
      );

    }


    return await
      orderRepository.updatePaymentStatus(

        orderId,

        paymentStatus,

        paymentId

      );

  };