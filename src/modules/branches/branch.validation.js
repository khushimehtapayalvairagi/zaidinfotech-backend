import Joi from "joi";

export const createBranchValidation = Joi.object({
    name: Joi.string().trim().min(2).max(100).required(),

    code: Joi.string()
        .trim()
        .uppercase()
        .pattern(/^[A-Z0-9_-]+$/)
        .max(20)
        .required(),

    phone: Joi.string().allow("").max(20).optional(),

    email: Joi.string().email().allow("").optional(),

    address: Joi.string().allow("").max(500).optional(),

    city: Joi.string().allow("").max(100).optional(),

    state: Joi.string().allow("").max(100).optional(),

    pincode: Joi.string().allow("").max(12).optional(),

    gstin: Joi.string().allow("").max(20).optional(),

    status: Joi.string()
        .valid("ACTIVE", "INACTIVE")
        .optional()
});

export const updateBranchValidation = Joi.object({
    name: Joi.string().trim().min(2).max(100),

    code: Joi.string()
        .trim()
        .uppercase()
        .pattern(/^[A-Z0-9_-]+$/)
        .max(20),

    phone: Joi.string().allow("").max(20),

    email: Joi.string().email().allow(""),

    address: Joi.string().allow("").max(500),

    city: Joi.string().allow("").max(100),

    state: Joi.string().allow("").max(100),

    pincode: Joi.string().allow("").max(12),

    gstin: Joi.string().allow("").max(20),

    status: Joi.string().valid("ACTIVE", "INACTIVE")
}).min(1);