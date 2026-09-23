import express from "express";

import {
    createPayment,
    getPaymentById,
    getMyPayments,
    getAllPayments,
    paymentSuccess,
    paymentFailed,
    refundPayment,
    createRazorpayOrder,
    verifyRazorpayPaymentController,
} from "./payment.controller.js";

import {
    createPaymentValidation,
    paymentSuccessValidation,
    paymentFailedValidation,
    refundPaymentValidation,
} from "./payment.validation.js";

import { validate } from "../../common/middleware/validate.middleware.js";
import { verifyToken } from "../../common/middleware/auth.middleware.js";

const router = express.Router();


// =====================================================
// RAZORPAY
// =====================================================

// CREATE RAZORPAY ORDER
router.post(
    "/razorpay/order",
    verifyToken,
    createRazorpayOrder
);


// VERIFY RAZORPAY PAYMENT
router.post(
    "/razorpay/verify",
    verifyToken,
    verifyRazorpayPaymentController
);


// =====================================================
// CREATE PAYMENT
// =====================================================

router.post(
    "/",
    verifyToken,
    validate(createPaymentValidation),
    createPayment
);


// =====================================================
// GET ALL PAYMENTS
// Accountant / Admin / Sales
//
// IMPORTANT:
// This must come BEFORE /:id
// =====================================================

router.get(
    "/",
    verifyToken,
    getAllPayments
);


// =====================================================
// GET MY PAYMENTS
// =====================================================

router.get(
    "/my",
    verifyToken,
    getMyPayments
);


// =====================================================
// GET PAYMENT BY ID
// =====================================================

router.get(
    "/:id",
    verifyToken,
    getPaymentById
);


// =====================================================
// PAYMENT SUCCESS
// =====================================================

router.patch(
    "/:id/success",
    verifyToken,
    validate(paymentSuccessValidation),
    paymentSuccess
);


// =====================================================
// PAYMENT FAILED
// =====================================================

router.patch(
    "/:id/failed",
    verifyToken,
    validate(paymentFailedValidation),
    paymentFailed
);


// =====================================================
// REFUND
// =====================================================

router.patch(
    "/:id/refund",
    verifyToken,
    validate(refundPaymentValidation),
    refundPayment
);


export default router;