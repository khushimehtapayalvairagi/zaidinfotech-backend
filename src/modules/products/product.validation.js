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
   
        subcategory: Joi.string()
    .trim()
    .allow("")
    .allow(null)
    .optional(),

    productType: Joi.string()
    .valid("NEW", "REFURBISHED")
    .default("NEW"),
    refurbishedDetails: Joi.when("productType", {
    is: "REFURBISHED",

    then: Joi.object({

        grade: Joi.string()
            .valid("A+", "A", "B", "C")
            .required(),

        batteryHealth: Joi.number()
            .min(0)
            .max(100)
            .required(),

        warrantyMonths: Joi.number()
            .min(0)
            .required(),

        testingStatus: Joi.string()
            .valid("TESTED", "NOT_TESTED")
            .required()

    }).required(),

    otherwise: Joi.forbidden()

}),

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
        .default({}),
        // =====================================================
// RENTAL
// =====================================================

rental: Joi.object({

    isAvailableForRent:
        Joi.boolean()
            .required(),

    monthlyRent:
        Joi.number()
            .min(0)
            .when("isAvailableForRent", {
                is: true,
                then: Joi.required(),
                otherwise: Joi.optional()
            }),

    securityDeposit:
        Joi.number()
            .min(0)
            .when("isAvailableForRent", {
                is: true,
                then: Joi.required(),
                otherwise: Joi.optional()
            }),

    minimumRentalMonths:
        Joi.number()
            .integer()
            .min(1)
            .when("isAvailableForRent", {
                is: true,
                then: Joi.required(),
                otherwise: Joi.optional()
            }),

    gst:
        Joi.number()
            .min(0)
            .max(100)
            .default(0),

    availableQuantity:
        Joi.number()
            .integer()
            .min(0)
            .required(),

    basicSoftwareInstalled:
        Joi.boolean()
            .default(false),

    includedItems:
        Joi.array()
            .items(
                Joi.string().trim()
            )
            .default([]),

    notes:
        Joi.string()
            .allow("")
            .default("")

})

        

});


// =====================================================
// UPDATE PRODUCT VALIDATION
// =====================================================

// export const updateProductValidation = Joi.object({

//     name: Joi.string()
//         .trim()
//         .min(2)
//         .max(150),

//     barcode: Joi.string()
//         .trim()
//         .allow(""),

//     category: Joi.string()
//         .trim(),

//    subcategory: Joi.string()
//     .trim()
//     .allow("")
//     .allow(null),

//     productType: Joi.string()
//     .valid("NEW", "REFURBISHED"),

//     brand: Joi.string()
//         .trim(),

//     description: Joi.string()
//         .allow(""),

//     shortDescription: Joi.string()
//         .allow(""),


//     // =================================================
//     // PRICING
//     // =================================================

//     pricing: Joi.object({

//         purchasePrice: Joi.number()
//             .min(0),

//         sellingPrice: Joi.number()
//             .min(0),

//         mrp: Joi.number()
//             .min(0),

//         discount: Joi.number()
//             .min(0)
//             .max(100),

//         gst: Joi.number()
//             .min(0)
//             .max(100)

//     }),


//     // =================================================
//     // SEO
//     // =================================================

//     metaTitle: Joi.string()
//         .allow(""),

//     metaDescription: Joi.string()
//         .allow(""),


//     // =================================================
//     // SPECIFICATIONS
//     // =================================================

//     specifications: Joi.object()

// });

// =====================================================
// UPDATE PRODUCT VALIDATION
// =====================================================

export const updateProductValidation = Joi.object({

    // =================================================
    // BASIC INFORMATION
    // =================================================

    name: Joi.string()
        .trim()
        .min(2)
        .max(150),

    barcode: Joi.string()
        .trim()
        .allow(""),

    category: Joi.string()
        .trim(),

    subcategory: Joi.string()
        .trim()
        .allow("")
        .allow(null),

    // =================================================
    // PRODUCT TYPE
    // =================================================

    productType: Joi.string()
        .valid("NEW", "REFURBISHED"),

    // =================================================
    // REFURBISHED DETAILS
    // =================================================

    refurbishedDetails: Joi.object({

        grade: Joi.string()
            .valid("A+", "A", "B", "C"),

        batteryHealth: Joi.number()
            .min(0)
            .max(100),

        warrantyMonths: Joi.number()
            .min(0),

        testingStatus: Joi.string()
            .valid("TESTED", "NOT_TESTED")

    }),

    // =================================================
    // BRAND
    // =================================================

    brand: Joi.string()
        .trim(),

    // =================================================
    // DESCRIPTION
    // =================================================

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

    specifications: Joi.object(),
    // =================================================
// RENTAL
// =================================================

// =====================================================
// RENTAL
// =====================================================

rental: Joi.object({

    isAvailableForRent: Joi.boolean(),

    monthlyRent: Joi.number()
        .min(0),

    securityDeposit: Joi.number()
        .min(0),

    minimumRentalMonths: Joi.number()
        .integer()
        .min(1),

    gst: Joi.number()
        .min(0)
        .max(100),

    availableQuantity: Joi.number()
        .integer()
        .min(0),

    basicSoftwareInstalled: Joi.boolean(),

    includedItems: Joi.array()
        .items(Joi.string().trim()),

    notes: Joi.string()
        .allow("")

}),

});