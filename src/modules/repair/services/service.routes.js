import express from "express";
import * as serviceCatlog from "./service.contoller.js";

import { verifyToken } from "../../../common/middleware/auth.middleware.js";
import { allowRoles } from "../../../common/middleware/role.middleware.js";

const router = express.Router();

// ======================================================
// ALL ROLES - VIEW SERVICE RATES
// ======================================================

const VIEW_SERVICE_ROLES = [
  "SUPER_ADMIN",
  "ADMIN",
  "SALES",
  "TECHNICIAN",
  "RECEPTIONIST",
  "INVENTORY",
  "IT_SUPPORT",
  "HR_EXECUTIVE",
  "CUSTOMER",
];

// ======================================================
// MANAGE SERVICE RATES
// Existing Admin and Technician permissions preserved
// IT Support and Super Admin also allowed
// ======================================================

const MANAGE_SERVICE_ROLES = [
  "SUPER_ADMIN",
  "ADMIN",
  "TECHNICIAN",
  "IT_SUPPORT",
];

// ======================================================
// GET ALL SERVICES
// GET /api/repair-service/get-services
// ======================================================

router.get(
  "/get-services",
  verifyToken,
  allowRoles(...VIEW_SERVICE_ROLES),
  serviceCatlog.getAllServices
);

// ======================================================
// CREATE SERVICE
// POST /api/repair-service/create-service
// ======================================================

router.post(
  "/create-service",
  verifyToken,
  allowRoles(...MANAGE_SERVICE_ROLES),
  serviceCatlog.createService
);

// ======================================================
// UPDATE SERVICE
// PUT /api/repair-service/update-service/:id
// ======================================================

router.put(
  "/update-service/:id",
  verifyToken,
  allowRoles(...MANAGE_SERVICE_ROLES),
  serviceCatlog.updateService
);

// ======================================================
// DELETE SERVICE
// DELETE /api/repair-service/delete-service/:id
// ======================================================

router.delete(
  "/delete-service/:id",
  verifyToken,
  allowRoles(...MANAGE_SERVICE_ROLES),
  serviceCatlog.deleteService
);

// ======================================================
// EXPORT ROUTER
// ======================================================

export default router;