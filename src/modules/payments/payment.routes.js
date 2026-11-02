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
import { allowRoles } from "../../common/middleware/role.middleware.js";

const router = express.Router();

// =====================================================
// ROLE CONFIGURATION
// =====================================================

const PAYMENT_VIEW_ROLES = [
  "SUPER_ADMIN",
  "ADMIN",
  "ACCOUNTANT",
  "SALES",
];

// =====================================================
// RAZORPAY ORDER
// POST /api/payments/razorpay/order
// =====================================================

router.post(
  "/razorpay/order",
  verifyToken,
  createRazorpayOrder
);

// =====================================================
// VERIFY RAZORPAY PAYMENT
// POST /api/payments/razorpay/verify
// =====================================================

router.post(
  "/razorpay/verify",
  verifyToken,
  verifyRazorpayPaymentController
);

// =====================================================
// CREATE PAYMENT
// POST /api/payments
// =====================================================

router.post(
  "/",
  verifyToken,
  validate(createPaymentValidation),
  createPayment
);

// =====================================================
// GET ALL PAYMENTS
// GET /api/payments
// Accountant can view all payment records.
// =====================================================

router.get(
  "/",
  verifyToken,
  allowRoles(...PAYMENT_VIEW_ROLES),
  getAllPayments
);

// =====================================================
// GET MY PAYMENTS
// GET /api/payments/my
// =====================================================

router.get(
  "/my",
  verifyToken,
  getMyPayments
);

// =====================================================
// PAYMENT SUCCESS
// PATCH /api/payments/:id/success
// =====================================================

router.patch(
  "/:id/success",
  verifyToken,
  validate(paymentSuccessValidation),
  paymentSuccess
);

// =====================================================
// PAYMENT FAILED
// PATCH /api/payments/:id/failed
// =====================================================

router.patch(
  "/:id/failed",
  verifyToken,
  validate(paymentFailedValidation),
  paymentFailed
);

// =====================================================
// REFUND PAYMENT
// PATCH /api/payments/:id/refund
// =====================================================

router.patch(
  "/:id/refund",
  verifyToken,
  validate(refundPaymentValidation),
  refundPayment
);

// =====================================================
// GET PAYMENT BY ID
// GET /api/payments/:id
// =====================================================

router.get(
  "/:id",
  verifyToken,
  allowRoles(...PAYMENT_VIEW_ROLES),
  getPaymentById
);

export default router;