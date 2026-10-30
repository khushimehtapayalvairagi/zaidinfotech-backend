import express from "express";

// =====================================================
// RENTAL PRODUCT CONTROLLERS
// =====================================================

import {
  getRentalProductsController,
  getRentalProductController,
  saveRentalProductController,
} from "./rentalProduct.controller.js";

// =====================================================
// RENTAL CONTROLLERS
// =====================================================

import {
  createWalkInRentalController,
  getRentalController,
  getAllRentalsController,
  markRentalReturnedController,
  searchRentalsForReturnController,
  completeRentalSettlementController,
  markRentalDepositReceivedController,
  updateRentalPricingController,
} from "./rental.controller.js";

// =====================================================
// RENTAL PAYMENT CONTROLLERS
// =====================================================

import {
  getRentalPaymentScheduleController,
  recordRentalInstallmentPaymentController,
  getDueInstallmentsController,
  getReturnPreviewController,
} from "./Rentalpayment.controller.js";

// =====================================================
// RENTAL INVENTORY CONTROLLERS
// =====================================================

import {
  getRentalInventoryController,
} from "./rentalInventory.controller.js";

import {
  adjustRentalStockController,
} from "./rentalStock.controller.js";

// =====================================================
// RENTAL DOCUMENT CONTROLLERS
// =====================================================

import {
  uploadRentalDocumentController,
  getRentalDocumentsController,
  verifyRentalDocumentController,
} from "./rentalDocument.controller.js";

// =====================================================
// MIDDLEWARE
// =====================================================

import {
  verifyToken,
} from "../../common/middleware/auth.middleware.js";

import {
  allowRoles,
} from "../../common/middleware/role.middleware.js";

import {
  rentalDocumentUpload,
} from "../../common/middleware/upload.middleware.js";

// =====================================================
// ROUTER
// =====================================================

const router = express.Router();

// =====================================================
// ROLE CONFIGURATION
// =====================================================

// Existing staff access preserved.
const STAFF_ROLES = [
  "SALES",
  "RECEPTIONIST",
  "ADMIN",
  "SUPER_ADMIN",
  "STAFF",
];

// Rental creation and management.
const MANAGEMENT_ROLES = [
  "SALES",
  "RECEPTIONIST",
  "ADMIN",
  "SUPER_ADMIN"
];

// Rental inventory access.
const INVENTORY_ROLES = [
  "SALES",
  "ADMIN",
  "SUPER_ADMIN",
  "INVENTORY",
];

// =====================================================
// 1. RENTAL PRODUCTS
// =====================================================

// GET /api/rentals/products
router.get(
  "/products",
  getRentalProductsController
);

// GET /api/rentals/product/:productId
router.get(
  "/product/:productId",
  verifyToken,
  getRentalProductController
);

// PUT /api/rentals/product/:productId
router.put(
  "/product/:productId",
  verifyToken,
  allowRoles(...MANAGEMENT_ROLES),
  saveRentalProductController
);

// =====================================================
// 2. RENTAL INVENTORY
// =====================================================

// GET /api/rentals/inventory
router.get(
  "/inventory",
  verifyToken,
  allowRoles(...INVENTORY_ROLES),
  getRentalInventoryController
);

// PATCH /api/rentals/inventory/:productId/stock
router.patch(
  "/inventory/:productId/stock",
  verifyToken,
  allowRoles(...INVENTORY_ROLES),
  adjustRentalStockController
);

// =====================================================
// 3. WALK-IN RENTAL CREATION
// =====================================================
//
// POST /api/rentals/walk-in
//
// Supports:
// - Individual customer
// - Company customer
// - GST billing
// - NON_GST billing
// - Standard monthly rent
// - Negotiated monthly rent
// - Security deposit
// - Initial rent payment
//
// IMPORTANT:
// Role access is checked here.
// Negotiation and NON_GST permissions are
// checked separately in controller/service.
//
// SALES:
//   Standard GST rental allowed.
//   Negotiation allowed by controller.
//
// ADMIN / SUPER_ADMIN:
//   GST and NON_GST subject to controller policy.
//
// =====================================================

router.post(
  "/walk-in",
  verifyToken,
  allowRoles(...MANAGEMENT_ROLES),
  createWalkInRentalController
);

// =====================================================
// 4. CUSTOMER DOCUMENTS
// =====================================================

// POST /api/rentals/:rentalId/documents
router.post(
  "/:rentalId/documents",
  verifyToken,
  allowRoles(...MANAGEMENT_ROLES),
  rentalDocumentUpload.single("document"),
  uploadRentalDocumentController
);

// GET /api/rentals/:rentalId/documents
router.get(
  "/:rentalId/documents",
  verifyToken,
  allowRoles(...MANAGEMENT_ROLES),
  getRentalDocumentsController
);

// PATCH /api/rentals/documents/:documentId/verify
router.patch(
  "/documents/:documentId/verify",
  verifyToken,
  allowRoles(...MANAGEMENT_ROLES),
  verifyRentalDocumentController
);

// =====================================================
// 5. MONTHLY RENTAL PAYMENTS
// =====================================================

// GET /api/rentals/payments/due?scope=overdue
// GET /api/rentals/payments/due?scope=upcoming
router.get(
  "/payments/due",
  verifyToken,
  allowRoles(...STAFF_ROLES),
  getDueInstallmentsController
);

// PATCH /api/rentals/payments/:paymentId/pay
router.patch(
  "/payments/:paymentId/pay",
  verifyToken,
  allowRoles(...STAFF_ROLES),
  recordRentalInstallmentPaymentController
);

// GET /api/rentals/:id/payments
router.get(
  "/:id/payments",
  verifyToken,
  allowRoles(...STAFF_ROLES),
  getRentalPaymentScheduleController
);

// GET /api/rentals/:id/return-preview
router.get(
  "/:id/return-preview",
  verifyToken,
  allowRoles(...STAFF_ROLES),
  getReturnPreviewController
);

// =====================================================
// 6. SEARCH RENTALS FOR RETURN
// =====================================================
//
// Keep this specific route before GET /:id.
// =====================================================

router.get(
  "/return/search",
  verifyToken,
  allowRoles(...STAFF_ROLES),
  searchRentalsForReturnController
);

// =====================================================
// 7. ALL RENTALS
// =====================================================

// GET /api/rentals
router.get(
  "/",
  verifyToken,
  allowRoles(...STAFF_ROLES),
  getAllRentalsController
);

// =====================================================
// 8. SECURITY DEPOSIT
// =====================================================

// PATCH /api/rentals/:id/deposit-received
router.patch(
  "/:id/deposit-received",
  verifyToken,
  allowRoles(...STAFF_ROLES),
  markRentalDepositReceivedController
);

// =====================================================
// 9. RENTAL PRICING UPDATE
// =====================================================
//
// PATCH /api/rentals/:rentalId/pricing
//
// Example:
//
// {
//   "monthlyRent": 1500,
//   "billingType": "NON_GST",
//   "negotiationReason": "Approved pricing change"
// }
//
// IMPORTANT:
// - Controller checks role permissions.
// - Service checks negotiation permissions.
// - Service checks NON_GST permissions.
// - Paid installments must not be modified.
// - GST rate must come from product configuration.
//
// =====================================================

router.patch(
  "/:rentalId/pricing",
  verifyToken,
  allowRoles(...MANAGEMENT_ROLES),
  updateRentalPricingController
);

// =====================================================
// 10. SINGLE RENTAL DETAILS
// =====================================================

// GET /api/rentals/:id
router.get(
  "/:id",
  verifyToken,
  allowRoles(...STAFF_ROLES),
  getRentalController
);

// =====================================================
// 11. MARK RENTAL RETURNED
// =====================================================
//
// PATCH /api/rentals/:id/return
//
// Rental becomes SETTLEMENT_PENDING.
// Stock release happens after settlement.
//
// =====================================================

router.patch(
  "/:id/return",
  verifyToken,
  allowRoles(...STAFF_ROLES),
  markRentalReturnedController
);

// =====================================================
// 12. COMPLETE RENTAL SETTLEMENT
// =====================================================

// PATCH /api/rentals/:id/settle
router.patch(
  "/:id/settle",
  verifyToken,
  allowRoles(...STAFF_ROLES),
  completeRentalSettlementController
);

// =====================================================
// EXPORT ROUTER
// =====================================================

export default router;