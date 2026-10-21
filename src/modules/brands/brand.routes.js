import express from "express";

import {
  createBrand,
  getBrands,
  getBrand,
  updateBrand,
  deleteBrand,
} from "./brand.controller.js";

import {
  verifyToken,
} from "../../common/middleware/auth.middleware.js";

import {
  allowRoles,
} from "../../common/middleware/role.middleware.js";

import {
  brandUpload,
} from "../../common/middleware/upload.middleware.js";

const router = express.Router();

// ======================================================
// BRAND MANAGEMENT ROLES
// ======================================================

const BRAND_MANAGEMENT_ROLES = [
  "ADMIN",
  "SUPER_ADMIN",
  "SALES",
  "RECEPTIONIST",
  "ACCOUNTANT",
];

// ======================================================
// SAFE LOGO UPLOAD (multer errors ko JSON me return karta hai)
// ======================================================

const uploadLogo = (req, res, next) => {
  brandUpload.single("logo")(req, res, (err) => {
    if (!err) return next();

    console.error("BRAND UPLOAD ERROR:", err);

    let message = err.message || "Logo upload failed.";

    if (err.code === "LIMIT_FILE_SIZE") {
      message = "Logo size must be 10 MB or less.";
    }

    if (err.code === "LIMIT_UNEXPECTED_FILE") {
      message = "Unexpected file field. Use field name: logo";
    }

    return res.status(400).json({
      success: false,
      message,
    });
  });
};

// ======================================================
// CREATE BRAND
// POST /api/brands
// ======================================================

router.post(
  "/",
  verifyToken,
  allowRoles(...BRAND_MANAGEMENT_ROLES),
  uploadLogo,
  createBrand
);

// ======================================================
// GET ALL BRANDS
// GET /api/brands
// ======================================================

router.get(
  "/",
  verifyToken,
  getBrands
);

// ======================================================
// GET SINGLE BRAND
// GET /api/brands/:id
// ======================================================

router.get(
  "/:id",
  verifyToken,
  getBrand
);

// ======================================================
// UPDATE BRAND
// PUT /api/brands/:id
// ======================================================

router.put(
  "/:id",
  verifyToken,
  allowRoles(...BRAND_MANAGEMENT_ROLES),
  uploadLogo,
  updateBrand
);

// ======================================================
// DELETE BRAND
// DELETE /api/brands/:id
// ======================================================

router.delete(
  "/:id",
  verifyToken,
  allowRoles(...BRAND_MANAGEMENT_ROLES),
  deleteBrand
);

export default router;