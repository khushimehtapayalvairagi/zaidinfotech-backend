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


// Admin Create Coupon

router.post(
    "/",
    verifyToken,
    allowRoles("SUPER_ADMIN","ADMIN"),
    validate(createCouponValidation),
    createCoupon
);


// Admin All Coupons

router.get(
    "/",
    verifyToken,
    allowRoles("SUPER_ADMIN","ADMIN"),
    getCoupons
);


// Customer: Apply Coupon (checkout ke waqt)

router.post(
    "/apply",
    verifyToken,
    validate(applyCouponValidation),
    applyCoupon
);


// Get Single Coupon (edit form)

router.get(
    "/:id",
    verifyToken,
    allowRoles("SUPER_ADMIN","ADMIN"),
    getCouponById
);


// Update Coupon

router.put(
    "/:id",
    verifyToken,
    allowRoles("SUPER_ADMIN","ADMIN"),
    validate(updateCouponValidation),
    updateCoupon
);


// Delete Coupon

router.delete(
    "/:id",
    verifyToken,
    allowRoles("SUPER_ADMIN","ADMIN"),
    deleteCoupon
);


export default router;