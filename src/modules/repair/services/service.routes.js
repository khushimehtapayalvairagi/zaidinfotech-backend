

import express from "express";
import * as serviceCatlog from "./service.contoller.js";
import { verifyToken } from "../../../common/middleware/auth.middleware.js";
import { allowRoles } from "../../../common/middleware/role.middleware.js";

const router = express.Router();

// View service rates: Admin, Technician, Receptionist
router.get(
  "/get-services",
  verifyToken,
  allowRoles("ADMIN", "TECHNICIAN", "RECEPTIONIST"),
  serviceCatlog.getAllServices
);

// Create service rates
router.post(
  "/create-service",
  verifyToken,
  allowRoles("ADMIN", "TECHNICIAN"),
  serviceCatlog.createService
);

// Update service rates
router.put(
  "/update-service/:id",
  verifyToken,
  allowRoles("ADMIN", "TECHNICIAN"),
  serviceCatlog.updateService
);

// Delete service rates
router.delete(
  "/delete-service/:id",
  verifyToken,
  allowRoles("ADMIN", "TECHNICIAN"),
  serviceCatlog.deleteService
);

export default router;