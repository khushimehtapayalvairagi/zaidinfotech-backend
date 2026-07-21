import express from "express";


import {

    createPayment,

    getPaymentById,

    getMyPayments,

    getAllPayments,

    paymentSuccess,

    paymentFailed,

    refundPayment


} from "./payment.controller.js";



import {

    createPaymentValidation,

    paymentSuccessValidation,

    paymentFailedValidation,

    refundPaymentValidation


} from "./payment.validation.js";



import { validate } from "../../common/middleware/validate.middleware.js";


import { verifyToken } from "../../common/middleware/auth.middleware.js";



const router = express.Router();




// =======================================
// CREATE PAYMENT
// Customer
// =======================================

router.post(

    "/",

    verifyToken,

    validate(createPaymentValidation),

    createPayment

);




// =======================================
// GET MY PAYMENTS
// Customer
// =======================================

router.get(

    "/my",

    verifyToken,

    getMyPayments

);




// =======================================
// GET PAYMENT BY ID
// Customer/Admin
// =======================================

router.get(

    "/:id",

    verifyToken,

    getPaymentById

);




// =======================================
// GET ALL PAYMENTS
// Admin
// =======================================

router.get(

    "/",

    verifyToken,

    getAllPayments

);




// =======================================
// PAYMENT SUCCESS
// Gateway Callback/Admin
// =======================================

router.patch(

    "/:id/success",

    verifyToken,

    validate(paymentSuccessValidation),

    paymentSuccess

);




// =======================================
// PAYMENT FAILED
// Gateway Callback/Admin
// =======================================

router.patch(

    "/:id/failed",

    verifyToken,

    validate(paymentFailedValidation),

    paymentFailed

);




// =======================================
// REFUND PAYMENT
// Admin
// =======================================

router.patch(

    "/:id/refund",

    verifyToken,

    validate(refundPaymentValidation),

    refundPayment

);



export default router;