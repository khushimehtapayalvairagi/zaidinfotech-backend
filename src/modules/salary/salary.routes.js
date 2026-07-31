import express from "express";
import {
  createSalaryController,
  getSalaryController,
  updateSalaryController,
  getAllEmployeesSalaryController,
  getSalarySummaryController,
   exportSalaryExcel
} from "./salary.controller.js";


// Import token verification and role middleware
import { verifyToken } from "../../common/middleware/auth.middleware.js";
import { allowRoles } from "../../common/middleware/role.middleware.js"; // Adjust function name to match role.middleware.js export
import { ROLES } from "../../common/constants/roles.js";
const router = express.Router();

// Admin-Only Routes
router.post(
  "/config/:employeeId",
  verifyToken,
 allowRoles(ROLES.ADMIN),
  createSalaryController
);

router.get(
  "/:employeeId",
  verifyToken,
  allowRoles(ROLES.ADMIN),
  getSalaryController
);

router.put(
  "/pay/:employeeId",
  verifyToken,
 allowRoles(ROLES.ADMIN),
  updateSalaryController
);

router.get("/all-summary", verifyToken, allowRoles(ROLES.ADMIN), getAllEmployeesSalaryController)

// Get detailed employee salary summary
router.get(
  "/summary/:employeeId",
  verifyToken,
  allowRoles(ROLES.ADMIN),
  getSalarySummaryController
);
router.get(

    "/export",

    verifyToken,

    allowRoles("ADMIN"),

    exportSalaryExcel

);
export default router;