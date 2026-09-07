import express from "express";


// =====================================================
// RENTAL PRODUCT CONTROLLERS
// =====================================================

import {
    getRentalProductsController,
    getRentalProductController,
    saveRentalProductController
} from "./rentalProduct.controller.js";


// =====================================================
// RENTAL CONTROLLERS
// =====================================================

import {
    createRentalController,
    getMyRentalsController,
    getRentalController,
    getAllRentalsController,
    approveRentalController,
    rejectRentalController,
    markDepositReceivedController,
    markRentalReturnedController,
    allocateRentalController
} from "./rental.controller.js";


// =====================================================
// RENTAL INVENTORY CONTROLLER
// =====================================================

import {
    getRentalInventoryController
} from "./rentalInventory.controller.js";


// =====================================================
// RENTAL DOCUMENT CONTROLLERS
// =====================================================

import {
    uploadRentalDocumentController,
    getRentalDocumentsController,
    verifyRentalDocumentController
} from "./rentalDocument.controller.js";


// =====================================================
// MIDDLEWARE
// =====================================================

import {
    verifyToken,
  
} from "../../common/middleware/auth.middleware.js";

import {
    rentalDocumentUpload
} from "../../common/middleware/upload.middleware.js";

import { allowRoles } from "../../common/middleware/role.middleware.js";
const router = express.Router();


// =====================================================
// CUSTOMER - RENTAL PRODUCTS
// =====================================================

router.get(
    "/products",
    getRentalProductsController
);


// =====================================================
// GET RENTAL CONFIG BY PRODUCT
// =====================================================

router.get(
    "/product/:productId",
    verifyToken,
    getRentalProductController
);


// =====================================================
// ADMIN - CREATE / UPDATE RENTAL CONFIG
// =====================================================

router.put(
    "/product/:productId",
    verifyToken,
    saveRentalProductController
);


// =====================================================
// ADMIN - RENTAL INVENTORY
// IMPORTANT: /inventory MUST COME BEFORE /:id
// =====================================================

router.get(
    "/inventory",
    verifyToken,
    getRentalInventoryController
);


// =====================================================
// CREATE RENTAL
// =====================================================

router.post(
    "/",
    verifyToken,
    createRentalController
);


// =====================================================
// CUSTOMER - UPLOAD RENTAL DOCUMENT
// =====================================================

router.post(
    "/:rentalId/documents",
    verifyToken,
    rentalDocumentUpload.single("document"),
    uploadRentalDocumentController
);


// =====================================================
// CUSTOMER / STAFF - GET RENTAL DOCUMENTS
// =====================================================

router.get(
    "/:rentalId/documents",
    verifyToken,
    getRentalDocumentsController
);


// =====================================================
// ADMIN / STAFF - VERIFY RENTAL DOCUMENT
// =====================================================

router.patch(
    "/documents/:documentId/verify",
    verifyToken,
    allowRoles("ADMIN", "STAFF"),
    verifyRentalDocumentController
);


// =====================================================
// CUSTOMER - MY RENTALS
// =====================================================

router.get(
    "/my",
    verifyToken,
    getMyRentalsController
);


// =====================================================
// ALL RENTALS
// =====================================================

router.get(
    "/",
    verifyToken,
    getAllRentalsController
);


// =====================================================
// SINGLE RENTAL
// IMPORTANT: Keep after specific routes
// =====================================================

router.get(
    "/:id",
    verifyToken,
    getRentalController
);


// =====================================================
// APPROVE RENTAL
// PENDING → DEPOSIT_PENDING
// =====================================================

router.patch(
    "/:id/approve",
    verifyToken,
    approveRentalController
);


// =====================================================
// REJECT RENTAL
// =====================================================

router.patch(
    "/:id/reject",
    verifyToken,
    rejectRentalController
);


// =====================================================
// SECURITY DEPOSIT RECEIVED
// DEPOSIT_PENDING → READY_FOR_ALLOCATION
// =====================================================

router.patch(
    "/:id/deposit-received",
    verifyToken,
    markDepositReceivedController
);


// =====================================================
// ALLOCATE PHYSICAL PRODUCT
// READY_FOR_ALLOCATION → ACTIVE
//
// availableQuantity - 1
// rentedQuantity + 1
// =====================================================

router.patch(
    "/:id/allocate",
    verifyToken,
    allocateRentalController
);


// =====================================================
// RECEIVE PHYSICAL RETURN
// ACTIVE → SETTLEMENT_PENDING
//
// availableQuantity + 1
// rentedQuantity - 1
// =====================================================

router.patch(
    "/:id/return",
    verifyToken,
    markRentalReturnedController
);


export default router;