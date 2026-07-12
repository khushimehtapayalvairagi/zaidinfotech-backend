import express from "express";

import {
  createBrand,
  getBrands,
  getBrand,
  updateBrand,
  deleteBrand,
} from "./brand.controller.js";

import { verifyToken } from "../../common/middleware/auth.middleware.js";
import { allowRoles } from "../../common/middleware/role.middleware.js";

const router = express.Router();

router.post(
  "/",
  verifyToken,
  allowRoles("ADMIN"),
  createBrand
);

router.get(
  "/",
  verifyToken,
  getBrands
);

router.get(
  "/:id",
  verifyToken,
  getBrand
);

router.put(
  "/:id",
  verifyToken,
  allowRoles("ADMIN"),
  updateBrand
);

router.delete(
  "/:id",
  verifyToken,
  allowRoles("ADMIN"),
  deleteBrand
);

export default router;