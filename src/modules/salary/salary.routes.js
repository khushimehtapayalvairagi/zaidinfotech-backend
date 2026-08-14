import express from "express";

import {
  createSalaryController,
  getSalaryController,
  updateSalaryController,
  getAllEmployeesSalaryController,
  getSalarySummaryController,
  exportSalaryExcel,
} from "./salary.controller.js";

import { verifyToken } from "../../common/middleware/auth.middleware.js";
import { allowRoles } from "../../common/middleware/role.middleware.js";
import { ROLES } from "../../common/constants/roles.js";

const router = express.Router();


// ======================================================
// IMPORTANT:
// STATIC ROUTES MUST COME BEFORE /:employeeId
// ======================================================


// ======================================================
// GET ALL EMPLOYEES SALARY
// GET /api/salary/all-summary
// ======================================================

router.get(
  "/all-summary",
  verifyToken,
  allowRoles(ROLES.ADMIN),
  getAllEmployeesSalaryController
);


// ======================================================
// EXPORT SALARY EXCEL
// GET /api/salary/export
// ======================================================

router.get(
  "/export",
  verifyToken,
  allowRoles(ROLES.ADMIN),
  exportSalaryExcel
);


// ======================================================
// GET SALARY SUMMARY
// GET /api/salary/summary/:employeeId
// ======================================================

router.get(
  "/summary/:employeeId",
  verifyToken,
  allowRoles(ROLES.ADMIN),
  getSalarySummaryController
);


// ======================================================
// CONFIGURE SALARY
// POST /api/salary/config/:employeeId
// ======================================================

router.post(
  "/config/:employeeId",
  verifyToken,
  allowRoles(ROLES.ADMIN),
  createSalaryController
);


// ======================================================
// PAY / RECORD SALARY
// PUT /api/salary/pay/:employeeId
// ======================================================

router.put(
  "/pay/:employeeId",
  verifyToken,
  allowRoles(ROLES.ADMIN),
  updateSalaryController
);


// ======================================================
// GET SINGLE EMPLOYEE SALARY
// GET /api/salary/:employeeId
// ======================================================

router.get(
  "/:employeeId",
  verifyToken,
  allowRoles(ROLES.ADMIN),
  getSalaryController
);


export default router;