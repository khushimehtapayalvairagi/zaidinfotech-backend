import Joi from "joi";

// ==========================================
// Create Availability Request
// ==========================================

export const createAvailabilityRequestValidation =
    Joi.object({

        product: Joi.string()
            .required()
            .messages({
                "string.empty":
                    "Product is required",

                "any.required":
                    "Product is required"
            }),

        name: Joi.string()
            .trim()
            .min(2)
            .max(100)
            .required()
            .messages({
                "string.empty":
                    "Name is required",

                "string.min":
                    "Name must be at least 2 characters",

                "any.required":
                    "Name is required"
            }),

        mobile: Joi.string()
            .trim()
            .pattern(/^[0-9]{10}$/)
            .required()
            .messages({
                "string.empty":
                    "Mobile number is required",

                "string.pattern.base":
                    "Mobile number must be 10 digits",

                "any.required":
                    "Mobile number is required"
            }),

        email: Joi.string()
            .trim()
            .email()
            .allow("")
            .optional()
            .messages({
                "string.email":
                    "Please provide a valid email"
            }),

        message: Joi.string()
            .trim()
            .max(500)
            .allow("")
            .optional()
    });


// ==========================================
// Update Status
// ==========================================

export const updateAvailabilityRequestStatusValidation =
    Joi.object({

        status: Joi.string()
            .valid(
                "PENDING",
                "CONTACTED",
                "RESOLVED"
            )
            .required()
            .messages({
                "any.only":
                    "Invalid request status",

                "any.required":
                    "Status is required"
            })
    });