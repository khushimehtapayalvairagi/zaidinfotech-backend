

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
        "SUPER_ADMIN",
        "ADMIN"
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
        "SUPER_ADMIN",
        "ADMIN"
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
        "SUPER_ADMIN",
        "ADMIN"
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
        "SUPER_ADMIN",
        "ADMIN"
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
        "SUPER_ADMIN",
        "ADMIN"
    ),
    deleteCoupon
);


export default router;