import express from "express";

import * as leaveController
  from "./leave.controller.js";

import { verifyToken, } from "../../middlewares/auth.middleware.js";

const router = express.Router();

// ======================================================
// LEAVE REQUESTS
// ======================================================

// Employee
router.post(
  "/",
 verifyToken,
  leaveController.applyLeave
);

// Employee
router.get(
  "/my",
 verifyToken,
  leaveController.getMyLeaves
);

// Admin
router.get(
  "/",
 verifyToken,
  leaveController.getAllLeaves
);

// Single
router.get(
  "/:id",
 verifyToken,
  leaveController.getLeaveById
);

// Admin
router.patch(
  "/:id/approve",
verifyToken,
  leaveController.approveLeave
);

// Admin
router.patch(
  "/:id/reject",
 verifyToken,
  leaveController.rejectLeave
);

// Employee
router.patch(
  "/:id/cancel",
 verifyToken,
  leaveController.cancelLeave
);

// ======================================================
// LEAVE POLICY
// ======================================================

// Admin
router.post(
  "/policies",
 verifyToken,
  leaveController.createLeavePolicy
);

// All authenticated users
router.get(
  "/policies/all",
 verifyToken,
  leaveController.getLeavePolicies
);

// Admin
router.patch(
  "/policies/:id",
 verifyToken,
  leaveController.updateLeavePolicy
);

// ======================================================
// HOLIDAYS
// ======================================================

// Admin
router.post(
  "/holidays",
 verifyToken,
  leaveController.createHoliday
);

// All authenticated users
router.get(
  "/holidays",
 verifyToken,
  leaveController.getHolidays
);

// Single
router.get(
  "/holidays/:id",
 verifyToken,
  leaveController.getHolidayById
);

// Admin
router.put(
  "/holidays/:id",
verifyToken,
  leaveController.updateHoliday
);

// Admin
router.delete(
  "/holidays/:id",
  verifyToken,
  leaveController.deleteHoliday
);

export default router;