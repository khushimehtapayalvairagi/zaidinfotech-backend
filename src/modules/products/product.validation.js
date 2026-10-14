import Joi from "joi";


// =====================================================
// MERGED PRODUCT VALIDATION
// =====================================================
//
// createProductValidation
//   -> hsnCode wale version se (baaki sab same tha)
//
// updateProductValidation
//   -> "fixed" version se (productType me default("NEW")
//      nahi, status allowed, rental fields optional,
//      totalQuantity / rentedQuantity allowed)
//   -> + hsnCode (4 / 6 / 8 digits) add kiya
//
// =====================================================


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

    // =================================================
    // HSN CODE (used on tax invoices)
    // Optional. 4, 6 or 8 digits.
    //
    // Joi unknown keys reject karta hai, isliye ye field
    // yahan hona zaroori hai, warna AddProduct form par
    // '"hsnCode" is not allowed' error aata.
    // Empty string allowed hai, taaki field optional rahe.
    // =================================================

    hsnCode: Joi.string()
        .trim()
        .pattern(/^\d{4}(\d{2}(\d{2})?)?$/)
        .allow("")
        .optional()
        .messages({
            "string.pattern.base":
                "HSN code must be 4, 6 or 8 digits"
        }),

    category: Joi.string()
        .trim()
        .required(),

    subcategory: Joi.string()
        .trim()
        .allow("")
        .allow(null)
        .optional(),

    productType: Joi.string()
        .valid("NEW", "REFURBISHED", "RENTAL")
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
    // purchasePrice   = company purchase/cost price
    // retailPrice     = PERSONAL customer price (required)
    // wholesalePrice  = BUSINESS / CORPORATE customer price (optional)
    // =================================================

    pricing: Joi.object({

        purchasePrice: Joi.number()
            .min(0)
            .required(),

        retailPrice: Joi.number()
            .min(0)
            .required(),

        wholesalePrice: Joi.number()
            .min(0)
            .allow(null)
            .optional(),

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

export const updateProductValidation = Joi.object({

    // =====================================================
    // BASIC INFORMATION
    // =====================================================

    name: Joi.string()
        .trim()
        .min(2)
        .max(150)
        .optional(),

    barcode: Joi.string()
        .trim()
        .allow("")
        .optional(),

    // =====================================================
    // HSN CODE (used on tax invoices)
    // Optional. 4, 6 or 8 digits.
    //
    // EditProduct form se HSN code later edit ho sake,
    // isliye yahan bhi allowed hai.
    // =====================================================

    hsnCode: Joi.string()
        .trim()
        .pattern(/^\d{4}(\d{2}(\d{2})?)?$/)
        .allow("")
        .optional()
        .messages({
            "string.pattern.base":
                "HSN code must be 4, 6 or 8 digits"
        }),

    category: Joi.string()
        .trim()
        .optional(),

    subcategory: Joi.string()
        .trim()
        .allow("")
        .allow(null)
        .optional(),

    // =====================================================
    // PRODUCT TYPE
    // =====================================================
    // IMPORTANT:
    // Update mein default("NEW") nahi lagana.
    // Warna existing REFURBISHED / RENTAL product
    // galti se NEW ban sakta hai.
    // =====================================================

    productType: Joi.string()
        .valid(
            "NEW",
            "REFURBISHED",
            "RENTAL"
        )
        .optional(),

    // =====================================================
    // PRODUCT STATUS
    // =====================================================
    // FIX:
    // "status" is not allowed
    // =====================================================

    status: Joi.string()
        .valid(
            "ACTIVE",
            "INACTIVE",
            "OUT_OF_STOCK",
            "DISCONTINUED"
        )
        .optional(),

    // =====================================================
    // REFURBISHED DETAILS
    // =====================================================

    refurbishedDetails: Joi.object({

        grade: Joi.string()
            .valid(
                "A+",
                "A",
                "B",
                "C"
            )
            .optional(),

        batteryHealth: Joi.number()
            .min(0)
            .max(100)
            .optional(),

        warrantyMonths: Joi.number()
            .min(0)
            .optional(),

        testingStatus: Joi.string()
            .valid(
                "TESTED",
                "NOT_TESTED"
            )
            .optional()

    }).optional(),

    // =====================================================
    // BRAND
    // =====================================================

    brand: Joi.string()
        .trim()
        .optional(),

    // =====================================================
    // DESCRIPTION
    // =====================================================

    description: Joi.string()
        .allow("")
        .optional(),

    shortDescription: Joi.string()
        .allow("")
        .optional(),

    // =====================================================
    // PRICING
    // =====================================================
    //
    // purchasePrice   = Company purchase price
    // retailPrice     = Personal customer price
    // wholesalePrice  = Business customer price
    //
    // =====================================================

    pricing: Joi.object({

        purchasePrice: Joi.number()
            .min(0)
            .optional(),

        retailPrice: Joi.number()
            .min(0)
            .optional(),

        wholesalePrice: Joi.number()
            .min(0)
            .allow(null)
            .optional(),

        mrp: Joi.number()
            .min(0)
            .optional(),

        discount: Joi.number()
            .min(0)
            .max(100)
            .optional(),

        gst: Joi.number()
            .min(0)
            .max(100)
            .optional()

    }).optional(),

    // =====================================================
    // SEO
    // =====================================================

    metaTitle: Joi.string()
        .allow("")
        .optional(),

    metaDescription: Joi.string()
        .allow("")
        .optional(),

    // =====================================================
    // SPECIFICATIONS
    // =====================================================

    specifications: Joi.object()
        .optional(),

    // =====================================================
    // RENTAL DETAILS
    // =====================================================
    //
    // Rental fields optional for Edit.
    //
    // Existing rental allocation/return functionality
    // should continue managing stock quantities.
    //
    // =====================================================

    rental: Joi.object({

        isAvailableForRent: Joi.boolean()
            .optional(),

        monthlyRent: Joi.number()
            .min(0)
            .optional(),

        securityDeposit: Joi.number()
            .min(0)
            .optional(),

        minimumRentalMonths: Joi.number()
            .integer()
            .min(3)
            .optional(),

        gst: Joi.number()
            .min(0)
            .max(100)
            .optional(),

        availableQuantity: Joi.number()
            .integer()
            .min(0)
            .optional(),

        totalQuantity: Joi.number()
            .integer()
            .min(0)
            .optional(),

        rentedQuantity: Joi.number()
            .integer()
            .min(0)
            .optional(),

        basicSoftwareInstalled: Joi.boolean()
            .optional(),

        includedItems: Joi.array()
            .items(
                Joi.string().trim()
            )
            .optional(),

        notes: Joi.string()
            .allow("")
            .optional()

    })
        .min(1)
        .optional()

});