import Joi from "joi";

import {
    PAYMENT_FOR
} from "../../common/constants/paymentFor.js";

import {
    PAYMENT_METHOD
} from "../../common/constants/paymentMethod.js";

import {
    PAYMENT_STATUS
} from "../../common/constants/paymentStatus.js";


// =====================================================
// SAFE CONSTANT VALUES
// =====================================================
//
// Existing constants ko preserve kiya gaya hai.
// Saath hi ORDER / REPAIR / RENTAL aur UPI ko
// current Checkout payment flow ke liye support kiya gaya hai.
// =====================================================

const PAYMENT_FOR_VALUES = [
    ...Object.values(PAYMENT_FOR || {}),
    "ORDER",
    "REPAIR",
    "RENTAL"
]
    .map((value) =>
        String(value)
            .trim()
            .toUpperCase()
    )
    .filter(Boolean);


// Remove duplicates
const UNIQUE_PAYMENT_FOR_VALUES = [
    ...new Set(PAYMENT_FOR_VALUES)
];


// =====================================================
// PAYMENT METHODS
// =====================================================

const PAYMENT_METHOD_VALUES = [
    ...Object.values(PAYMENT_METHOD || {}),
    "UPI",
    "CARD",
    "NET_BANKING",
    "CASH"
]
    .map((value) =>
        String(value)
            .trim()
            .toUpperCase()
    )
    .filter(Boolean);


// Remove duplicates
const UNIQUE_PAYMENT_METHOD_VALUES = [
    ...new Set(PAYMENT_METHOD_VALUES)
];


// =====================================================
// PAYMENT STATUS
// =====================================================

const PAYMENT_STATUS_VALUES = [
    ...Object.values(PAYMENT_STATUS || {})
]
    .map((value) =>
        String(value)
            .trim()
            .toUpperCase()
    )
    .filter(Boolean);


// Remove duplicates
const UNIQUE_PAYMENT_STATUS_VALUES = [
    ...new Set(PAYMENT_STATUS_VALUES)
];


// =====================================================
// CREATE PAYMENT VALIDATION
// POST /api/payments
// =====================================================
//
// Current Checkout sends:
//
// {
//     paymentFor: "ORDER",
//     referenceId: order._id,
//     amount: order.totalAmount,
//     paymentMethod: "UPI"
// }
//
// currency/paymentStatus ko yahan required nahi kiya gaya,
// kyunki payment.service.js unke defaults khud set karta hai.
// =====================================================

export const createPaymentValidation = Joi.object({

    // -------------------------------------------------
    // PAYMENT FOR
    // -------------------------------------------------

    paymentFor:
        Joi.string()
            .trim()
            .uppercase()
            .valid(
                ...UNIQUE_PAYMENT_FOR_VALUES
            )
            .required()
            .messages({

                "any.required":
                    "Payment For is required",

                "string.empty":
                    "Payment For is required",

                "any.only":
                    "Invalid paymentFor. Allowed values: ORDER, REPAIR, RENTAL"

            }),


    // -------------------------------------------------
    // REFERENCE ID
    // -------------------------------------------------

    referenceId:
        Joi.string()
            .trim()
            .required()
            .messages({

                "any.required":
                    "Reference ID is required",

                "string.empty":
                    "Reference ID is required"

            }),


    // -------------------------------------------------
    // AMOUNT
    // -------------------------------------------------

    amount:
        Joi.number()
            .greater(0)
            .required()
            .messages({

                "any.required":
                    "Payment amount is required",

                "number.base":
                    "Payment amount must be a valid number",

                "number.greater":
                    "Payment amount must be greater than 0"

            }),


    // -------------------------------------------------
    // PAYMENT METHOD
    // -------------------------------------------------

    paymentMethod:
        Joi.string()
            .trim()
            .uppercase()
            .valid(
                ...UNIQUE_PAYMENT_METHOD_VALUES
            )
            .required()
            .messages({

                "any.required":
                    "Payment method is required",

                "string.empty":
                    "Payment method is required",

                "any.only":
                    "Invalid payment method. Allowed values: UPI, CARD, NET_BANKING, CASH"

            }),


    // -------------------------------------------------
    // OPTIONAL CURRENCY
    // -------------------------------------------------
    //
    // Service already defaults this to INR.
    //

    currency:
        Joi.string()
            .trim()
            .uppercase()
            .default("INR"),


    // -------------------------------------------------
    // OPTIONAL PAYMENT TYPE
    // -------------------------------------------------

    paymentType:
        Joi.string()
            .trim()
            .allow(""),


    // -------------------------------------------------
    // OPTIONAL PAYMENT STATUS
    // -------------------------------------------------
    //
    // Service already defaults this to PENDING.
    //

    paymentStatus:
        Joi.string()
            .trim()
            .uppercase()
            .valid(
                ...UNIQUE_PAYMENT_STATUS_VALUES
            ),


    // -------------------------------------------------
    // OPTIONAL SALE SOURCE
    // -------------------------------------------------

    saleSource:
        Joi.string()
            .trim()
            .uppercase()
            .valid(
                "ONLINE",
                "WALK_IN",
                "WALKIN",
                "REPAIR",
                "RENTAL"
            ),


    // -------------------------------------------------
    // OPTIONAL RECEIPT NUMBER
    // -------------------------------------------------
    //
    // Backend generates this automatically.
    //

    receiptNumber:
        Joi.string()
            .trim()
            .allow(""),


    // -------------------------------------------------
    // OPTIONAL PAYMENT DATE
    // -------------------------------------------------

    paymentDate:
        Joi.date(),


    // -------------------------------------------------
    // OPTIONAL PAID AT
    // -------------------------------------------------

    paidAt:
        Joi.date(),


    // -------------------------------------------------
    // OPTIONAL TRANSACTION ID
    // -------------------------------------------------

    transactionId:
        Joi.string()
            .trim()
            .allow(""),


    // -------------------------------------------------
    // OPTIONAL GATEWAY PAYMENT ID
    // -------------------------------------------------

    gatewayPaymentId:
        Joi.string()
            .trim()
            .allow(""),


    // -------------------------------------------------
    // OPTIONAL GATEWAY
    // -------------------------------------------------

    gateway:
        Joi.string()
            .trim()
            .allow(""),


    // -------------------------------------------------
    // OPTIONAL GATEWAY RESPONSE
    // -------------------------------------------------

    gatewayResponse:
        Joi.object()
            .default({})

})
    // Backend extra fields ko silently remove karne ke
    // bajay allow karte hain, taaki existing payment flow
    // accidentally break na ho.
    .unknown(true);


// =====================================================
// PAYMENT SUCCESS VALIDATION
// =====================================================

export const paymentSuccessValidation = Joi.object({

    gateway:
        Joi.string()
            .trim()
            .allow(""),

    gatewayPaymentId:
        Joi.string()
            .trim()
            .allow(""),

    transactionId:
        Joi.string()
            .trim()
            .allow(""),

    gatewayResponse:
        Joi.object()
            .default({})

})
    .unknown(true);


// =====================================================
// PAYMENT FAILED VALIDATION
// =====================================================

export const paymentFailedValidation = Joi.object({

    failureReason:
        Joi.string()
            .trim()
            .allow("")

})
    .unknown(true);


// =====================================================
// REFUND VALIDATION
// =====================================================

export const refundPaymentValidation = Joi.object({

    refundReason:
        Joi.string()
            .trim()
            .allow(""),

    refundedAmount:
        Joi.number()
            .min(0)
            .required()
            .messages({

                "any.required":
                    "Refund amount is required",

                "number.base":
                    "Refund amount must be a valid number",

                "number.min":
                    "Refund amount cannot be negative"

            })

})
    .unknown(true);