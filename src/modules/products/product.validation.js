// import Joi from "joi";

// export const createProductValidation = Joi.object({

//     // Basic Information
//     name: Joi.string()
//         .trim()
//         .min(2)
//         .max(150)
//         .required(),

//     barcode: Joi.string()
//         .allow("")
//         .optional(),

//     category: Joi.string()
//         .required(),

//     brand: Joi.string()
//         .required(),

//     description: Joi.string()
//         .allow("")
//         .optional(),

//     shortDescription: Joi.string()
//         .allow("")
//         .optional(),

//     // Pricing
//     pricing: Joi.object({

//         purchasePrice: Joi.number()
//             .min(0)
//             .required(),

//         sellingPrice: Joi.number()
//             .min(0)
//             .required(),

//         mrp: Joi.number()
//             .min(0)
//             .required(),

//         discount: Joi.number()
//             .min(0)
//             .default(0),

//         gst: Joi.number()
//             .min(0)
//             .default(0)

//     }).required(),

//     // SEO
//     metaTitle: Joi.string()
//         .allow("")
//         .optional(),

//     metaDescription: Joi.string()
//         .allow("")
//         .optional(),

//     // Specifications
//     specifications: Joi.object()
//         .default({})

// });



// export const updateProductValidation = Joi.object({

//     name: Joi.string().trim(),

//     barcode: Joi.string().allow(""),

//     category: Joi.string(),

//     brand: Joi.string(),

//     description: Joi.string().allow(""),

//     shortDescription: Joi.string().allow(""),

//     pricing: Joi.object({

//         purchasePrice: Joi.number(),

//         sellingPrice: Joi.number(),

//         mrp: Joi.number(),

//         discount: Joi.number(),

//         gst: Joi.number()

//     }),

//     metaTitle: Joi.string().allow(""),

//     metaDescription: Joi.string().allow(""),

//     specifications: Joi.object()

// });


import Joi from "joi";


// =====================================================
// CREATE PRODUCT VALIDATION
// =====================================================

export const createProductValidation = Joi.object({

    // =================================================
    // BASIC INFORMATION
    // =================================================

    name: Joi.string()
        .trim()
        .min(2)
        .max(150)
        .required(),

    barcode: Joi.string()
        .trim()
        .allow("")
        .optional(),

    category: Joi.string()
        .trim()
        .required(),

    brand: Joi.string()
        .trim()
        .required(),

    description: Joi.string()
        .allow("")
        .optional(),

    shortDescription: Joi.string()
        .allow("")
        .optional(),


    // =================================================
    // PRICING
    // =================================================

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
            .max(100)
            .default(0),

        gst: Joi.number()
            .min(0)
            .max(100)
            .default(0)

    }).required(),


    // =================================================
    // SEO
    // =================================================

    metaTitle: Joi.string()
        .allow("")
        .optional(),

    metaDescription: Joi.string()
        .allow("")
        .optional(),


    // =================================================
    // SPECIFICATIONS
    // =================================================

    specifications: Joi.object()
        .default({})

});


// =====================================================
// UPDATE PRODUCT VALIDATION
// =====================================================

export const updateProductValidation = Joi.object({

    name: Joi.string()
        .trim()
        .min(2)
        .max(150),

    barcode: Joi.string()
        .trim()
        .allow(""),

    category: Joi.string()
        .trim(),

    brand: Joi.string()
        .trim(),

    description: Joi.string()
        .allow(""),

    shortDescription: Joi.string()
        .allow(""),


    // =================================================
    // PRICING
    // =================================================

    pricing: Joi.object({

        purchasePrice: Joi.number()
            .min(0),

        sellingPrice: Joi.number()
            .min(0),

        mrp: Joi.number()
            .min(0),

        discount: Joi.number()
            .min(0)
            .max(100),

        gst: Joi.number()
            .min(0)
            .max(100)

    }),


    // =================================================
    // SEO
    // =================================================

    metaTitle: Joi.string()
        .allow(""),

    metaDescription: Joi.string()
        .allow(""),


    // =================================================
    // SPECIFICATIONS
    // =================================================

    specifications: Joi.object()

});