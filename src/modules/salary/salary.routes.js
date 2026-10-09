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
// SALARY ACCESS ROLES
// ======================================================
//
// ADMIN
// HR_EXECUTIVE
// ACCOUNTANT
// SALES
//
// All salary routes below use these roles.
// ======================================================


// ======================================================
// GET ALL EMPLOYEES SALARY
// GET /api/salary/all-summary
// ======================================================

router.get(
  "/all-summary",
  verifyToken,
  allowRoles(
    ROLES.ADMIN,
    ROLES.HR_EXECUTIVE,
    ROLES.ACCOUNTANT,
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
    ROLES.HR_EXECUTIVE,
    ROLES.ACCOUNTANT,
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
    ROLES.HR_EXECUTIVE,
    ROLES.ACCOUNTANT,
    ROLES.SALES
  ),
  getSalarySummaryController
);


// ======================================================
// CONFIGURE EMPLOYEE SALARY
// POST /api/salary/config/:employeeId
// ======================================================

router.post(
  "/config/:employeeId",
  verifyToken,
  allowRoles(
    ROLES.ADMIN,
    ROLES.HR_EXECUTIVE,
    ROLES.ACCOUNTANT,
    ROLES.SALES
  ),
  createSalaryController
);


// ======================================================
// CALCULATE MONTHLY SALARY
// POST /api/salary/calculate/:employeeId
// ======================================================

router.post(
  "/calculate/:employeeId",
  verifyToken,
  allowRoles(
    ROLES.ADMIN,
    ROLES.HR_EXECUTIVE,
    ROLES.ACCOUNTANT,
    ROLES.SALES
  ),
  calculateEmployeeSalaryController
);


// ======================================================
// PAY SALARY
// PUT /api/salary/pay/:employeeId
// ======================================================
//
// Salary payment can be done by:
// ADMIN
// HR
// ACCOUNTANT
// SALES
//
// ======================================================

router.put(
  "/pay/:employeeId",
  verifyToken,
  allowRoles(
    ROLES.ADMIN,
    ROLES.HR_EXECUTIVE,
    ROLES.ACCOUNTANT,
    ROLES.SALES
  ),
  updateSalaryController
);


// ======================================================
// UPDATE BANK DETAILS
// PUT /api/salary/bank/:employeeId
// ======================================================

router.put(
  "/bank/:employeeId",
  verifyToken,
  allowRoles(
    ROLES.ADMIN,
    ROLES.HR_EXECUTIVE,
    ROLES.ACCOUNTANT,
    ROLES.SALES
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
    ROLES.HR_EXECUTIVE,
    ROLES.ACCOUNTANT,
    ROLES.SALES
  ),
  getSalaryController
);


export default router;