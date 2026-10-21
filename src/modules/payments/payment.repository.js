// import mongoose from "mongoose";

// import { PAYMENT_STATUS } from "../../common/constants/paymentStatus.js";
// import { PAYMENT_METHOD } from "../../common/constants/paymentMethod.js";
// import { PAYMENT_FOR } from "../../common/constants/paymentFor.js";

// const paymentSchema = new mongoose.Schema(
//     {

//         // Customer
//         user: {
//             type: mongoose.Schema.Types.ObjectId,
//             ref: "User",
//             required: true,
//             index: true
//         },

//         // ORDER / REPAIR / RENTAL
//         paymentFor: {
//             type: String,
//             enum: Object.values(PAYMENT_FOR),
//             required: true
//         },

//         // =====================================================
//         // SALE SOURCE
//         // ONLINE / WALK_IN
//         // =====================================================
//         saleSource: {
//             type: String,
//             enum: ["ONLINE", "WALK_IN"],
//             default: "ONLINE",
//             index: true
//         },

//         // Payment Type
//         paymentType: {
//             type: String,
//             enum: [
//                 "SECURITY_DEPOSIT",
//                 "RENTAL_MONTHLY",
//                 "DAMAGE_CHARGE",
//                 "OTHER"
//             ],
//             default: null
//         },

//         // Order Id / Repair Id / Rental Id
//         referenceId: {
//             type: mongoose.Schema.Types.ObjectId,
//             required: true,
//             index: true
//         },

//         // =====================================================
//         // RAZORPAY ORDER ID
//         // Set by the backend only, when the Razorpay order is
//         // created. Used to find this payment during verify.
//         // IMPORTANT: no default value (an empty string would
//         // break the unique index).
//         // =====================================================
//         razorpayOrderId: {
//             type: String,
//             unique: true,
//             sparse: true,
//             default: undefined,
//             trim: true
//         },

//         // Receipt Number
//         receiptNumber: {
//             type: String,
//             unique: true,
//             required: true,
//             trim: true
//         },

//         // Amount
//         amount: {
//             type: Number,
//             required: true,
//             min: 0
//         },

//         // Currency
//         currency: {
//             type: String,
//             default: "INR",
//             uppercase: true
//         },

//         // Payment Method
//         paymentMethod: {
//             type: String,
//             enum: Object.values(PAYMENT_METHOD),
//             required: true
//         },

//         // Payment Status
//         paymentStatus: {
//             type: String,
//             enum: Object.values(PAYMENT_STATUS),
//             default: PAYMENT_STATUS.PENDING
//         },

//         // Payment Gateway
//         gateway: {
//             type: String,
//             default: ""
//         },

//         // Gateway Transaction Id
//         transactionId: {
//             type: String,
//             default: "",
//             trim: true
//         },

//         // Gateway Payment Id
//         gatewayPaymentId: {
//             type: String,
//             default: "",
//             trim: true
//         },

//         // Complete Gateway Response
//         gatewayResponse: {
//             type: mongoose.Schema.Types.Mixed,
//             default: {}
//         },

//         // Failure Reason
//         failureReason: {
//             type: String,
//             default: ""
//         },

//         isDeleted: {
//             type: Boolean,
//             default: false
//         },

//         // Refund Amount
//         refundedAmount: {
//             type: Number,
//             default: 0,
//             min: 0
//         },

//         // Refund Reason
//         refundReason: {
//             type: String,
//             default: ""
//         },

//         // Payment Date
//         paymentDate: {
//             type: Date
//         },

//         // Paid At
//         paidAt: {
//             type: Date
//         },

//         // Refunded At
//         refundedAt: {
//             type: Date
//         }

//     },
//     {
//         timestamps: true
//     }
// );

// // Helpful indexes
// paymentSchema.index({
//     paymentFor: 1,
//     referenceId: 1
// });


// const Payment = mongoose.model(
//     "Payment",
//     paymentSchema
// );

// export default Payment;

import Payment from "./payment.model.js";

import {
    PAYMENT_STATUS
} from "../../common/constants/paymentStatus.js";

// =======================================
// CREATE PAYMENT
// =======================================

export const createPayment = async (paymentData) => {
    return await Payment.create(paymentData);
};

// =======================================
// GET PAYMENT COUNT
// (deleted bhi count hote hain, taaki receipt number repeat na ho)
// =======================================

export const getPaymentCount = async () => {
    return await Payment.countDocuments({});
};

// =======================================
// GET PAYMENT BY ID
// =======================================

export const getPaymentById = async (paymentId) => {
    return await Payment.findOne({
        _id: paymentId,
        isDeleted: { $ne: true },
    }).populate("user", "name firstName lastName email phone");
};

// =======================================
// GET PAYMENT BY RAZORPAY ORDER ID
// (verify ke time use hota hai)
// =======================================

export const getPaymentByRazorpayOrderId = async (razorpayOrderId) => {
    return await Payment.findOne({
        razorpayOrderId,
        isDeleted: { $ne: true },
    });
};

// =======================================
// GET PAYMENT BY REFERENCE
// =======================================

export const getPaymentByReference = async (paymentFor, referenceId) => {
    return await Payment.findOne({
        paymentFor,
        referenceId,
        isDeleted: { $ne: true },
    }).sort({ createdAt: -1 });
};

// =======================================
// GET USER PAYMENTS
// =======================================

export const getUserPayments = async (userId) => {
    return await Payment.find({
        user: userId,
        isDeleted: { $ne: true },
    }).sort({ createdAt: -1 });
};

// =======================================
// GET ALL PAYMENTS
// ADMIN / SALES / ACCOUNTANT
// =======================================

export const getAllPayments = async () => {
    return await Payment.find({
        isDeleted: { $ne: true },
    })
        .populate("user", "name firstName lastName email phone")
        .sort({ createdAt: -1 });
};

// =======================================
// MARK SUCCESS (ATOMIC)
// Sirf tab update hoga jab payment pehle se
// SUCCESS ya REFUNDED na ho. Nahi to null return.
// =======================================

export const markPaymentSuccessIfNotPaid = async (
    paymentId,
    razorpayPaymentId,
    gatewayResponse = {}
) => {
    const now = new Date();

    return await Payment.findOneAndUpdate(
        {
            _id: paymentId,
            isDeleted: { $ne: true },
            paymentStatus: {
                $nin: [
                    PAYMENT_STATUS.SUCCESS,
                    PAYMENT_STATUS.REFUNDED,
                ],
            },
        },
        {
            $set: {
                paymentStatus: PAYMENT_STATUS.SUCCESS,
                gateway: "RAZORPAY",
                transactionId: razorpayPaymentId,
                gatewayPaymentId: razorpayPaymentId,
                gatewayResponse,
                failureReason: "",
                paymentDate: now,
                paidAt: now,
            },
        },
        { new: true }
    );
};

// =======================================
// UPDATE PAYMENT STATUS (SUCCESS)
// markPaymentSuccess service isko use karta hai
// =======================================

export const updatePaymentStatus = async (
    paymentId,
    status,
    transactionId,
    gatewayPaymentId,
    gateway,
    gatewayResponse,
    failureReason = ""
) => {
    const now = new Date();

    const update = {
        paymentStatus: status,
        failureReason,
    };

    if (transactionId !== undefined) update.transactionId = transactionId;
    if (gatewayPaymentId !== undefined) update.gatewayPaymentId = gatewayPaymentId;
    if (gateway !== undefined) update.gateway = gateway;
    if (gatewayResponse !== undefined) update.gatewayResponse = gatewayResponse;

    if (status === PAYMENT_STATUS.SUCCESS) {
        update.paymentDate = now;
        update.paidAt = now;
    }

    return await Payment.findOneAndUpdate(
        { _id: paymentId, isDeleted: { $ne: true } },
        { $set: update },
        { new: true, runValidators: true }
    );
};

// =======================================
// UPDATE PAYMENT FAILED
// =======================================

export const updatePaymentFailed = async (paymentId, reason) => {
    return await Payment.findOneAndUpdate(
        { _id: paymentId, isDeleted: { $ne: true } },
        {
            $set: {
                paymentStatus: PAYMENT_STATUS.FAILED || "FAILED",
                failureReason: reason || "Payment failed",
            },
        },
        { new: true, runValidators: true }
    );
};

// =======================================
// UPDATE REFUND STATUS
// =======================================

export const updateRefundStatus = async (
    paymentId,
    status,
    refundReason,
    refundedAmount
) => {
    const update = {
        paymentStatus: status,
        refundReason: refundReason || "",
        refundedAt: new Date(),
    };

    if (refundedAmount !== undefined && refundedAmount !== null) {
        update.refundedAmount = Number(refundedAmount);
    }

    return await Payment.findOneAndUpdate(
        { _id: paymentId, isDeleted: { $ne: true } },
        { $set: update },
        { new: true, runValidators: true }
    );
};