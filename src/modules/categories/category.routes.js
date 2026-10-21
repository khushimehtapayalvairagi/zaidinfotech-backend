import express from "express";

import {
  createCategory,
  getCategories,
  getCategory,
  updateCategory,
  deleteCategory,
} from "./category.controller.js";

import { verifyToken } from "../../common/middleware/auth.middleware.js";

import { allowRoles } from "../../common/middleware/role.middleware.js";

import { categoryUpload } from "../../common/middleware/upload.middleware.js";

// ======================================================
// ROUTER
// ======================================================

const router = express.Router();

// ======================================================
// CATEGORY MANAGEMENT ROLES
// Existing permissions preserved
// ======================================================

const CATEGORY_MANAGEMENT_ROLES = [
  "ADMIN",
  "SUPER_ADMIN",
  "SALES",
  "RECEPTIONIST",
  "ACCOUNTANT",
];

// ======================================================
// CREATE CATEGORY / SUBCATEGORY
// POST /api/categories
// Supports image upload
// ======================================================

router.post(
  "/",
  verifyToken,
  allowRoles(...CATEGORY_MANAGEMENT_ROLES),
  categoryUpload.single("image"),
  createCategory
);

// ======================================================
// GET ALL CATEGORIES
// GET /api/categories
// ======================================================

router.get(
  "/",
  verifyToken,
  getCategories
);

// ======================================================
// GET CATEGORY BY ID
// GET /api/categories/:id
// ======================================================

router.get(
  "/:id",
  verifyToken,
  getCategory
);

// ======================================================
// UPDATE CATEGORY / SUBCATEGORY
// PUT /api/categories/:id
//
// Supports:
// - Category name
// - Description
// - New category image
// - Parent category
// - Status
// - Sort order
// ======================================================

router.put(
  "/:id",
  verifyToken,
  allowRoles(...CATEGORY_MANAGEMENT_ROLES),

  // Required for editing uploaded images
  categoryUpload.single("image"),

  updateCategory
);

// ======================================================
// DELETE CATEGORY / SUBCATEGORY
// DELETE /api/categories/:id
// ======================================================

router.delete(
  "/:id",
  verifyToken,
  allowRoles(...CATEGORY_MANAGEMENT_ROLES),
  deleteCategory
);

// ======================================================
// EXPORT
// ======================================================

export default router;