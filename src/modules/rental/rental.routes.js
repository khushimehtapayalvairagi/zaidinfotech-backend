import express from "express";

import {
    getRentalProductsController,
    getRentalProductController,
    saveRentalProductController
} from "./rentalProduct.controller.js";

import {
    createRentalController,
    getMyRentalsController,
    getRentalController,
    getAllRentalsController,
    approveRentalController,
    rejectRentalController,
    requestReturnController,
    markRentalReturnedController
} from "./rental.controller.js";


// IMPORTANT:
// apne project ka existing auth middleware use karo
import { verifyToken } from "../../common/middleware/auth.middleware.js";


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
// CUSTOMER - CREATE RENTAL
// =====================================================

router.post(
    "/",
    verifyToken,
    createRentalController
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
// CUSTOMER / ADMIN - SINGLE RENTAL
// =====================================================

router.get(
    "/:id",
    verifyToken,
    getRentalController
);


// =====================================================
// ADMIN - ALL RENTALS
// =====================================================

router.get(
    "/",
    verifyToken,
    getAllRentalsController
);


// =====================================================
// ADMIN - APPROVE
// =====================================================

router.patch(
    "/:id/approve",
    verifyToken,
    approveRentalController
);


// =====================================================
// ADMIN - REJECT
// =====================================================

router.patch(
    "/:id/reject",
    verifyToken,
    rejectRentalController
);


// =====================================================
// CUSTOMER - RETURN REQUEST
// =====================================================

router.patch(
    "/:id/return-request",
    verifyToken,
    requestReturnController
);


// =====================================================
// ADMIN - MARK RETURNED
// =====================================================

router.patch(
    "/:id/returned",
    verifyToken,
    markRentalReturnedController
);


export default router;