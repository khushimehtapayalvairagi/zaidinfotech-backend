import express from "express";

import {
    getRentalProductsController,
    getRentalProductController,
    saveRentalProductController,
} from "./rentalProduct.controller.js";

import {
    createWalkInRentalController,
    getRentalController,
    getAllRentalsController,
    markRentalReturnedController,
    searchRentalsForReturnController,
    completeRentalSettlementController,
    markRentalDepositReceivedController
} from "./rental.controller.js";

import {
    getRentalPaymentScheduleController,
    recordRentalInstallmentPaymentController,
    getDueInstallmentsController,
    getReturnPreviewController
} from "./Rentalpayment.controller.js";

import {
    getRentalInventoryController,
} from "./rentalInventory.controller.js";

import {
    uploadRentalDocumentController,
    getRentalDocumentsController,
    verifyRentalDocumentController,
} from "./rentalDocument.controller.js";

import {
    verifyToken,
} from "../../common/middleware/auth.middleware.js";

import {
    rentalDocumentUpload,
} from "../../common/middleware/upload.middleware.js";

import {
    allowRoles,
} from "../../common/middleware/role.middleware.js";


const router = express.Router();

const STAFF_ROLES = [
    "SALES",
    "RECEPTIONIST",
    "ADMIN",
    "SUPER_ADMIN",
    "STAFF"
];


// ================= RENTAL PRODUCTS =================

router.get("/products", getRentalProductsController);

router.get(
    "/product/:productId",
    verifyToken,
    getRentalProductController
);

router.put(
    "/product/:productId",
    verifyToken,
    allowRoles("SALES"),
    saveRentalProductController
);


// ================= RENTAL INVENTORY =================

router.get(
    "/inventory",
    verifyToken,
    allowRoles("SALES"),
    getRentalInventoryController
);


// ================= WALK-IN RENTAL =================

router.post(
    "/walk-in",
    verifyToken,
    allowRoles("SALES"),
    createWalkInRentalController
);


// ================= DOCUMENTS =================

router.post(
    "/:rentalId/documents",
    verifyToken,
    allowRoles("SALES"),
    rentalDocumentUpload.single("document"),
    uploadRentalDocumentController
);

router.get(
    "/:rentalId/documents",
    verifyToken,
    allowRoles("SALES"),
    getRentalDocumentsController
);

router.patch(
    "/documents/:documentId/verify",
    verifyToken,
    allowRoles("SALES"),
    verifyRentalDocumentController
);


// ================= MONTHLY RENT PAYMENTS =================

// Overdue / upcoming installments (sab rentals)
// GET /rental/payments/due?scope=overdue | upcoming
router.get(
    "/payments/due",
    verifyToken,
    allowRoles(...STAFF_ROLES),
    getDueInstallmentsController
);

// Ek installment (month) ka rent receive karo
router.patch(
    "/payments/:paymentId/pay",
    verifyToken,
    allowRoles(...STAFF_ROLES),
    recordRentalInstallmentPaymentController
);

// Ek rental ka poora month-wise schedule
router.get(
    "/:id/payments",
    verifyToken,
    allowRoles(...STAFF_ROLES),
    getRentalPaymentScheduleController
);

// Return form ke liye: schedule se pending rent + mila hua deposit
router.get(
    "/:id/return-preview",
    verifyToken,
    allowRoles(...STAFF_ROLES),
    getReturnPreviewController
);


// ================= ALL RENTALS =================

router.get(
    "/",
    verifyToken,
    allowRoles(...STAFF_ROLES),
    getAllRentalsController
);


// ================= SEARCH FOR RETURN =================

router.get(
    "/return/search",
    verifyToken,
    allowRoles(...STAFF_ROLES),
    searchRentalsForReturnController
);


// ================= SECURITY DEPOSIT RECEIVED =================

router.patch(
    "/:id/deposit-received",
    verifyToken,
    allowRoles(...STAFF_ROLES),
    markRentalDepositReceivedController
);


// ================= SINGLE RENTAL =================

router.get(
    "/:id",
    verifyToken,
    allowRoles("SALES"),
    getRentalController
);


// ================= RETURN =================

router.patch(
    "/:id/return",
    verifyToken,
    allowRoles("SALES"),
    markRentalReturnedController
);


// ================= SETTLEMENT =================

router.patch(
    "/:id/settle",
    verifyToken,
    allowRoles(...STAFF_ROLES),
    completeRentalSettlementController
);


export default router;