import Joi from "joi";


// ================================
// CREATE COUPON VALIDATION
// ================================

export const createCouponValidation = Joi.object({

    code: Joi.string()
    .required()
    .trim()
    .uppercase(),


    description: Joi.string()
    .allow("")
    .optional(),


    discountType: Joi.string()
    .valid(
        "PERCENTAGE",
        "FIXED"
    )
    .required(),


    discountValue: Joi.number()
    .required()
    .min(0),


    maxDiscountAmount: Joi.number()
    .min(0)
    .allow(null)
    .optional(),


    minCartValue: Joi.number()
    .min(0)
    .default(0),


    usageLimit: Joi.number()
    .min(1)
    .allow(null)
    .optional(),


    usageLimitPerUser: Joi.number()
    .min(1)
    .default(1),


    startDate: Joi.date()
    .required(),


    endDate: Joi.date()
    .required(),


    status: Joi.string()
    .valid(
        "ACTIVE",
        "INACTIVE",
        "EXPIRED"
    )
    .default("ACTIVE")

});


// ================================
// UPDATE COUPON VALIDATION
// ================================

export const updateCouponValidation = Joi.object({

    code: Joi.string()
    .trim()
    .uppercase(),

    description: Joi.string()
    .allow(""),

    discountType: Joi.string()
    .valid(
        "PERCENTAGE",
        "FIXED"
    ),

    discountValue: Joi.number()
    .min(0),

    maxDiscountAmount: Joi.number()
    .min(0)
    .allow(null),

    minCartValue: Joi.number()
    .min(0),

    usageLimit: Joi.number()
    .min(1)
    .allow(null),

    usageLimitPerUser: Joi.number()
    .min(1),

    startDate: Joi.date(),

    endDate: Joi.date(),

    status: Joi.string()
    .valid(
        "ACTIVE",
        "INACTIVE",
        "EXPIRED"
    )

});


// ================================
// APPLY COUPON VALIDATION (checkout time)
// ================================

export const applyCouponValidation = Joi.object({

    code: Joi.string()
    .required()
    .trim(),


    cartTotal: Joi.number()
    .required()
    .min(0)

});