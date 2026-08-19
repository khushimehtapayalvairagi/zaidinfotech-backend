import express from "express";

import * as reviewController
    from "./review.controller.js";


import { verifyToken } from "../../common/middleware/auth.middleware.js";

import {
    allowRoles
} from "../../common/middleware/role.middleware.js";


const router = express.Router();


// =======================================
// PUBLIC
// =======================================

// Product Reviews
router.get(
    "/product/:productId",
    reviewController.getProductReviews
);


// Product Rating Summary
router.get(
    "/product/:productId/summary",
    reviewController.getProductRatingSummary
);


// =======================================
// CUSTOMER
// =======================================

// Create Review
router.post(
    "/",
    verifyToken,
    reviewController.createReview
);


// My Reviews
router.get(
    "/my",
    verifyToken,
    reviewController.getMyReviews
);


// Update My Review
router.put(
    "/:id",
    verifyToken,
    reviewController.updateMyReview
);


// Delete My Review
router.delete(
    "/:id",
    verifyToken,
    reviewController.deleteMyReview
);


// =======================================
// ADMIN
// =======================================

// All Reviews
router.get(
    "/admin/all",
    verifyToken,
    allowRoles("ADMIN", "SUPER_ADMIN"),
    reviewController.getAllReviews
);


// Review Details
router.get(
    "/admin/:id",
    verifyToken,
    allowRoles("ADMIN", "SUPER_ADMIN"),
    reviewController.getReviewById
);


// Approve
router.patch(
    "/admin/:id/approve",
    verifyToken,
    allowRoles("ADMIN", "SUPER_ADMIN"),
    reviewController.approveReview
);


// Reject
router.patch(
    "/admin/:id/reject",
    verifyToken,
    allowRoles("ADMIN", "SUPER_ADMIN"),
    reviewController.rejectReview
);


export default router;