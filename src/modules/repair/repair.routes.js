import express from "express";

import {
  validate,
} from "../../common/middleware/validate.middleware.js";

import {
  verifyToken,
} from "../../common/middleware/auth.middleware.js";

import {
  createRepairValidation,
  updateRepairStatusValidation,
  updateRepairValidation,
  transferRepairValidation,
} from "./repair.validation.js";

import {
  allowRoles,
} from "../../common/middleware/role.middleware.js";

import * as repairController from "./repair.controller.js";

const router = express.Router();

// ======================================================
// PROFILE ROUTES
// ======================================================

// GET TECHNICIAN PROFILE
router.get(
  "/profile",
  verifyToken,
  repairController.getTechnicianProfile
);

// UPDATE TECHNICIAN PROFILE
router.put(
  "/profile",
  verifyToken,
  repairController.updateTechnicianProfile
);

// CHANGE PASSWORD
router.put(
  "/change-password",
  verifyToken,
  repairController.changePassword
);

// ======================================================
// TECHNICIAN ROUTES
// ======================================================

// GET ALL TECHNICIANS
router.get(
  "/technicians",
  verifyToken,
  repairController.getTechniciansList
);

// ======================================================
// ASSIGNED REPAIRS
// ======================================================

// GET LOGGED-IN TECHNICIAN ASSIGNED REPAIRS
router.get(
  "/my-assigned-repairs",
  verifyToken,
  repairController.getMyAssignedRepairs
);

// ======================================================
// CREATE NEW JOB CARD / REPAIR REQUEST
// ======================================================

// Branch ID is mandatory.
// Only active branches are accepted by repair.service.js.

router.post(
  "/request",
  verifyToken,
  validate(createRepairValidation),
  repairController.createRepair
);

// ======================================================
// GET REPAIRS BY USER
// ======================================================

router.get(
  "/user/:userId",
  verifyToken,
  repairController.getRepairsByUser
);

// ======================================================
// GET REPAIRS BY PRODUCT
// ======================================================

router.get(
  "/product/:productId",
  verifyToken,
  repairController.getRepairsByProduct
);

// ======================================================
// GET ALL REPAIRS / JOB CARDS
// ======================================================

router.get(
  "/",
  verifyToken,
  repairController.getAllRepairs
);

// ======================================================
// GET REPAIR BY ID
// ======================================================

router.get(
  "/:id",
  verifyToken,
  repairController.getRepairById
);

// ======================================================
// CHANGE: NEW
// GET PAYMENT RECORDS OF A JOB CARD
// (reads from the central Payment collection)
// ======================================================

router.get(
  "/:id/payments",
  verifyToken,
  repairController.getRepairPayments
);

// ======================================================
// UPDATE JOB CARD
// ======================================================

// Branch ID is optional during update.
// If supplied, repair.service.js validates that
// the selected branch is ACTIVE and not deleted.

router.put(
  "/:id",
  verifyToken,
  validate(updateRepairValidation),
  repairController.updateRepair
);

// ======================================================
// UPDATE REPAIR STATUS
// ======================================================

router.patch(
  "/:id/status",
  verifyToken,
  validate(updateRepairStatusValidation),
  repairController.updateRepairStatus
);

// ======================================================
// UPDATE REPAIR PAYMENT
// ======================================================

router.patch(
  "/:id/payment",
  verifyToken,
  repairController.updateRepairPayment
);

// ======================================================
// TRANSFER / REASSIGN JOB TO ANOTHER TECHNICIAN
// Admin, IT Support aur Technician kar sakte hain.
// Technician sirf apne jobs transfer kar sakta hai
// (service me check hota hai).
// ======================================================

router.patch(
  "/:id/transfer",
  verifyToken,
  allowRoles(
    "SUPER_ADMIN",
    "ADMIN",
    "IT_SUPPORT",
    "TECHNICIAN"
  ),
  validate(transferRepairValidation),
  repairController.transferRepair
);

// ======================================================
// MARK REPAIR AS DELIVERED
// ======================================================

router.patch(
  "/:id/delivered",
  verifyToken,
  repairController.markDelivered
);

// ======================================================
// SOFT DELETE JOB CARD
// ======================================================

// This should call repair.service.js deleteRepair()
// which sets isDeleted = true and deletedAt = current date.

router.delete(
  "/:id",
  verifyToken,
  repairController.deleteRepair
);

// ======================================================
// LEGACY PRODUCT-BASED REPAIR PART ROUTE
// ======================================================

// Kept for backward compatibility.
// Actual RepairPart attachment is not implemented
// in the current repair controller.

router.post(
  "/:id/parts",
  verifyToken,
  (req, res) => {
    return res.status(501).json({
      success: false,
      message:
        "Repair Part API is not implemented in the repair controller yet. Please use the dedicated RepairPart attachment API.",
    });
  }
);

// ======================================================
// EXPORT ROUTER
// ======================================================

export default router;