import express from "express";

import {
    createRefund,
    approveRefund,
    processRefund,
    rejectRefund,
    getRefund,
    getOrderRefunds,
    getAllRefunds
} from "./refund.controller.js";

import {
    verifyToken
} from "../../common/middleware/auth.middleware.js";

import {
    allowRoles
} from "../../common/middleware/role.middleware.js";


const router = express.Router();


// =====================================================
// CREATE REFUND REQUEST
// =====================================================

router.post(
    "/",
    verifyToken,
    allowRoles(

        "ADMIN",
        "SALES"
    ),
    createRefund
);


// =====================================================
// GET ALL REFUNDS
// =====================================================

router.get(
    "/",
    verifyToken,
    allowRoles(
        "ADMIN",
        "SALES",
        "HR_EXECUTIVE"
    ),
    getAllRefunds
);


// =====================================================
// GET REFUNDS OF ORDER
// =====================================================

router.get(
    "/order/:orderId",
    verifyToken,
    allowRoles(
        "ADMIN",
        "SALES"
    ),
    getOrderRefunds
);


// =====================================================
// GET SINGLE REFUND
// =====================================================

router.get(
    "/:id",
    verifyToken,
    allowRoles(
        "ADMIN",
        "SALES"
    ),
    getRefund
);


// =====================================================
// APPROVE
// =====================================================

router.patch(
    "/:id/approve",
    verifyToken,
    allowRoles(
         "ADMIN",
        "SALES"
    ),
    approveRefund
);


// =====================================================
// REJECT
// =====================================================

router.patch(
    "/:id/reject",
    verifyToken,
    allowRoles(
         "ADMIN",
        "SALES"
    ),
    rejectRefund
);


// =====================================================
// PROCESS
// =====================================================

router.patch(
    "/:id/process",
    verifyToken,
    allowRoles(
        "ADMIN",
        "SALES"
    ),
    processRefund
);


export default router;