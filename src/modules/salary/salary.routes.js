import express from "express";

import {
  createSalaryController,
  getSalaryController,
  updateSalaryController,
  getAllEmployeesSalaryController,
  getSalarySummaryController,
  exportSalaryExcel,
  updateBankDetailsController,
  calculateEmployeeSalaryController,
} from "./salary.controller.js";

import { verifyToken } from "../../common/middleware/auth.middleware.js";
import { allowRoles } from "../../common/middleware/role.middleware.js";
import { ROLES } from "../../common/constants/roles.js";

const router = express.Router();


// ======================================================
// GET ALL EMPLOYEES SALARY
// GET /api/salary/all-summary
// ======================================================

router.get(
  "/all-summary",
  verifyToken,
  allowRoles(
    ROLES.ADMIN,
    ROLES.HR,
    ROLES.SALES
  ),
  getAllEmployeesSalaryController
);


// ======================================================
// EXPORT SALARY EXCEL
// GET /api/salary/export
// ======================================================

router.get(
  "/export",
  verifyToken,
  allowRoles(
    ROLES.ADMIN,
    ROLES.HR,
    ROLES.SALES
  ),
  exportSalaryExcel
);


// ======================================================
// GET SALARY SUMMARY
// GET /api/salary/summary/:employeeId
// ======================================================

router.get(
  "/summary/:employeeId",
  verifyToken,
  allowRoles(
    ROLES.ADMIN,
    ROLES.HR,
    ROLES.SALES
  ),
  getSalarySummaryController
);


// ======================================================
// CONFIGURE EMPLOYEE SALARY
// POST /api/salary/config/:employeeId
// ======================================================
// HR sets salary structure
// ADMIN can also manage

router.post(
  "/config/:employeeId",
  verifyToken,
  allowRoles(
    ROLES.ADMIN,
    ROLES.HR
  ),
  createSalaryController
);


// ======================================================
// CALCULATE MONTHLY SALARY
// POST /api/salary/calculate/:employeeId
// ======================================================
// Calculates salary and creates/updates PENDING record

router.post(
  "/calculate/:employeeId",
  verifyToken,
  allowRoles(
    ROLES.ADMIN,
    ROLES.HR,
    ROLES.SALES
  ),
  calculateEmployeeSalaryController
);


// ======================================================
// PAY SALARY
// PUT /api/salary/pay/:employeeId
// ======================================================
// Actual payment is done by ACCOUNTANT
// ADMIN can also pay

router.put(
  "/pay/:employeeId",
  verifyToken,
  allowRoles(
    ROLES.ADMIN,
    ROLES.SALES
  ),
  updateSalaryController
);


// ======================================================
// UPDATE BANK DETAILS
// PUT /api/salary/bank/:employeeId
// ======================================================
// HR maintains employee bank details
// ADMIN can manage

router.put(
  "/bank/:employeeId",
  verifyToken,
  allowRoles(
    ROLES.ADMIN,
    ROLES.HR
  ),
  updateBankDetailsController
);


// ======================================================
// GET SINGLE EMPLOYEE SALARY
// GET /api/salary/:employeeId
// ======================================================

router.get(
  "/:employeeId",
  verifyToken,
  allowRoles(
    ROLES.ADMIN,
    ROLES.HR,
  
    ROLES.SALES
  ),
  getSalaryController
);


export default router;