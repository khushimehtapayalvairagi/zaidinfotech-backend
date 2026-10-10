import mongoose from "mongoose";


// ============================================================
// RENTAL PAYMENT / INSTALLMENT SCHEMA
// File:
// src/modules/rental/rentalPayment.model.js
// ============================================================


// ------------------------------------------------------------
// INDIVIDUAL PAYMENT ENTRY
// ------------------------------------------------------------

const paymentEntrySchema = new mongoose.Schema(
    {
        amount: {
            type: Number,
            required: true,
            min: 0
        },

        paymentMethod: {
            type: String,
            required: true,
            uppercase: true,
            trim: true
        },

        reference: {
            type: String,
            default: "",
            trim: true
        },

        paidAt: {
            type: Date,
            default: Date.now
        },

        receivedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null
        },

        paymentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Payment",
            default: null
        }
    },
    {
        _id: true
    }
);


// ------------------------------------------------------------
// RENTAL PAYMENT / INSTALLMENT
// ------------------------------------------------------------

const rentalPaymentSchema = new mongoose.Schema(
    {
        // ----------------------------------------------------
        // RENTAL REFERENCE
        // ----------------------------------------------------

        rentalId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Rental",
            required: true,
            index: true
        },

        rentalNumber: {
            type: String,
            required: true,
            trim: true,
            index: true
        },

        orderId: {
            type: String,
            required: true,
            trim: true,
            index: true
        },


        // ----------------------------------------------------
        // INSTALLMENT INFORMATION
        // ----------------------------------------------------

        installmentNumber: {
            type: Number,
            required: true,
            min: 1
        },

        totalInstallments: {
            type: Number,
            required: true,
            min: 1
        },

        periodStart: {
            type: Date,
            required: true
        },

        periodEnd: {
            type: Date,
            required: true
        },

        dueDate: {
            type: Date,
            required: true,
            index: true
        },


        // ----------------------------------------------------
        // AMOUNTS
        // ----------------------------------------------------

        rentAmount: {
            type: Number,
            required: true,
            min: 0
        },

        gstAmount: {
            type: Number,
            required: true,
            min: 0,
            default: 0
        },

        totalAmount: {
            type: Number,
            required: true,
            min: 0
        },

        paidAmount: {
            type: Number,
            min: 0,
            default: 0
        },


        // ----------------------------------------------------
        // PAYMENT STATUS
        // ----------------------------------------------------

        status: {
            type: String,
            enum: [
                "PENDING",
                "PARTIAL",
                "PAID",
                "CANCELLED",
                "ADJUSTED"
            ],
            default: "PENDING",
            index: true
        },

        paidAt: {
            type: Date,
            default: null
        },


        // ----------------------------------------------------
        // PAYMENT HISTORY
        // ----------------------------------------------------

        payments: {
            type: [paymentEntrySchema],
            default: []
        },


        // ----------------------------------------------------
        // NOTES
        // ----------------------------------------------------

        notes: {
            type: String,
            default: "",
            trim: true
        }
    },
    {
        timestamps: true
    }
);


// ============================================================
// INDEXES
// ============================================================

// Rental ke installments sequence me jaldi mil sake.
rentalPaymentSchema.index({
    rentalId: 1,
    installmentNumber: 1
});


// Due installments ke liye.
rentalPaymentSchema.index({
    status: 1,
    dueDate: 1
});


// Order ke saare rental installments ke liye.
rentalPaymentSchema.index({
    orderId: 1
});


// ============================================================
// MODEL
// ============================================================

const RentalPayment = mongoose.model(
    "RentalPayment",
    rentalPaymentSchema
);

export default RentalPayment;