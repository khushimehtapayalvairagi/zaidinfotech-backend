import express from "express";


import {

    createOrder,

    getMyOrders,

    getOrderById,

    updateOrderStatus,

    updatePaymentStatus


} from "./order.controller.js";



import {

    createOrderValidation,

    updateOrderStatusValidation,

    updatePaymentStatusValidation


} from "./order.validation.js";



import { validate } from "../../common/middleware/validate.middleware.js";


import { verifyToken } from "../../common/middleware/auth.middleware.js";



const router = express.Router();




// =======================================
// CREATE ORDER
// Customer
// =======================================

router.post(

    "/",

    verifyToken,

    validate(createOrderValidation),

    createOrder

);




// =======================================
// GET MY ORDERS
// Customer
// =======================================

router.get(

    "/my",

    verifyToken,

    getMyOrders

);




// =======================================
// GET SINGLE ORDER
// Customer/Admin
// =======================================

router.get(

    "/:id",

    verifyToken,

    getOrderById

);




// =======================================
// UPDATE ORDER STATUS
// Admin
// =======================================

router.patch(

    "/:id/status",

    verifyToken,

    validate(updateOrderStatusValidation),

    updateOrderStatus

);




// =======================================
// UPDATE PAYMENT STATUS
// Payment System/Admin
// =======================================

router.patch(

    "/:id/payment",

    verifyToken,

    validate(updatePaymentStatusValidation),

    updatePaymentStatus

);



export default router;