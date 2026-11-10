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

// export const getAllPayments = async () => {
//     return await Payment.find({
//         isDeleted: { $ne: true },
//     })
//         .populate("user", "name firstName lastName email phone")
//         .sort({ createdAt: -1 });
// };


export const getAllPayments = async (filters = {}) => {

    const query = {
        isDeleted: { $ne: true },
    };

    // NON_GST = sirf non-gst payments
    // GST     = baaki sab (purane payments bhi, jinme field nahi hai)
    if (filters.invoiceType === "NON_GST") {
        query.invoiceType = "NON_GST";
    } else if (filters.invoiceType === "GST") {
        query.invoiceType = { $ne: "NON_GST" };
    }

    return await Payment.find(query)
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