// // import * as orderRepository from "./order.repository.js";

// // import Cart from "../cart/cart.model.js";
// // import Offer from "../offer/offer.model.js";
// // import Coupon from "../coupon/coupon.model.js";
// // import { incrementCouponUsage } from "../coupon/coupon.service.js";

// // // =======================================
// // // CREATE ORDER
// // // =======================================

// // export const createOrder = async (orderData) => {

// //     const cart = await Cart.findOne({
// //         user: orderData.user,
// //         isDeleted: false
// //     })
// //     .populate({
// //         path: "items.product",
// //         populate: {
// //             path: "offer"
// //         }
// //     })
// //     .populate("coupon");

// //     if (!cart || cart.items.length === 0) {
// //         throw new Error("Cart is empty");
// //     }

// //     let totalAmount = 0;

// //     const orderItems = [];

// //     for (const item of cart.items) {

// //         const product = item.product;

// //         const originalPrice = product.pricing.sellingPrice;

// //         let finalPrice = originalPrice;

// //         let discountAmount = 0;

// //         let offerId = null;

// //         if (
// //             product.offer &&
// //             product.offer.isActive &&
// //             new Date(product.offer.startDate) <= new Date() &&
// //             new Date(product.offer.endDate) >= new Date()
// //         ) {

// //             offerId = product.offer._id;

// //             if (product.offer.discountType === "PERCENT") {

// //                 discountAmount =
// //                     (originalPrice * product.offer.discountValue) / 100;

// //             } else {

// //                 discountAmount =
// //                     product.offer.discountValue;

// //             }

// //             finalPrice =
// //                 originalPrice - discountAmount;
// //         }

// //         totalAmount += finalPrice * item.quantity;

// //         orderItems.push({

// //             product: product._id,

// //             title: product.name,

// //             quantity: item.quantity,

// //             originalPrice,

// //             discountAmount,

// //             price: finalPrice,

// //             offer: offerId,

// //             imageUrl: product.images?.[0]?.url || ""

// //         });

// //     }

// //     orderData.orderItems = orderItems;

// //     orderData.totalAmount = totalAmount;

// //     const order = await orderRepository.createOrder(orderData);

// //     return order;

// // };




// // // =======================================
// // // GET ORDER BY ID
// // // =======================================

// // export const getOrderById = async(orderId)=>{


// //     const order = await orderRepository.findOrderById(
// //         orderId
// //     );


// //     if(!order){

// //         throw new Error(
// //             "Order not found"
// //         );

// //     }


// //     return order;

// // };




// // // =======================================
// // // GET USER ORDERS
// // // =======================================

// // export const getUserOrders = async(userId)=>{


// //     const orders = 
// //     await orderRepository.findOrdersByUserId(
// //         userId
// //     );


// //     return orders;

// // };




// // // =======================================
// // // GET ALL ORDERS (ADMIN)
// // // =======================================

// // export const getAllOrders = async()=>{


// //     const orders =
// //     await orderRepository.findAllOrders();


// //     return orders;

// // };




// // // =======================================
// // // UPDATE ORDER STATUS
// // // =======================================

// // export const updateOrderStatus = async(

// //     orderId,

// //     status

// // )=>{


// //     const order =

// //     await orderRepository.findOrderById(
// //         orderId
// //     );



// //     if(!order){

// //         throw new Error(
// //             "Order not found"
// //         );

// //     }



// //     const updatedOrder =

// //     await orderRepository.updateOrderStatus(

// //         orderId,

// //         status

// //     );



// //     return updatedOrder;

// // };




// // // =======================================
// // // UPDATE PAYMENT STATUS
// // // =======================================

// // export const updatePaymentStatus = async(

// //     orderId,

// //     paymentStatus,

// //     paymentId

// // )=>{


// //     const order =

// //     await orderRepository.findOrderById(
// //         orderId
// //     );



// //     if(!order){

// //         throw new Error(
// //             "Order not found"
// //         );

// //     }



// //     const updatedOrder =

// //     await orderRepository.updatePaymentStatus(

// //         orderId,

// //         paymentStatus,

// //         paymentId

// //     );



// //     return updatedOrder;

// // };



// import * as orderRepository
//   from "./order.repository.js";

// import {
//   getInventoryByProductId
// } from "../inventory/inventory.repository.js";

// import {
//   removeStockService
// } from "../inventory/inventory.service.js";

// import Order from "./order.model.js";
// import Product from "../products/product.model.js";
// import { getActiveOffersDB } from "../offer/offer.repository.js";
// import {
//     calculateDiscountedPrice,
//     matchOfferToProduct
// } from "../../common/utils/offerCalculator.js";
// import {
//     createNotificationService,
//     notifyAdminsService
// } from "../notification/notification.service.js";


// import { validateCouponService, incrementCouponUsageService } from "../coupons/coupon.service.js";



// // ======================================================
// // HELPER: BUILD SECURE ORDER ITEMS
// // ======================================================

// const buildSecureOrderItems = async (rawItems) => {

//     const activeOffers = await getActiveOffersDB();

//     const secureItems = [];

//     let totalAmount = 0;

//     for (const item of rawItems) {

//         const productData = await Product.findById(item.product);

//         if (!productData) {
//             throw new Error(`Product not found: ${item.product}`);
//         }

//         const originalPrice = Number(productData.pricing.sellingPrice);

//         const offer = matchOfferToProduct(productData, activeOffers);

//         const finalPrice = calculateDiscountedPrice(
//             originalPrice,
//             offer
//         );

//         const discountAmount = originalPrice - finalPrice;

//         const quantity = Number(item.quantity);

//         secureItems.push({

//             product: productData._id,

//             title: productData.name,

//             quantity,

//             originalPrice,

//             discountAmount,

//             price: finalPrice,

//             appliedOffer: offer ? {
//                 offerId: offer._id,
//                 title: offer.title,
//                 discountType: offer.discountType,
//                 discountValue: offer.discountValue
//             } : null,

//             imageUrl: productData.images?.[0]?.url || ""

//         });

//         totalAmount += finalPrice * quantity;

//     }

//     return {
//         secureItems,
//         totalAmount
//     };
// };
// // ======================================================
// // CREATE ORDER
// // ======================================================

// export const createOrder = async (

//   orderData,

//   createdBy

// ) => {

//   const isWalkIn =
//     orderData.orderSource === "WALK_IN";

//     const {
//         secureItems,
//         totalAmount
//     } = await buildSecureOrderItems(
//         orderData.orderItems
//     );

//      orderData.orderItems = secureItems;
    
//     orderData.totalAmount = totalAmount;


//      // ====================================================
//   // NEW: COUPON VALIDATION
//   // ====================================================

//   let couponDiscount = 0;
//   let couponData = null;

//   if (orderData.couponCode) {

//     const result = await validateCouponService(
//       orderData.couponCode,
//       totalAmount,
//       orderData.user
//     );

//     couponDiscount = result.discountAmount;
//     couponData = result.coupon;

//     orderData.coupon = couponData.couponId;
//     orderData.couponCode = couponData.code;
//     orderData.couponDiscount = couponDiscount;
//   }

//   orderData.finalAmount = totalAmount - couponDiscount;

//   // ====================================================
//   // WALK-IN STOCK CHECK
//   // ====================================================

//   if (isWalkIn) {

//     if (
//       !orderData.orderItems ||
//       !Array.isArray(
//         orderData.orderItems
//       ) ||
//       orderData.orderItems.length === 0
//     ) {

//       throw new Error(
//         "Walk-in order must contain products"
//       );

//     }


//     for (
//       const item
//       of orderData.orderItems
//     ) {

//       const quantity =
//         Number(item.quantity);


//       if (
//         !quantity ||
//         quantity < 1
//       ) {

//         throw new Error(
//           `Invalid quantity for ${
//             item.title || "product"
//           }`
//         );

//       }


//       const inventory =
//         await getInventoryByProductId(
//           item.product
//         );


//       if (!inventory) {

//         throw new Error(
//           `Inventory not found for ${
//             item.title || item.product
//           }`
//         );

//       }


//       const currentStock =
//         Number(
//           inventory.currentStock || 0
//         );


//       const reservedStock =
//         Number(
//           inventory.reservedStock || 0
//         );


//       const availableStock =
//         currentStock -
//         reservedStock;


//       if (
//         availableStock <
//         quantity
//       ) {

//         throw new Error(

//           `${
//             item.title || "Product"
//           } has only ${
//             availableStock
//           } stock available`

//         );

//       }

//     }

//   }


//   // ====================================================
//   // CREATE ORDER
//   // ====================================================

//   const order =
//     await orderRepository.createOrder(
//       orderData
//     );


// // ====================================================
// // NEW: INCREMENT COUPON USAGE
// // ====================================================

// if (couponData) {

//   try {

//     await incrementCouponUsageService(
//       couponData.couponId,
//       orderData.user
//     );

//   }
//   catch (couponError) {

//     console.error(
//       "COUPON USAGE INCREMENT ERROR:",
//       couponError
//     );

//   }

// }


// // ====================================================
// // NEW: ORDER PLACED NOTIFICATIONS
// // ====================================================

// try {

//     const isWalkInOrder =
//         orderData.orderSource === "WALK_IN";

//     if (!isWalkInOrder) {

//         await createNotificationService({
//             user: orderData.user,
//             type: "ORDER_PLACED",
//             title: "Order Placed",
//             message: `Your order has been placed successfully.`,
//             relatedId: order._id,
//             relatedModel: "Order"
//         });

//     }

//     await notifyAdminsService({
//         type: "ORDER_PLACED",
//         title: isWalkInOrder ? "New Walk-in Order" : "New Order Received",
//         message: isWalkInOrder
//             ? `A walk-in order of ₹${orderData.finalAmount} was created.`
//             : `A new order of ₹${orderData.finalAmount} has been placed.`,
//         relatedId: order._id,
//         relatedModel: "Order"
//     });

// }
// catch (notifError) {
//     console.error("ORDER NOTIFICATION ERROR:", notifError);
// }


// // ====================================================
// // INITIAL TRACKING HISTORY
// // ====================================================

// try {
  

//   const orderForTracking =
//     await Order.findById(order._id);

//   if (orderForTracking) {

//     if (!orderForTracking.tracking) {

//       orderForTracking.tracking = {
//         history: [],
//         courierName: "",
//         trackingNumber: "",
//         trackingUrl: "",
//         expectedDeliveryDate: null,
//       };

//     }

//     if (
//       !orderForTracking.tracking.history ||
//       !Array.isArray(
//         orderForTracking.tracking.history
//       )
//     ) {

//       orderForTracking.tracking.history = [];

//     }


//     orderForTracking.tracking.history.push({

//       status:
//         orderForTracking.orderStatus,

//       message:
//         orderForTracking.orderSource === "WALK_IN"

//           ? "Walk-in order created"

//           : "Order placed successfully",

//       updatedBy:
//         createdBy,

//       createdAt:
//         new Date(),

//     });


//     await orderForTracking.save();

//   }

// }
// catch (trackingError) {

//   // Tracking should NEVER break order creation

//   console.error(
//     "TRACKING INITIALIZATION ERROR:",
//     trackingError
//   );

// }

//   // ====================================================
//   // WALK-IN STOCK DECREASE
//   // ====================================================

//   if (isWalkIn) {

//     for (
//       const item
//       of orderData.orderItems
//     ) {

//       await removeStockService(

//         item.product,

//         Number(item.quantity),

//         createdBy,

//         "ORDER",

//         `Walk-in sale - Order ${order._id}`

//       );

//     }

//   }


//   // ====================================================
//   // ONLINE
//   // ====================================================

//   if (
//     orderData.orderSource ===
//     "ONLINE"
//   ) {

//     console.log(
//       "ONLINE ORDER CREATED - STOCK NOT CHANGED"
//     );

//   }


//   return order;

// };


// // ======================================================
// // GET ORDER BY ID
// // ======================================================

// export const getOrderById =
//   async (orderId) => {

//     const order =
//       await orderRepository.findOrderById(
//         orderId
//       );


//     if (!order) {

//       throw new Error(
//         "Order not found"
//       );

//     }


//     return order;

//   };


// // ======================================================
// // GET USER ORDERS
// // ======================================================

// export const getUserOrders =
//   async (userId) => {

//     return await
//       orderRepository.findOrdersByUserId(
//         userId
//       );

//   };


// // ======================================================
// // GET ALL ORDERS
// // ======================================================

// export const getAllOrders =
//   async () => {

//     return await
//       orderRepository.findAllOrders();

//   };


// // ======================================================
// // UPDATE ORDER STATUS
// // ======================================================

// // export const updateOrderStatus =
// //   async (
// //     orderId,
// //     status
// //   ) => {

// //     const order =
// //       await orderRepository.findOrderById(
// //         orderId
// //       );


// //     if (!order) {

// //       throw new Error(
// //         "Order not found"
// //       );

// //     }


// //     return await
// //       orderRepository.updateOrderStatus(

// //         orderId,

// //         status

// //       );

// //   };


// // ======================================================
// // UPDATE ORDER STATUS + TRACKING HISTORY
// // ======================================================

// export const updateOrderStatus =
// async (
//   orderId,
//   status,
//   updatedBy = null,
//   message = ""
// ) => {

//   const order =
//     await orderRepository.findOrderById(
//       orderId
//     );


//   if (!order) {

//     throw new Error(
//       "Order not found"
//     );

//   }


//   // ---------------------------------------------
//   // EXISTING ORDER STATUS UPDATE
//   // ---------------------------------------------

//   const updatedOrder =
//     await orderRepository.updateOrderStatus(

//       orderId,

//       status

//     );


//   // ---------------------------------------------
//   // TRACKING HISTORY
//   // ---------------------------------------------

//   try {

//     const trackingOrder =
//       await Order.findById(
//         orderId
//       );


//     if (trackingOrder) {

//       if (
//         !trackingOrder.tracking
//       ) {

//         trackingOrder.tracking = {

//           history: [],

//           courierName: "",

//           trackingNumber: "",

//           trackingUrl: "",

//           expectedDeliveryDate: null,

//         };

//       }


//       if (
//         !trackingOrder.tracking.history
//         ||
//         !Array.isArray(
//           trackingOrder.tracking.history
//         )
//       ) {

//         trackingOrder.tracking.history = [];

//       }


//       // Prevent duplicate consecutive history
//       const history =
//         trackingOrder.tracking.history;


//       const lastHistory =
//         history.length > 0
//           ? history[history.length - 1]
//           : null;


//       if (
//         !lastHistory ||
//         lastHistory.status !== status
//       ) {

//         history.push({

//           status,

//           message:
//             message ||
//             getDefaultTrackingMessage(
//               status
//             ),

//           updatedBy,

//           createdAt:
//             new Date(),

//         });

//       }


//       // Delivered date

//       if (
//         status === "DELIVERED"
//       ) {

//         trackingOrder.deliveryDate =
//           new Date();

//       }


//       await trackingOrder.save();


// // ====================================================
// // NEW: ORDER STATUS NOTIFICATIONS
// // ====================================================

// try {

//     const customerMessages = {
//         CONFIRMED: "Your order is confirmed.",
//         PROCESSING: "Your order is being processed.",
//         SHIPPED: "Your order has been shipped.",
//         OUT_FOR_DELIVERY: "Your order is out for delivery.",
//         DELIVERED: "Your order has been delivered successfully.",
//         CANCELLED: "Your order has been cancelled."
//     };

//     await createNotificationService({
//         user: trackingOrder.user,
//         type: "ORDER_STATUS",
//         title: "Order Status Updated",
//         message: customerMessages[status] || `Your order status is now ${status}.`,
//         relatedId: orderId,
//         relatedModel: "Order"
//     });

//     if (status === "SHIPPED" || status === "DELIVERED") {

//         await notifyAdminsService({
//             type: "ORDER_STATUS",
//             title: `Order ${status}`,
//             message: `Order #${orderId.toString().slice(-6)} has been marked as ${status}.`,
//             relatedId: orderId,
//             relatedModel: "Order"
//         });

//     }

// }
// catch (notifError) {
//     console.error("ORDER STATUS NOTIFICATION ERROR:", notifError);
// }

//     }

//   }
//   catch (trackingError) {

//     console.error(
//       "TRACKING UPDATE ERROR:",
//       trackingError
//     );

//   }


//   // ---------------------------------------------
//   // RETURN FRESH ORDER
//   // ---------------------------------------------

//   return await
//     orderRepository.findOrderById(
//       orderId
//     );

// };


// // ======================================================
// // UPDATE PAYMENT STATUS
// // ======================================================

// export const updatePaymentStatus =
//   async (
//     orderId,
//     paymentStatus,
//     paymentId = ""
//   ) => {

//     const order =
//       await orderRepository.findOrderById(
//         orderId
//       );


//     if (!order) {

//       throw new Error(
//         "Order not found"
//       );

//     }


//     return await
//       orderRepository.updatePaymentStatus(

//         orderId,

//         paymentStatus,

//         paymentId

//       );

// // ====================================================
// // NEW: PAYMENT NOTIFICATIONS
// // ====================================================

// try {

//     if (paymentStatus === "PAID") {

//         await createNotificationService({
//             user: order.user,
//             type: "PAYMENT",
//             title: "Payment Successful",
//             message: `Your payment for order #${orderId.toString().slice(-6)} was successful.`,
//             relatedId: order._id,
//             relatedModel: "Order"
//         });

//         await notifyAdminsService({
//             type: "PAYMENT",
//             title: "Payment Received",
//             message: `Payment received for order #${orderId.toString().slice(-6)}.`,
//             relatedId: order._id,
//             relatedModel: "Order"
//         });

//     }

//     if (paymentStatus === "FAILED") {

//         await createNotificationService({
//             user: order.user,
//             type: "PAYMENT",
//             title: "Payment Failed",
//             message: `Your payment for order #${orderId.toString().slice(-6)} failed. Please try again.`,
//             relatedId: order._id,
//             relatedModel: "Order"
//         });

//     }

// }
// catch (notifError) {
//     console.error("PAYMENT NOTIFICATION ERROR:", notifError);
// }

//   };

//   // ======================================================
// // DEFAULT TRACKING MESSAGE
// // ======================================================

// const getDefaultTrackingMessage =
// (status) => {

//   switch (status) {

//     case "PENDING":
//       return "Your order has been placed.";

//     case "CONFIRMED":
//       return "Your order has been confirmed.";

//     case "PROCESSING":
//       return "Your order is being prepared.";

//     case "SHIPPED":
//       return "Your order has been shipped.";

//     case "DELIVERED":
//       return "Your order has been delivered.";

//     case "CANCELLED":
//       return "Your order has been cancelled.";

//     default:
//       return "Order status updated.";

//   }

// };


import * as orderRepository from "./order.repository.js";

import {
  getInventoryByProductId
} from "../inventory/inventory.repository.js";

import {
  removeStockService
} from "../inventory/inventory.service.js";

import Order from "./order.model.js";
import Product from "../products/product.model.js";

import {
  getActiveOffersDB
} from "../offer/offer.repository.js";

import {
  calculateDiscountedPrice,
  matchOfferToProduct
} from "../../common/utils/offerCalculator.js";

import {
  createNotificationService,
  notifyAdminsService
} from "../notification/notification.service.js";

import {
  validateCouponService,
  incrementCouponUsageService
} from "../coupons/coupon.service.js";


// ======================================================
// HELPER: BUILD SECURE ORDER ITEMS
// ======================================================

const buildSecureOrderItems = async (rawItems) => {

  if (
    !rawItems ||
    !Array.isArray(rawItems) ||
    rawItems.length === 0
  ) {
    throw new Error("Order must contain products");
  }

  const activeOffers = await getActiveOffersDB();

  const secureItems = [];

  let totalAmount = 0;

  for (const item of rawItems) {

    if (!item.product) {
      throw new Error("Product ID is required");
    }

    const productData =
      await Product.findById(item.product);

    if (!productData) {
      throw new Error(
        `Product not found: ${item.product}`
      );
    }

    // -----------------------------------------------
    // SECURE PRICE FROM DATABASE
    // -----------------------------------------------

    const originalPrice =
      Number(
        productData.pricing?.sellingPrice || 0
      );

    if (originalPrice < 0) {
      throw new Error(
        `Invalid price for product: ${productData.name}`
      );
    }

    // -----------------------------------------------
    // QUANTITY
    // -----------------------------------------------

    const quantity =
      Number(item.quantity);

    if (
      !Number.isInteger(quantity) ||
      quantity < 1
    ) {
      throw new Error(
        `Invalid quantity for ${productData.name}`
      );
    }

    // -----------------------------------------------
    // ACTIVE OFFER
    // -----------------------------------------------

    const offer =
      matchOfferToProduct(
        productData,
        activeOffers
      );

    const finalPrice =
      calculateDiscountedPrice(
        originalPrice,
        offer
      );

    const discountAmount =
      Math.max(
        originalPrice - finalPrice,
        0
      );

    // -----------------------------------------------
    // SECURE ORDER ITEM
    // -----------------------------------------------

    secureItems.push({

      product: productData._id,

      title: productData.name,

      quantity,

      originalPrice,

      discountAmount,

      price: finalPrice,

      appliedOffer: offer
        ? {
            offerId: offer._id,
            title: offer.title,
            discountType:
              offer.discountType,
            discountValue:
              offer.discountValue
          }
        : null,

      imageUrl:
        productData.images?.[0]?.url || ""

    });

    totalAmount +=
      finalPrice * quantity;
  }

  return {
    secureItems,
    totalAmount
  };
};


// ======================================================
// CREATE ORDER
// ======================================================

export const createOrder = async (

  orderData,

  createdBy

) => {

  // ====================================================
  // ORDER SOURCE
  // ====================================================

  const isWalkIn =
    orderData.orderSource === "WALK_IN";


  // ====================================================
  // BUILD SECURE ORDER ITEMS
  // ====================================================

  const {
    secureItems,
    totalAmount
  } =
    await buildSecureOrderItems(
      orderData.orderItems
    );


  orderData.orderItems =
    secureItems;


  orderData.totalAmount =
    totalAmount;


  // ====================================================
  // COUPON VALIDATION
  // ====================================================

  let couponDiscount = 0;

  let couponData = null;


  if (orderData.couponCode) {

    const result =
      await validateCouponService(

        orderData.couponCode,

        totalAmount,

        orderData.user

      );


    couponDiscount =
      Number(
        result.discountAmount || 0
      );


    couponData =
      result.coupon;


    if (!couponData) {
      throw new Error(
        "Invalid coupon"
      );
    }


    orderData.coupon =
      couponData.couponId;


    orderData.couponCode =
      couponData.code;


    orderData.couponDiscount =
      couponDiscount;

  }


  // ====================================================
  // FINAL AMOUNT
  // ====================================================

  orderData.finalAmount =
    Math.max(
      totalAmount - couponDiscount,
      0
    );


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
        !Number.isInteger(quantity) ||
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
            item.title ||
            item.product
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
            item.title ||
            "Product"
          } has only ${
            availableStock
          } stock available`

        );

      }

    }

  }


  // ====================================================
  // CREATE ORDER IN DATABASE
  // ====================================================

  const order =
    await orderRepository.createOrder(
      orderData
    );


  // ====================================================
  // INCREMENT COUPON USAGE
  // ====================================================

  if (couponData) {

    try {

      await incrementCouponUsageService(

        couponData.couponId,

        orderData.user

      );

    }
    catch (couponError) {

      // Coupon usage failure should not
      // break already-created order

      console.error(
        "COUPON USAGE INCREMENT ERROR:",
        couponError
      );

    }

  }


  // ====================================================
  // ORDER PLACED NOTIFICATIONS
  // ====================================================

  try {

    const isWalkInOrder =
      orderData.orderSource === "WALK_IN";


    // -----------------------------------------------
    // CUSTOMER NOTIFICATION
    // -----------------------------------------------

    if (!isWalkInOrder) {

      await createNotificationService({

        user:
          orderData.user,

        type:
          "ORDER_PLACED",

        title:
          "Order Placed",

        message:
          "Your order has been placed successfully.",

        relatedId:
          order._id,

        relatedModel:
          "Order"

      });

    }


    // -----------------------------------------------
    // ADMIN NOTIFICATION
    // -----------------------------------------------

    await notifyAdminsService({

      type:
        "ORDER_PLACED",

      title:
        isWalkInOrder
          ? "New Walk-in Order"
          : "New Order Received",

      message:
        isWalkInOrder

          ? `A walk-in order of ₹${orderData.finalAmount} was created.`

          : `A new order of ₹${orderData.finalAmount} has been placed.`,

      relatedId:
        order._id,

      relatedModel:
        "Order"

    });

  }
  catch (notifError) {

    // Notification should NEVER
    // break order creation

    console.error(
      "ORDER NOTIFICATION ERROR:",
      notifError
    );

  }


  // ====================================================
  // INITIAL TRACKING HISTORY
  // ====================================================

  try {

    const orderForTracking =
      await Order.findById(
        order._id
      );


    if (orderForTracking) {

      // -----------------------------------------------
      // CREATE TRACKING OBJECT
      // -----------------------------------------------

      if (
        !orderForTracking.tracking
      ) {

        orderForTracking.tracking = {

          history: [],

          courierName: "",

          trackingNumber: "",

          trackingUrl: "",

          expectedDeliveryDate:
            null

        };

      }


      // -----------------------------------------------
      // ENSURE HISTORY ARRAY
      // -----------------------------------------------

      if (
        !orderForTracking.tracking.history ||
        !Array.isArray(
          orderForTracking.tracking.history
        )
      ) {

        orderForTracking.tracking.history =
          [];

      }


      // -----------------------------------------------
      // INITIAL HISTORY
      // -----------------------------------------------

      orderForTracking.tracking.history.push({

        status:
          orderForTracking.orderStatus,

        message:
          orderForTracking.orderSource ===
          "WALK_IN"

            ? "Walk-in order created"

            : "Order placed successfully",

        updatedBy:
          createdBy,

        createdAt:
          new Date()

      });


      await orderForTracking.save();

    }

  }
  catch (trackingError) {

    // Tracking should NEVER
    // break order creation

    console.error(
      "TRACKING INITIALIZATION ERROR:",
      trackingError
    );

  }


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

        Number(
          item.quantity
        ),

        createdBy,

        "ORDER",

        `Walk-in sale - Order ${order._id}`

      );

    }

  }


  // ====================================================
  // ONLINE ORDER
  // ====================================================

  if (
    orderData.orderSource ===
    "ONLINE"
  ) {

    console.log(
      "ONLINE ORDER CREATED - STOCK NOT CHANGED"
    );

  }


  // ====================================================
  // RETURN CREATED ORDER
  // ====================================================

  return order;

};


// ======================================================
// GET ORDER BY ID
// ======================================================

export const getOrderById =
  async (
    orderId
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


    return order;

  };


// ======================================================
// GET USER ORDERS
// ======================================================

export const getUserOrders =
  async (
    userId
  ) => {

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
// UPDATE ORDER STATUS + TRACKING
// ======================================================

export const updateOrderStatus =
  async (

    orderId,

    status,

    updatedBy = null,

    message = ""

  ) => {

    // ==================================================
    // CHECK ORDER
    // ==================================================

    const order =
      await orderRepository.findOrderById(
        orderId
      );


    if (!order) {

      throw new Error(
        "Order not found"
      );

    }


    // ==================================================
    // UPDATE ORDER STATUS
    // ==================================================

    await orderRepository.updateOrderStatus(

      orderId,

      status

    );


    // ==================================================
    // TRACKING HISTORY
    // ==================================================

    try {

      const trackingOrder =
        await Order.findById(
          orderId
        );


      if (trackingOrder) {

        // ---------------------------------------------
        // CREATE TRACKING OBJECT
        // ---------------------------------------------

        if (
          !trackingOrder.tracking
        ) {

          trackingOrder.tracking = {

            history: [],

            courierName: "",

            trackingNumber: "",

            trackingUrl: "",

            expectedDeliveryDate:
              null

          };

        }


        // ---------------------------------------------
        // ENSURE HISTORY ARRAY
        // ---------------------------------------------

        if (
          !trackingOrder.tracking.history ||
          !Array.isArray(
            trackingOrder.tracking.history
          )
        ) {

          trackingOrder.tracking.history =
            [];

        }


        const history =
          trackingOrder.tracking.history;


        // ---------------------------------------------
        // PREVENT DUPLICATE CONSECUTIVE STATUS
        // ---------------------------------------------

        const lastHistory =
          history.length > 0
            ? history[
                history.length - 1
              ]
            : null;


        if (
          !lastHistory ||
          lastHistory.status !== status
        ) {

          history.push({

            status,

            message:
              message ||
              getDefaultTrackingMessage(
                status
              ),

            updatedBy,

            createdAt:
              new Date()

          });

        }


        // ---------------------------------------------
        // DELIVERED DATE
        // ---------------------------------------------

        if (
          status === "DELIVERED"
        ) {

          trackingOrder.deliveryDate =
            new Date();

        }


        await trackingOrder.save();


        // ==================================================
        // ORDER STATUS NOTIFICATIONS
        // ==================================================

        try {

          const customerMessages = {

            CONFIRMED:
              "Your order is confirmed.",

            PROCESSING:
              "Your order is being processed.",

            SHIPPED:
              "Your order has been shipped.",

            OUT_FOR_DELIVERY:
              "Your order is out for delivery.",

            DELIVERED:
              "Your order has been delivered successfully.",

            CANCELLED:
              "Your order has been cancelled.",

            RETURN_REQUESTED:
              "Your return request has been received.",

             RETURNED:
               "Your order has been returned successfully."

              

          };


          // ---------------------------------------------
          // CUSTOMER
          // ---------------------------------------------

          if (
            trackingOrder.user
          ) {

            await createNotificationService({

              user:
                trackingOrder.user,

              type:
                "ORDER_STATUS",

              title:
                "Order Status Updated",

              message:
                customerMessages[status] ||
                `Your order status is now ${status}.`,

              relatedId:
                orderId,

              relatedModel:
                "Order"

            });

          }


          // ---------------------------------------------
          // ADMIN
          // ---------------------------------------------

          if (
            status === "SHIPPED" ||
            status === "DELIVERED"
          ) {

            await notifyAdminsService({

              type:
                "ORDER_STATUS",

              title:
                `Order ${status}`,

              message:
                `Order #${orderId
                  .toString()
                  .slice(-6)} has been marked as ${status}.`,

              relatedId:
                orderId,

              relatedModel:
                "Order"

            });

          }

        }
        catch (notifError) {

          // Notification failure should
          // never break status update

          console.error(
            "ORDER STATUS NOTIFICATION ERROR:",
            notifError
          );

        }

      }

    }
    catch (trackingError) {

      // Tracking failure should
      // never break order status update

      console.error(
        "TRACKING UPDATE ERROR:",
        trackingError
      );

    }


    // ==================================================
    // RETURN FRESH ORDER
    // ==================================================

    return await
      orderRepository.findOrderById(
        orderId
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

    // ==================================================
    // CHECK ORDER
    // ==================================================

    const order =
      await orderRepository.findOrderById(
        orderId
      );


    if (!order) {

      throw new Error(
        "Order not found"
      );

    }


    // ==================================================
    // UPDATE PAYMENT IN DATABASE
    // ==================================================

    const updatedOrder =
      await orderRepository.updatePaymentStatus(

        orderId,

        paymentStatus,

        paymentId

      );


    // ==================================================
    // PAYMENT NOTIFICATIONS
    // ==================================================

    try {

      // -----------------------------------------------
      // PAYMENT SUCCESS
      // -----------------------------------------------

      if (
        paymentStatus === "PAID"
      ) {

        if (
          order.user
        ) {

          await createNotificationService({

            user:
              order.user,

            type:
              "PAYMENT",

            title:
              "Payment Successful",

            message:
              `Your payment for order #${orderId
                .toString()
                .slice(-6)} was successful.`,

            relatedId:
              order._id,

            relatedModel:
              "Order"

          });

        }


        // ---------------------------------------------
        // ADMIN PAYMENT NOTIFICATION
        // ---------------------------------------------

        await notifyAdminsService({

          type:
            "PAYMENT",

          title:
            "Payment Received",

          message:
            `Payment received for order #${orderId
              .toString()
              .slice(-6)}.`,

          relatedId:
            order._id,

          relatedModel:
            "Order"

        });

      }


      // -----------------------------------------------
      // PAYMENT FAILED
      // -----------------------------------------------

      if (
        paymentStatus === "FAILED"
      ) {

        if (
          order.user
        ) {

          await createNotificationService({

            user:
              order.user,

            type:
              "PAYMENT",

            title:
              "Payment Failed",

            message:
              `Your payment for order #${orderId
                .toString()
                .slice(-6)} failed. Please try again.`,

            relatedId:
              order._id,

            relatedModel:
              "Order"

          });

        }

      }

    }
    catch (notifError) {

      // Notification failure should
      // never break payment update

      console.error(
        "PAYMENT NOTIFICATION ERROR:",
        notifError
      );

    }


    // ==================================================
    // RETURN UPDATED ORDER
    // ==================================================

    return updatedOrder;

  };


// ======================================================
// DEFAULT TRACKING MESSAGE
// ======================================================

const getDefaultTrackingMessage =
  (status) => {

    switch (status) {

      case "PENDING":

        return (
          "Your order has been placed."
        );


      case "CONFIRMED":

        return (
          "Your order has been confirmed."
        );


      case "PROCESSING":

        return (
          "Your order is being prepared."
        );


      case "SHIPPED":

        return (
          "Your order has been shipped."
        );


      case "OUT_FOR_DELIVERY":

        return (
          "Your order is out for delivery."
        );


      case "DELIVERED":

        return (
          "Your order has been delivered."
        );


      case "CANCELLED":

        return (
          "Your order has been cancelled."
        );

        case "RETURN_REQUESTED":

           return "Your return request has been received.";


      case "RETURNED":

          return "Your order has been returned successfully.";


      default:

        return (
          "Order status updated."
        );

    }

  };