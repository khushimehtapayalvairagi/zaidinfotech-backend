import express from "express";


import {
    createCoupon,
    getCoupons,
    getCouponById,
    updateCoupon,
    deleteCoupon,
    applyCoupon
} from "./coupon.controller.js";


import {
    verifyToken
} from "../../common/middleware/auth.middleware.js";


import {
    allowRoles
} from "../../common/middleware/role.middleware.js";


import {
    validate
} from "../../common/middleware/validate.middleware.js";


import {
    createCouponValidation,
    updateCouponValidation,
    applyCouponValidation
} from "./coupon.validation.js";


const router = express.Router();


// ======================================================
// ADMIN - CREATE
// ======================================================

router.post(
    "/",
    verifyToken,
    allowRoles(
    "ADMIN",
  "SUPER_ADMIN",
  "SALES",
  "RECEPTIONIST",
  "ACCOUNTANT"
    ),
    validate(createCouponValidation),
    createCoupon
);


// ======================================================
// ADMIN - GET ALL
// ======================================================

router.get(
    "/",
    verifyToken,
    allowRoles(
         "ADMIN",
  "SUPER_ADMIN",
  "SALES",
  "RECEPTIONIST",
  "ACCOUNTANT"
    ),
    getCoupons
);


// ======================================================
// CUSTOMER - APPLY
// ======================================================

router.post(
    "/apply",
    verifyToken,
    validate(applyCouponValidation),
    applyCoupon
);


// ======================================================
// ADMIN - GET SINGLE
// ======================================================

router.get(
    "/:id",
    verifyToken,
    allowRoles(
        "ADMIN",
  "SUPER_ADMIN",
  "SALES",
  "RECEPTIONIST",
  "ACCOUNTANT"
    ),
    getCouponById
);


// ======================================================
// ADMIN - UPDATE
// ======================================================

router.put(
    "/:id",
    verifyToken,
    allowRoles(
          "ADMIN",
  "SUPER_ADMIN",
  "SALES",
  "RECEPTIONIST",
  "ACCOUNTANT"
    ),
    validate(updateCouponValidation),
    updateCoupon
);


// ======================================================
// ADMIN - DELETE
// ======================================================

router.delete(
    "/:id",
    verifyToken,
    allowRoles(
         "ADMIN",
  "SUPER_ADMIN",
  "SALES",
  "RECEPTIONIST",
  "ACCOUNTANT"
    ),
    deleteCoupon
);


export default router;