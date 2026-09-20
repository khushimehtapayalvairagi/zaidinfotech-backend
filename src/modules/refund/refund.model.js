import mongoose from "mongoose";

const refundSchema = new mongoose.Schema(
    {

        // =====================================================
        // REFUND NUMBER
        // =====================================================

        refundNumber: {
            type: String,
            unique: true,
            required: true,
            trim: true
        },


        // =====================================================
        // ORDER
        // =====================================================

        order: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Order",
            required: true,
            index: true
        },


        // =====================================================
        // CUSTOMER
        // =====================================================

        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true
        },


        // =====================================================
        // ORIGINAL PAYMENT
        // =====================================================

        payment: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Payment",
            required: true
        },


        // =====================================================
        // REFUND AMOUNT
        // =====================================================

        refundAmount: {
            type: Number,
            required: true,
            min: 0
        },


        // =====================================================
        // REFUND METHOD
        // =====================================================

        refundMethod: {
            type: String,
            enum: [
                "CASH",
                "BANK",
                "UPI",
                "RAZORPAY"
            ],
            required: true
        },


        // =====================================================
        // REFUND REASON
        // =====================================================

        reason: {
            type: String,
            required: true,
            trim: true
        },


        // =====================================================
        // REFUND STATUS
        // =====================================================

        status: {
            type: String,
            enum: [
                "REQUESTED",
                "APPROVED",
                "REJECTED",
                "PROCESSING",
                "COMPLETED",
                "CANCELLED"
            ],
            default: "REQUESTED",
            index: true
        },


        // =====================================================
        // REFUND ITEMS
        // =====================================================

        items: [
            {
                product: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Product",
                    required: true
                },

                title: {
                    type: String,
                    required: true
                },

                quantity: {
                    type: Number,
                    required: true,
                    min: 1
                },

                refundAmount: {
                    type: Number,
                    required: true,
                    min: 0
                },

                condition: {
                    type: String,
                    enum: [
                        "GOOD",
                        "DAMAGED",
                        "DEFECTIVE"
                    ],
                    default: "GOOD"
                }
            }
        ],


        // =====================================================
        // APPROVAL
        // =====================================================

        requestedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        approvedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null
        },

        processedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null
        },


        // =====================================================
        // DATES
        // =====================================================

        requestedAt: {
            type: Date,
            default: Date.now
        },

        approvedAt: {
            type: Date,
            default: null
        },

        processedAt: {
            type: Date,
            default: null
        },


        // =====================================================
        // NOTES
        // =====================================================

        notes: {
            type: String,
            default: ""
        },


        // =====================================================
        // GATEWAY INFORMATION
        // =====================================================

        gatewayRefundId: {
            type: String,
            default: ""
        },

        gatewayResponse: {
            type: mongoose.Schema.Types.Mixed,
            default: {}
        }

    },
    {
        timestamps: true
    }
);


refundSchema.index({
    order: 1,
    status: 1
});


refundSchema.index({
    user: 1,
    createdAt: -1
});


const Refund = mongoose.model(
    "Refund",
    refundSchema
);


export default Refund;