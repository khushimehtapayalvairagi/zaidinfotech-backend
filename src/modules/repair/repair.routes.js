import express from "express";

const router = express.Router();

import { validate } from "../../common/middleware/validate.middleware.js";

// Auth middleware
import { verifyToken } from "../../common/middleware/auth.middleware.js";

// Validation
import {
  createRepairValidation,
  updateRepairStatusValidation,
  updateRepairValidation,
} from "./repair.validation.js";

// Controller
import * as repairController from "./repair.controller.js";

// ==========================================
// Create Repair Request
// ==========================================
router.post(
  "/request",
  verifyToken,
  validate(createRepairValidation),
  repairController.createRepair
);

router.get(
  "/my-assigned-repairs",
  verifyToken,
  repairController.getMyAssignedRepairs
);


router.get("/technicians", repairController.getTechniciansList)

// ==========================================
// Get All Repair Requests
// ==========================================
router.get(
  "/",
  verifyToken,
  repairController.getAllRepairs
);

// ==========================================
// Get Repair By Id
// ==========================================
router.get(
  "/:id",
  verifyToken,
  repairController.getRepairById
);

// ==========================================
// Get Repairs By User
// ==========================================
router.get(
  "/user/:userId",
  verifyToken,
  repairController.getRepairsByUser
);

// ==========================================
// Get Repairs By Product
// ==========================================
router.get(
  "/product/:productId",
  verifyToken,
  repairController.getRepairsByProduct
);

// ==========================================
// Update Repair
// ==========================================
router.put(
  "/:id",
  verifyToken,
  validate(updateRepairValidation),
  repairController.updateRepair
);

// ==========================================
// Update Repair Status
// ==========================================
router.patch(
  "/:id/status",
  verifyToken,
  validate(updateRepairStatusValidation),
  repairController.updateRepairStatus
);

// ==========================================
// Mark Repair Delivered
// ==========================================
router.patch(
  "/:id/delivered",
  verifyToken,
  repairController.markDelivered
);

// ==========================================
// Delete Repair
// ==========================================
router.delete(
  "/:id",
  verifyToken,
  repairController.deleteRepair
);

// ==========================================
// Add Repair Part
// ==========================================
router.post(
  "/:id/parts",
  verifyToken,
  repairController.addRepairPart
);


// router.get(
//   "/technician/:technicianId",
//   verifyToken,
//   repairController.getRepairsByTechnician
// );

// router.get(
//   "/my-assigned-repairs",
//   verifyToken,
//   repairController.getMyAssignedRepairs
// );

//get all techinicinas

export default router;