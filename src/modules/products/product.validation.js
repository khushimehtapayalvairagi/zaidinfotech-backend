import Joi from "joi";

export const createProductValidation = Joi.object({

    // Basic Information
    name: Joi.string()
        .trim()
        .min(2)
        .max(150)
        .required(),

    barcode: Joi.string()
        .allow("")
        .optional(),

    category: Joi.string()
        .required(),

    brand: Joi.string()
        .required(),

    description: Joi.string()
        .allow("")
        .optional(),

    shortDescription: Joi.string()
        .allow("")
        .optional(),

    // Pricing
    pricing: Joi.object({

        purchasePrice: Joi.number()
            .min(0)
            .required(),

        sellingPrice: Joi.number()
            .min(0)
            .required(),

        mrp: Joi.number()
            .min(0)
            .required(),

        discount: Joi.number()
            .min(0)
            .default(0),

        gst: Joi.number()
            .min(0)
            .default(0)

    }).required(),

    // SEO
    metaTitle: Joi.string()
        .allow("")
        .optional(),

    metaDescription: Joi.string()
        .allow("")
        .optional(),

    // Specifications
    specifications: Joi.object()
        .default({})

});



export const updateProductValidation = Joi.object({

    name: Joi.string().trim(),

    barcode: Joi.string().allow(""),

    category: Joi.string(),

    brand: Joi.string(),

    description: Joi.string().allow(""),

    shortDescription: Joi.string().allow(""),

    pricing: Joi.object({

        purchasePrice: Joi.number(),

        sellingPrice: Joi.number(),

        mrp: Joi.number(),

        discount: Joi.number(),

        gst: Joi.number()

    }),

    metaTitle: Joi.string().allow(""),

    metaDescription: Joi.string().allow(""),

    specifications: Joi.object()

});