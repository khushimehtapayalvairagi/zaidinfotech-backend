import express from "express";

import {
  createCategory,
  getCategories,
  getCategory,
  updateCategory,
  deleteCategory
} from "./category.controller.js";

import { verifyToken } from "../../common/middleware/auth.middleware.js";
import { allowRoles } from "../../common/middleware/role.middleware.js";
import { categoryUpload } from "../../common/middleware/upload.middleware.js";

const router = express.Router();

router.post(
  "/",
  verifyToken,
  allowRoles(  "ADMIN",
  "SUPER_ADMIN",
  "SALES",
  "RECEPTIONIST",
  "ACCOUNTANT"),
  categoryUpload.single("image"),
  createCategory
);

router.get(
  "/",
  verifyToken,
  getCategories
);

router.get(
  "/:id",
  verifyToken,
  getCategory
);

router.put(
  "/:id",
  verifyToken,
  allowRoles(  "ADMIN",
  "SUPER_ADMIN",
  "SALES",
  "RECEPTIONIST",
  "ACCOUNTANT"),
  updateCategory
);

router.delete(
  "/:id",
  verifyToken,
  allowRoles(  "ADMIN",
  "SUPER_ADMIN",
  "SALES",
  "RECEPTIONIST",
  "ACCOUNTANT"),
  deleteCategory
);

export default router;