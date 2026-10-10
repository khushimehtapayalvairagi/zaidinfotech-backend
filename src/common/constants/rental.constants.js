// ============================================================
// RENTAL CONSTANTS
// File:
// src/modules/rental/rental.constants.js
// ============================================================

// ------------------------------------------------------------
// PAYMENT METHODS
// ------------------------------------------------------------

export const ALLOWED_PAYMENT_METHODS = [
    "CASH",
    "UPI",
    "CARD",
    "BANK_TRANSFER",
    "ONLINE"
];


// ------------------------------------------------------------
// COMPANY RENTAL RULES
// ------------------------------------------------------------

// Company rental ka minimum period 3 months hai.
export const COMPANY_MIN_MONTHS = 3;


// ------------------------------------------------------------
// RENTAL UNIT LIMITS
// ------------------------------------------------------------

// Individual customer ek order me maximum 1 laptop rent kar sakta hai.
export const MAX_UNITS_INDIVIDUAL_ORDER = 1;

// Company customer ek order me maximum 10 laptops rent kar sakta hai.
export const MAX_UNITS_COMPANY_ORDER = 10;


// ------------------------------------------------------------
// WRITE-OFF CONDITIONS
// ------------------------------------------------------------

// In conditions me returned laptop rental inventory se permanently
// remove/write-off hoga.
export const WRITE_OFF_CONDITIONS = [
    "MISSING",
    "HEAVILY_DAMAGED"
];


// ------------------------------------------------------------
// PAYMENT TYPE
// ------------------------------------------------------------

// Rental installment ko main payment/accounting system me identify
// karne ke liye use hota hai.
export const RENT_PAYMENT_TYPE = "RENTAL_INSTALLMENT";


// ------------------------------------------------------------
// PAYMENT METHOD NORMALIZER
// ------------------------------------------------------------

export const normalizePaymentMethod = (value) => {
    const method = String(value || "")
        .trim()
        .toUpperCase();

    if (method === "BANK TRANSFER") {
        return "BANK_TRANSFER";
    }

    if (method === "BANKTRANSFER") {
        return "BANK_TRANSFER";
    }

    return method;
};


// ------------------------------------------------------------
// MONEY ROUNDING
// ------------------------------------------------------------

export const round2 = (value) => {
    const number = Number(value);

    if (!Number.isFinite(number)) {
        return 0;
    }

    return Math.round((number + Number.EPSILON) * 100) / 100;
};