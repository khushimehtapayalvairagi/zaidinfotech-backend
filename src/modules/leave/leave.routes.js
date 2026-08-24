// import express from "express";

// import * as leaveController
//   from "./leave.controller.js";

// import { verifyToken } from "../../common/middleware/auth.middleware.js";
// const router = express.Router();

// // ======================================================
// // LEAVE REQUESTS
// // ======================================================

// // Employee
// router.post(
//   "/",
//  verifyToken,
//   leaveController.applyLeave
// );

// // Employee
// router.get(
//   "/my",
//  verifyToken,
//   leaveController.getMyLeaves
// );

// // Admin
// router.get(
//   "/",
//  verifyToken,
//   leaveController.getAllLeaves
// );

// // Single
// router.get(
//   "/:id",
//  verifyToken,
//   leaveController.getLeaveById
// );

// // Admin
// router.patch(
//   "/:id/approve",
// verifyToken,
//   leaveController.approveLeave
// );

// // Admin
// router.patch(
//   "/:id/reject",
//  verifyToken,
//   leaveController.rejectLeave
// );

// // Employee
// router.patch(
//   "/:id/cancel",
//  verifyToken,
//   leaveController.cancelLeave
// );

// // ======================================================
// // LEAVE POLICY
// // ======================================================

// // Admin
// router.post(
//   "/policies",
//  verifyToken,
//   leaveController.createLeavePolicy
// );

// // All authenticated users
// router.get(
//   "/policies/all",
//  verifyToken,
//   leaveController.getLeavePolicies
// );

// // Admin
// router.patch(
//   "/policies/:id",
//  verifyToken,
//   leaveController.updateLeavePolicy
// );

// // ======================================================
// // HOLIDAYS
// // ======================================================

// // Admin
// router.post(
//   "/holidays",
//  verifyToken,
//   leaveController.createHoliday
// );

// // All authenticated users
// router.get(
//   "/holidays",
//  verifyToken,
//   leaveController.getHolidays
// );

// // Single
// router.get(
//   "/holidays/:id",
//  verifyToken,
//   leaveController.getHolidayById
// );

// // Admin
// router.put(
//   "/holidays/:id",
// verifyToken,
//   leaveController.updateHoliday
// );

// // Admin
// router.delete(
//   "/holidays/:id",
//   verifyToken,
//   leaveController.deleteHoliday
// );

// export default router;
import express from "express";

import * as leaveController from "./leave.controller.js";

import {
  verifyToken,
} from "../../common/middleware/auth.middleware.js";

const router = express.Router();

// ======================================================
// LEAVE REQUESTS
// ======================================================


// ======================================================
// EMPLOYEE - APPLY LEAVE
// POST /api/leaves
// ======================================================

router.post(
  "/",
  verifyToken,
  leaveController.applyLeave
);


// ======================================================
// EMPLOYEE - MY LEAVES
// GET /api/leaves/my
// ======================================================

router.get(
  "/my",
  verifyToken,
  leaveController.getMyLeaves
);


// ======================================================
// LEAVE POLICY
// ======================================================


// ======================================================
// CREATE POLICY
// POST /api/leaves/policies
// ======================================================

router.post(
  "/policies",
  verifyToken,
  leaveController.createLeavePolicy
);


// ======================================================
// GET POLICIES
// GET /api/leaves/policies/all
// ======================================================

router.get(
  "/policies/all",
  verifyToken,
  leaveController.getLeavePolicies
);


// ======================================================
// UPDATE POLICY
// PATCH /api/leaves/policies/:id
// ======================================================

router.patch(
  "/policies/:id",
  verifyToken,
  leaveController.updateLeavePolicy
);


// ======================================================
// HOLIDAYS
// ======================================================


// ======================================================
// CREATE HOLIDAY
// POST /api/leaves/holidays
// ======================================================

router.post(
  "/holidays",
  verifyToken,
  leaveController.createHoliday
);


// ======================================================
// GET HOLIDAYS
// GET /api/leaves/holidays
// ======================================================

router.get(
  "/holidays",
  verifyToken,
  leaveController.getHolidays
);


// ======================================================
// GET SINGLE HOLIDAY
// GET /api/leaves/holidays/:id
// ======================================================

router.get(
  "/holidays/:id",
  verifyToken,
  leaveController.getHolidayById
);


// ======================================================
// UPDATE HOLIDAY
// PUT /api/leaves/holidays/:id
// ======================================================

router.put(
  "/holidays/:id",
  verifyToken,
  leaveController.updateHoliday
);


// ======================================================
// DELETE HOLIDAY
// DELETE /api/leaves/holidays/:id
// ======================================================

router.delete(
  "/holidays/:id",
  verifyToken,
  leaveController.deleteHoliday
);


// ======================================================
// ADMIN - ALL LEAVES
// GET /api/leaves
// ======================================================

router.get(
  "/",
  verifyToken,
  leaveController.getAllLeaves
);


// ======================================================
// APPROVE LEAVE
// PATCH /api/leaves/:id/approve
// ======================================================

router.patch(
  "/:id/approve",
  verifyToken,
  leaveController.approveLeave
);


// ======================================================
// REJECT LEAVE
// PATCH /api/leaves/:id/reject
// ======================================================

router.patch(
  "/:id/reject",
  verifyToken,
  leaveController.rejectLeave
);


// ======================================================
// CANCEL LEAVE
// PATCH /api/leaves/:id/cancel
// ======================================================

router.patch(
  "/:id/cancel",
  verifyToken,
  leaveController.cancelLeave
);


// ======================================================
// SINGLE LEAVE
// IMPORTANT:
// KEEP THIS LAST
// ======================================================

// GET /api/leaves/:id

router.get(
  "/:id",
  verifyToken,
  leaveController.getLeaveById
);


// ======================================================
// EXPORT
// ======================================================

export default router;