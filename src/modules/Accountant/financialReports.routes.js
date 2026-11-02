// import express from "express";

// import {
//   getDailyCollectionController,
//   getMonthlyCollectionController,
//   getFinancialSummaryController,
//   getSalesCollectionController,
//   getRepairCollectionController,
//   getRentalCollectionController,
//   getVendorPaymentsController,
//   getPendingPaymentsController,
//   getPaymentMethodController,
//   getProfitLossController
// } from "./financialReports.controller.js";

// import { verifyToken } from "../../common/middleware/auth.middleware.js";
// import { allowRoles } from "../../common/middleware/role.middleware.js";
// import { ROLES } from "../../common/constants/roles.js";

// const router = express.Router();


// // ======================================================
// // DAILY COLLECTION
// // ADMIN + SALES + ACCOUNTANT
// // ======================================================

// router.get(
//   "/daily",
//   verifyToken,
//   allowRoles(
//     ROLES.ADMIN,
//     ROLES.SALES,
//     ROLES.ACCOUNTANT
//   ),
//   getDailyCollectionController
// );


// // ======================================================
// // MONTHLY COLLECTION
// // ADMIN + SALES + ACCOUNTANT
// // ======================================================

// router.get(
//   "/monthly",
//   verifyToken,
//   allowRoles(
//     ROLES.ADMIN,
//     ROLES.SALES,
//     ROLES.ACCOUNTANT
//   ),
//   getMonthlyCollectionController
// );


// // ======================================================
// // GENERAL FINANCIAL SUMMARY
// // ADMIN + SALES + ACCOUNTANT
// // ======================================================

// router.get(
//   "/summary",
//   verifyToken,
//   allowRoles(
//     ROLES.ADMIN,
//     ROLES.SALES,
//     ROLES.ACCOUNTANT
//   ),
//   getFinancialSummaryController
// );


// // ======================================================
// // SALES COLLECTION
// // ADMIN + SALES + ACCOUNTANT
// // ======================================================

// router.get(
//   "/sales",
//   verifyToken,
//   allowRoles(
//     ROLES.ADMIN,
//     ROLES.SALES,
//     ROLES.ACCOUNTANT
//   ),
//   getSalesCollectionController
// );


// // ======================================================
// // REPAIR COLLECTION
// // ADMIN + SALES + ACCOUNTANT
// // ======================================================

// router.get(
//   "/repair",
//   verifyToken,
//   allowRoles(
//     ROLES.ADMIN,
//     ROLES.SALES,
//     ROLES.ACCOUNTANT
//   ),
//   getRepairCollectionController
// );


// // ======================================================
// // RENTAL COLLECTION
// // ADMIN + SALES + ACCOUNTANT
// // ======================================================

// router.get(
//   "/rental",
//   verifyToken,
//   allowRoles(
//     ROLES.ADMIN,
//     ROLES.SALES,
//     ROLES.ACCOUNTANT
//   ),
//   getRentalCollectionController
// );


// // ======================================================
// // VENDOR PAYMENTS
// // ADMIN + SALES + ACCOUNTANT
// // ======================================================

// router.get(
//   "/vendor-payments",
//   verifyToken,
//   allowRoles(
//     ROLES.ADMIN,
//     ROLES.SALES,
//     ROLES.ACCOUNTANT
//   ),
//   getVendorPaymentsController
// );


// // ======================================================
// // PENDING PAYMENTS
// // ADMIN + SALES + ACCOUNTANT
// // ======================================================

// router.get(
//   "/pending-payments",
//   verifyToken,
//   allowRoles(
//     ROLES.ADMIN,
//     ROLES.SALES,
//     ROLES.ACCOUNTANT
//   ),
//   getPendingPaymentsController
// );


// // ======================================================
// // PAYMENT METHOD BREAKDOWN
// // ADMIN + SALES + ACCOUNTANT
// // ======================================================

// router.get(
//   "/payment-methods",
//   verifyToken,
//   allowRoles(
//     ROLES.ADMIN,
//     ROLES.SALES,
//     ROLES.ACCOUNTANT
//   ),
//   getPaymentMethodController
// );


// // ======================================================
// // PROFIT / LOSS
// // ADMIN + SALES + ACCOUNTANT
// // ======================================================

// router.get(
//   "/profit-loss",
//   verifyToken,
//   allowRoles(
//     ROLES.ADMIN,
//     ROLES.SALES,
//     ROLES.ACCOUNTANT
//   ),
//   getProfitLossController
// );


// export default router;


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

// Correct middleware paths
import { verifyToken } from "../../common/middleware/auth.middleware.js";
import { allowRoles } from "../../common/middleware/role.middleware.js";
import { ROLES } from "../../common/constants/roles.js";

const router = express.Router();

// ======================================================
// ACCOUNTING ACCESS ROLES
// ======================================================

const ACCOUNTING_ROLES = [
  ROLES.ADMIN,
  ROLES.SALES,
  ROLES.ACCOUNTANT
];

// ======================================================
// DAILY COLLECTION
// GET /api/financial-reports/daily
// ======================================================

router.get(
  "/daily",
  verifyToken,
  allowRoles(...ACCOUNTING_ROLES),
  getDailyCollectionController
);

// ======================================================
// MONTHLY COLLECTION
// GET /api/financial-reports/monthly
// ======================================================

router.get(
  "/monthly",
  verifyToken,
  allowRoles(...ACCOUNTING_ROLES),
  getMonthlyCollectionController
);

// ======================================================
// FINANCIAL SUMMARY
// GET /api/financial-reports/summary
// ======================================================

router.get(
  "/summary",
  verifyToken,
  allowRoles(...ACCOUNTING_ROLES),
  getFinancialSummaryController
);

// ======================================================
// SALES COLLECTION
// GET /api/financial-reports/sales
// ======================================================

router.get(
  "/sales",
  verifyToken,
  allowRoles(...ACCOUNTING_ROLES),
  getSalesCollectionController
);

// ======================================================
// REPAIR COLLECTION
// GET /api/financial-reports/repair
// ======================================================

router.get(
  "/repair",
  verifyToken,
  allowRoles(...ACCOUNTING_ROLES),
  getRepairCollectionController
);

// ======================================================
// RENTAL COLLECTION
// GET /api/financial-reports/rental
// ======================================================

router.get(
  "/rental",
  verifyToken,
  allowRoles(...ACCOUNTING_ROLES),
  getRentalCollectionController
);

// ======================================================
// VENDOR PAYMENTS
// GET /api/financial-reports/vendor-payments
// ======================================================

router.get(
  "/vendor-payments",
  verifyToken,
  allowRoles(...ACCOUNTING_ROLES),
  getVendorPaymentsController
);

// ======================================================
// PENDING PAYMENTS
// GET /api/financial-reports/pending-payments
// ======================================================

router.get(
  "/pending-payments",
  verifyToken,
  allowRoles(...ACCOUNTING_ROLES),
  getPendingPaymentsController
);

// ======================================================
// PAYMENT METHOD BREAKDOWN
// GET /api/financial-reports/payment-methods
// ======================================================

router.get(
  "/payment-methods",
  verifyToken,
  allowRoles(...ACCOUNTING_ROLES),
  getPaymentMethodController
);

// ======================================================
// PROFIT / LOSS
// GET /api/financial-reports/profit-loss
// ======================================================

router.get(
  "/profit-loss",
  verifyToken,
  allowRoles(...ACCOUNTING_ROLES),
  getProfitLossController
);

export default router;