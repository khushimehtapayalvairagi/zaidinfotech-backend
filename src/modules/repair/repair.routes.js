


import express from "express";

import { validate } from "../../common/middleware/validate.middleware.js";
import { verifyToken } from "../../common/middleware/auth.middleware.js";

import {
  createRepairValidation,
  updateRepairStatusValidation,
  updateRepairValidation,
} from "./repair.validation.js";

import * as repairController from "./repair.controller.js";

const router = express.Router();

// ======================================================
// PROFILE
// ======================================================

router.get(
  "/profile",
  verifyToken,
  repairController.getTechnicianProfile
);

router.put(
  "/profile",
  verifyToken,
  repairController.updateTechnicianProfile
);

router.put(
  "/change-password",
  verifyToken,
  repairController.changePassword
);

// ======================================================
// CREATE REPAIR
// ======================================================

router.post(
  "/request",
  verifyToken,
  validate(createRepairValidation),
  repairController.createRepair
);

// ======================================================
// ASSIGNED REPAIRS
// ======================================================

router.get(
  "/my-assigned-repairs",
  verifyToken,
  repairController.getMyAssignedRepairs
);

// ======================================================
// TECHNICIANS
// ======================================================

router.get(
  "/technicians",
  verifyToken,
  repairController.getTechniciansList
);

// ======================================================
// ALL REPAIRS
// ======================================================

router.get(
  "/",
  verifyToken,
  repairController.getAllRepairs
);

// ======================================================
// REPAIR BY ID
// ======================================================

router.get(
  "/:id",
  verifyToken,
  repairController.getRepairById
);

// ======================================================
// REPAIRS BY USER
// ======================================================

router.get(
  "/user/:userId",
  verifyToken,
  repairController.getRepairsByUser
);

// ======================================================
// REPAIRS BY PRODUCT
// ======================================================

router.get(
  "/product/:productId",
  verifyToken,
  repairController.getRepairsByProduct
);

// ======================================================
// UPDATE REPAIR
// ======================================================

router.put(
  "/:id",
  verifyToken,
  validate(updateRepairValidation),
  repairController.updateRepair
);

// ======================================================
// UPDATE STATUS
// ======================================================

router.patch(
  "/:id/status",
  verifyToken,
  validate(updateRepairStatusValidation),
  repairController.updateRepairStatus
);

// ======================================================
// PAYMENT
// ======================================================

router.patch(
  "/:id/payment",
  verifyToken,
  repairController.updateRepairPayment
);

// ======================================================
// DELIVERED
// ======================================================

router.patch(
  "/:id/delivered",
  verifyToken,
  repairController.markDelivered
);

// ======================================================
// DELETE
// ======================================================

router.delete(
  "/:id",
  verifyToken,
  repairController.deleteRepair
);

// ======================================================
// LEGACY PRODUCT PART ROUTE
// Existing behavior preserved
// ======================================================

router.post(
  "/:id/parts",
  verifyToken,
  (req, res) => {
    return res.status(501).json({
      success: false,
      message:
        "Repair part API is not implemented in the repair controller yet.",
    });
  }
);

// ======================================================
// EXPORT
// ======================================================

export default router;