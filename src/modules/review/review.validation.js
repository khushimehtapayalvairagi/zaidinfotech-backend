import Joi from "joi";


// =======================================
// CREATE REVIEW
// =======================================

export const createReviewSchema = Joi.object({

    product: Joi.string()
        .required(),

    order: Joi.string()
        .required(),

    rating: Joi.number()
        .integer()
        .min(1)
        .max(5)
        .required(),

    comment: Joi.string()
        .trim()
        .min(3)
        .max(1000)
        .required(),

    images: Joi.array()
        .items(
            Joi.string().uri()
        )
        .optional()

});


// =======================================
// UPDATE REVIEW
// =======================================

export const updateReviewSchema = Joi.object({

    rating: Joi.number()
        .integer()
        .min(1)
        .max(5)
        .optional(),

    comment: Joi.string()
        .trim()
        .min(3)
        .max(1000)
        .optional(),

    images: Joi.array()
        .items(
            Joi.string().uri()
        )
        .optional()

});


// =======================================
// REJECT REVIEW
// =======================================

export const rejectReviewSchema = Joi.object({

    rejectionReason: Joi.string()
        .trim()
        .max(500)
        .optional()

});