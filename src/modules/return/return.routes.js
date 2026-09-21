import express from "express";

import {
    createReturnController,
    getReturnsController,
    getMyReturnsController,
    getReturnController,
    getReturnsByOrderController,
    approveReturnController,
    rejectReturnController,
    markPickupRequestedController,
    markPickedUpController,
    receiveReturnController,
    inspectReturnController,
    completeReturnController,
    cancelReturnController
} from "./return.controller.js";

// IMPORTANT:
// Apne project ka existing authentication middleware use karo.
// Example:
// import { protect } from "../../middlewares/auth.middleware.js";

import {
  verifyToken
} from "../../common/middleware/auth.middleware.js";
const router = express.Router();


// ======================================================
// CUSTOMER
// ======================================================

// Create return request
router.post(
    "/",
    createReturnController
);


// My returns
router.get(
    "/my",
    getMyReturnsController
);


// Returns for particular order
router.get(
    "/order/:orderId",
    getReturnsByOrderController
);


// Single return
router.get(
    "/:id",
    getReturnController
);


// ======================================================
// ADMIN / SALES / RETURN TEAM
// ======================================================

// All returns
router.get(
    "/",
    getReturnsController
);


// Approve
router.patch(
    "/:id/approve",
    approveReturnController
);


// Reject
router.patch(
    "/:id/reject",
    rejectReturnController
);


// Pickup request
router.patch(
    "/:id/pickup-request",
    markPickupRequestedController
);


// Mark picked up
router.patch(
    "/:id/picked-up",
    markPickedUpController
);


// Receive product
router.patch(
    "/:id/receive",
    receiveReturnController
);


// Inspect
router.patch(
    "/:id/inspect",
    inspectReturnController
);


// Complete
router.patch(
    "/:id/complete",
    completeReturnController
);


// Cancel
router.patch(
    "/:id/cancel",
    cancelReturnController
);


export default router;