


import express from "express";

import {
  getDailyCollectionController,
  getMonthlyCollectionController,
  getFinancialSummaryController,
  getSalesCollectionController,
  getRepairCollectionController,
  getRentalCollectionController,
  getVendorPaymentsController,
  getPendingPaymentsController,
  getPaymentMethodController,
  getProfitLossController
} from "./financialReports.controller.js";

import { verifyToken } from "../../common/middleware/auth.middleware.js";
import { allowRoles } from "../../common/middleware/role.middleware.js";
import { ROLES } from "../../common/constants/roles.js";


const router =
  express.Router();


// ======================================================
// DAILY COLLECTION
// ======================================================

router.get(
  "/daily",
  verifyToken,

  allowRoles(
    ROLES.ADMIN,
    ROLES.SALES
  ),

  getDailyCollectionController
);


// ======================================================
// MONTHLY COLLECTION
// ======================================================

router.get(
  "/monthly",
  verifyToken,

  allowRoles(
    ROLES.ADMIN,
    ROLES.SALES
  ),

  getMonthlyCollectionController
);


// ======================================================
// GENERAL SUMMARY
// ======================================================

router.get(
  "/summary",
  verifyToken,

  allowRoles(
    ROLES.ADMIN,
    ROLES.SALES
  ),

  getFinancialSummaryController
);


// ======================================================
// SALES COLLECTION
// ======================================================

router.get(
  "/sales",
  verifyToken,

  allowRoles(
    ROLES.ADMIN,
    ROLES.SALES
  ),

  getSalesCollectionController
);


// ======================================================
// REPAIR COLLECTION
// ======================================================

router.get(
  "/repair",
  verifyToken,

  allowRoles(
    ROLES.ADMIN,
    ROLES.SALES
  ),

  getRepairCollectionController
);


// ======================================================
// RENTAL COLLECTION
// ======================================================

router.get(
  "/rental",
  verifyToken,

  allowRoles(
    ROLES.ADMIN,
    ROLES.SALES
  ),

  getRentalCollectionController
);


// ======================================================
// VENDOR PAYMENTS
// ======================================================

router.get(
  "/vendor-payments",
  verifyToken,

  allowRoles(
    ROLES.ADMIN,
    ROLES.SALES
  ),

  getVendorPaymentsController
);


// ======================================================
// PENDING PAYMENTS
// ======================================================

router.get(
  "/pending-payments",
  verifyToken,

  allowRoles(
    ROLES.ADMIN,
    ROLES.SALES
  ),

  getPendingPaymentsController
);


// ======================================================
// PAYMENT METHOD BREAKDOWN
// ======================================================

router.get(
  "/payment-methods",
  verifyToken,

  allowRoles(
    ROLES.ADMIN,
    ROLES.SALES
  ),

  getPaymentMethodController
);


// ======================================================
// PROFIT / LOSS
// ======================================================

router.get(
  "/profit-loss",
  verifyToken,

  allowRoles(
    ROLES.ADMIN,
    ROLES.SALES
  ),

  getProfitLossController
);


export default router;

