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
import { brandUpload } from "../../common/middleware/upload.middleware.js";
const router = express.Router();

// router.post(
//   "/",
//   verifyToken,
//   allowRoles("ADMIN"),
//   createBrand
// );



router.post(
    "/",
    verifyToken,
    allowRoles(  "ADMIN",
  "SUPER_ADMIN",
  "SALES",
  "RECEPTIONIST",
  "ACCOUNTANT"),
    brandUpload.single("logo"),
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
  allowRoles(  "ADMIN",
  "SUPER_ADMIN",
  "SALES",
  "RECEPTIONIST",
  "ACCOUNTANT"),
  updateBrand
);

router.delete(
  "/:id",
  verifyToken,
  allowRoles(  "ADMIN",
  "SUPER_ADMIN",
  "SALES",
  "RECEPTIONIST",
  "ACCOUNTANT"),
  deleteBrand
);

export default router;