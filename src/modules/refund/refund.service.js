// import mongoose from "mongoose";
// import Razorpay from "razorpay";

// import Refund from "./refund.model.js";
// import Order from "../orders/order.model.js";
// import Payment from "../payments/payment.model.js";
// // NOTE: folder ka naam apne project ke hisaab se adjust karo (returns / return)
// import Return from "../return/return.model.js";

// import {
//     createRefundDB,
//     getRefundByIdDB,
//     getRefundsByOrderDB,
//     getAllRefundsDB
// } from "./refund.repository.js";


// // =====================================================
// // HELPERS
// // =====================================================

// const ACTIVE_REFUND_STATUSES = [
//     "REQUESTED",
//     "APPROVED",
//     "PROCESSING",
//     "COMPLETED"
// ];

// // Same check jo return.service.js me hai (local Mongo standalone ho to transaction skip)
// const supportsTransactions = () =>
//     mongoose.connection?.client?.topology?.description?.type?.includes(
//         "ReplicaSet"
//     );

// // Agar payments module me already Razorpay instance hai to wahi import kar lo
// let razorpayInstance = null;

// const getRazorpay = () => {
//     if (!razorpayInstance) {
//         razorpayInstance = new Razorpay({
//             key_id: process.env.RAZORPAY_KEY_ID,
//             key_secret: process.env.RAZORPAY_KEY_SECRET
//         });
//     }
//     return razorpayInstance;
// };

// // Payment model me Razorpay ka payment id (pay_xxx) jis field me save hota hai,
// // wo yaha add kar do.
// const getGatewayPaymentId = (payment) =>
//     payment?.gatewayPaymentId ||
//     payment?.razorpayPaymentId ||
//     payment?.razorpay_payment_id ||
//     payment?.transactionId ||
//     null;

// const generateRefundNumber = () =>
//     `REF${Date.now().toString().slice(-8)}${Math.floor(
//         100 + Math.random() * 900
//     )}`;


// // =====================================================
// // CREATE REFUND REQUEST (from a COMPLETED return)
// // =====================================================

// export const createRefundService = async (data, userId) => {

//     const {
//         returnId,
//         paymentId,
//         refundAmount,
//         refundMethod,
//         reason,
//         notes = "",
//         upiId = "",
//         bankDetails = {}
//     } = data;

//     if (!returnId) {
//         throw new Error("Return ID is required");
//     }

//     // -------------------------------------------------
//     // RETURN VALIDATION
//     // -------------------------------------------------

//     const returnRequest = await Return.findOne({
//         _id: returnId,
//         isDeleted: false
//     });

//     if (!returnRequest) {
//         throw new Error("Return request not found");
//     }

//     if (returnRequest.status !== "COMPLETED") {
//         throw new Error(
//             "Refund can only be initiated after the return is completed"
//         );
//     }

//     // Ek return ka ek hi active refund
//     const existing = await Refund.findOne({
//         returnRequest: returnRequest._id,
//         status: { $in: ACTIVE_REFUND_STATUSES }
//     });

//     if (existing) {
//         throw new Error(
//             `Refund ${existing.refundNumber} already exists for this return`
//         );
//     }

//     // -------------------------------------------------
//     // ORDER + PAYMENT
//     // -------------------------------------------------

//     const order = await Order.findById(returnRequest.order);

//     if (!order) {
//         throw new Error("Order not found");
//     }

//     const payment = paymentId
//         ? await Payment.findById(paymentId)
//         : await Payment.findOne({
//             referenceId: order._id,
//             paymentStatus: "PAID"
//         }).sort({ createdAt: -1 });

//     if (!payment) {
//         throw new Error("No paid payment found for this order");
//     }

//     if (payment.referenceId.toString() !== order._id.toString()) {
//         throw new Error("Payment does not belong to this order");
//     }

//     if (payment.paymentStatus !== "PAID") {
//         throw new Error("Only paid payment can be refunded");
//     }

//     // -------------------------------------------------
//     // ITEMS + AMOUNT
//     // -------------------------------------------------

//     const refundItems = returnRequest.items.map((item) => ({
//         product: item.product,
//         title: item.title,
//         quantity: item.quantity,
//         refundAmount: Number(item.price) * Number(item.quantity),
//         condition:
//             item.condition === "PENDING" ? "GOOD" : item.condition
//     }));

//     const itemsTotal = refundItems.reduce(
//         (sum, item) => sum + item.refundAmount,
//         0
//     );

//     const requestedRefund =
//         refundAmount === undefined || refundAmount === ""
//             ? itemsTotal
//             : Number(refundAmount);

//     const refundableAmount =
//         Number(payment.amount) - Number(payment.refundedAmount || 0);

//     if (!requestedRefund || requestedRefund <= 0) {
//         throw new Error("Refund amount must be greater than 0");
//     }

//     if (requestedRefund > itemsTotal) {
//         throw new Error(
//             `Refund cannot exceed returned items value (₹${itemsTotal})`
//         );
//     }

//     if (requestedRefund > refundableAmount) {
//         throw new Error(
//             `Maximum refundable amount is ₹${refundableAmount}`
//         );
//     }

//     // -------------------------------------------------
//     // METHOD VALIDATION
//     // -------------------------------------------------

//     const validMethods = ["CASH", "BANK", "UPI", "RAZORPAY"];

//     if (!validMethods.includes(refundMethod)) {
//         throw new Error("Invalid refund method");
//     }

//     if (refundMethod === "RAZORPAY" && !getGatewayPaymentId(payment)) {
//         throw new Error(
//             "This payment was not made via Razorpay - choose BANK / UPI / CASH"
//         );
//     }

//     if (refundMethod === "UPI" && !String(upiId).trim()) {
//         throw new Error("UPI ID is required for UPI refund");
//     }

//     if (
//         refundMethod === "BANK" &&
//         (!bankDetails?.accountHolderName ||
//             !bankDetails?.accountNumber ||
//             !bankDetails?.ifscCode)
//     ) {
//         throw new Error("Bank details are required for BANK refund");
//     }

//     // -------------------------------------------------
//     // CREATE
//     // -------------------------------------------------

//     return await createRefundDB({
//         refundNumber: generateRefundNumber(),
//         order: order._id,
//         user: order.user,
//         payment: payment._id,
//         returnRequest: returnRequest._id,
//         refundAmount: requestedRefund,
//         refundMethod,
//         reason:
//             reason || `Return ${returnRequest.returnNumber} completed`,
//         items: refundItems,
//         requestedBy: userId,
//         notes,
//         upiId: refundMethod === "UPI" ? String(upiId).trim() : "",
//         bankDetails: refundMethod === "BANK" ? bankDetails : undefined
//     });
// };


// // =====================================================
// // APPROVE REFUND
// // =====================================================

// export const approveRefundService = async (refundId, userId) => {

//     // Atomic: sirf REQUESTED wala hi APPROVED hoga
//     const refund = await Refund.findOneAndUpdate(
//         { _id: refundId, status: "REQUESTED" },
//         {
//             status: "APPROVED",
//             approvedBy: userId,
//             approvedAt: new Date()
//         },
//         { new: true }
//     );

//     if (!refund) {
//         throw new Error("Only requested refund can be approved");
//     }

//     return refund;
// };


// // =====================================================
// // PROCESS REFUND (actual paisa wapas)
// // =====================================================
// //
// // Flow:
// //   1. APPROVED -> PROCESSING (atomic lock, double click safe)
// //   2. RAZORPAY: gateway ko refund API call
// //      BANK/UPI/CASH: admin ne manually bhej diya, reference save
// //   3. Payment + Order + Refund update (COMPLETED)
// //
// // Gateway fail hua -> status wapas APPROVED, admin retry kar sakta hai.

// export const processRefundService = async (
//     refundId,
//     userId,
//     { transactionReference = "" } = {}
// ) => {

//     // ---------------- 1. LOCK ----------------
//     const refund = await Refund.findOneAndUpdate(
//         { _id: refundId, status: "APPROVED" },
//         { status: "PROCESSING", processedBy: userId },
//         { new: true }
//     );

//     if (!refund) {
//         throw new Error(
//             "Refund must be APPROVED (or it is already being processed)"
//         );
//     }

//     // ---------------- 2. MONEY MOVEMENT ----------------
//     try {

//         const payment = await Payment.findById(refund.payment);

//         if (!payment) {
//             throw new Error("Payment not found");
//         }

//         const remaining =
//             Number(payment.amount) - Number(payment.refundedAmount || 0);

//         if (Number(refund.refundAmount) > remaining) {
//             throw new Error("Refund amount exceeds remaining payment amount");
//         }

//         let gatewayData = {};

//         if (refund.refundMethod === "RAZORPAY") {

//             const rzpPaymentId = getGatewayPaymentId(payment);

//             if (!rzpPaymentId) {
//                 throw new Error("Razorpay payment id missing on payment");
//             }

//             const rzpRefund = await getRazorpay().payments.refund(
//                 rzpPaymentId,
//                 {
//                     amount: Math.round(Number(refund.refundAmount) * 100), // paise
//                     speed: "normal",
//                     receipt: refund.refundNumber,
//                     notes: {
//                         refundId: String(refund._id),
//                         orderId: String(refund.order)
//                     }
//                 }
//             );

//             gatewayData = {
//                 gatewayRefundId: rzpRefund.id,
//                 gatewayResponse: rzpRefund
//             };

//         } else {

//             if (
//                 ["BANK", "UPI"].includes(refund.refundMethod) &&
//                 !String(transactionReference).trim()
//             ) {
//                 throw new Error(
//                     "Transaction reference / UTR is required for manual refund"
//                 );
//             }

//             gatewayData = {
//                 transactionReference: String(transactionReference).trim()
//             };
//         }

//         // Paisa ja chuka hai -> turant save karo, taaki DB step fail ho
//         // to bhi gateway refund id hamare paas rahe.
//         await Refund.updateOne({ _id: refund._id }, gatewayData);

//     } catch (error) {

//         // Paisa nahi gaya -> retry allow
//         await Refund.updateOne(
//             { _id: refund._id },
//             { status: "APPROVED", processedBy: null }
//         );

//         throw error;
//     }

//     // ---------------- 3. BOOKKEEPING ----------------
//     const session = supportsTransactions()
//         ? await mongoose.startSession()
//         : null;

//     try {

//         if (session) session.startTransaction();

//         const saveOpts = session ? { session } : {};

//         const payment = await Payment.findById(refund.payment).session(session);
//         const order = await Order.findById(refund.order).session(session);
//         const freshRefund = await Refund.findById(refund._id).session(session);

//         if (!payment || !order || !freshRefund) {
//             throw new Error("Payment / Order / Refund missing during finalize");
//         }

//         const newRefunded =
//             Number(payment.refundedAmount || 0) +
//             Number(freshRefund.refundAmount);

//         payment.refundedAmount = newRefunded;
//         payment.refundReason = freshRefund.reason;
//         payment.refundedAt = new Date();

//         const fullyRefunded = newRefunded >= Number(payment.amount);

//         if (fullyRefunded) {
//             payment.paymentStatus = "REFUNDED";
//         }

//         order.paymentStatus = fullyRefunded
//             ? "REFUNDED"
//             : "PARTIALLY_REFUNDED";

//         freshRefund.status = "COMPLETED";
//         freshRefund.processedBy = userId;
//         freshRefund.processedAt = new Date();

//         await payment.save(saveOpts);
//         await order.save(saveOpts);
//         await freshRefund.save(saveOpts);

//         if (session) await session.commitTransaction();

//         return freshRefund;

//     } catch (error) {

//         if (session) await session.abortTransaction();

//         console.error(
//             `[REFUND ${refund.refundNumber}] money sent but DB finalize failed:`,
//             error
//         );

//         throw new Error(
//             "Refund was sent but saving failed. Refund is kept in PROCESSING - contact developer. " +
//             error.message
//         );

//     } finally {

//         if (session) await session.endSession();
//     }
// };


// // =====================================================
// // REJECT REFUND
// // =====================================================

// export const rejectRefundService = async (
//     refundId,
//     userId,
//     notes = ""
// ) => {

//     const refund = await Refund.findOne({
//         _id: refundId,
//         status: "REQUESTED"
//     });

//     if (!refund) {
//         throw new Error("Only requested refund can be rejected");
//     }

//     refund.status = "REJECTED";
//     refund.approvedBy = userId;
//     refund.approvedAt = new Date();
//     refund.notes = notes || refund.notes;

//     await refund.save();

//     return refund;
// };


// // =====================================================
// // READ
// // =====================================================

// export const getRefundService = async (id) => {

//     const refund = await getRefundByIdDB(id);

//     if (!refund) {
//         throw new Error("Refund not found");
//     }

//     return refund;
// };

// export const getOrderRefundsService = async (orderId) =>
//     await getRefundsByOrderDB(orderId);

// export const getAllRefundsService = async () =>
//     await getAllRefundsDB();


// // =====================================================
// // AUTO REFUND (Flipkart jaisa) - return COMPLETED hote hi
// // =====================================================
// //
// // Rules:
// //  - Original payment Razorpay se hua ho  -> auto refund possible
// //  - COD / manual payment                 -> auto nahi, admin "Initiate Refund" karega
// //  - Item eligible = condition GOOD, ya customer ki reason seller-fault
// //    (WRONG_PRODUCT / DAMAGED / DEFECTIVE)
// //  - Saare items eligible  -> approve + process turant
// //  - Kuch items eligible nahi -> refund REQUESTED bana rahega (admin review)
// //
// // Kabhi throw nahi karta: return completion is wajah se fail nahi honi chahiye.

// const SELLER_FAULT_REASONS = ["WRONG_PRODUCT", "DAMAGED", "DEFECTIVE"];

// export const autoRefundForReturn = async (returnId, userId) => {

//     try {

//         const ret = await Return.findOne({
//             _id: returnId,
//             isDeleted: false
//         });

//         if (!ret || ret.status !== "COMPLETED") {
//             return { status: "SKIPPED", message: "Return not completed" };
//         }

//         const existing = await Refund.findOne({
//             returnRequest: ret._id,
//             status: { $in: ACTIVE_REFUND_STATUSES }
//         });

//         if (existing) {
//             return { status: "SKIPPED", message: "Refund already exists" };
//         }

//         const payment = await Payment.findOne({
//             referenceId: ret.order,
//             paymentStatus: "PAID"
//         }).sort({ createdAt: -1 });

//         if (!payment || !getGatewayPaymentId(payment)) {
//             return {
//                 status: "MANUAL_NEEDED",
//                 message: "Not a Razorpay payment - initiate refund manually"
//             };
//         }

//         const eligibleItems = ret.items.filter(
//             (item) =>
//                 item.condition === "GOOD" ||
//                 SELLER_FAULT_REASONS.includes(item.reason)
//         );

//         if (eligibleItems.length === 0) {
//             return {
//                 status: "MANUAL_NEEDED",
//                 message: "No item eligible for auto refund"
//             };
//         }

//         const eligibleTotal = eligibleItems.reduce(
//             (sum, item) => sum + Number(item.price) * Number(item.quantity),
//             0
//         );

//         const refund = await createRefundService(
//             {
//                 returnId: ret._id,
//                 paymentId: payment._id,
//                 refundAmount: eligibleTotal,
//                 refundMethod: "RAZORPAY",
//                 reason: `Auto refund for return ${ret.returnNumber}`
//             },
//             userId
//         );

//         // Kuch item eligible nahi -> admin review
//         if (eligibleItems.length !== ret.items.length) {
//             return { status: "REVIEW_NEEDED", refund };
//         }

//         await approveRefundService(refund._id, userId);

//         try {
//             const done = await processRefundService(refund._id, userId);
//             return { status: "REFUNDED", refund: done };
//         } catch (error) {
//             // Gateway fail -> refund APPROVED rehta hai, admin "Process Refund" se retry
//             console.error(
//                 `[AUTO REFUND] gateway failed for ${ret.returnNumber}:`,
//                 error.message
//             );
//             return { status: "APPROVED_PENDING", error: error.message };
//         }

//     } catch (error) {

//         console.error("[AUTO REFUND] failed:", error.message);

//         return { status: "ERROR", error: error.message };
//     }
// };


import mongoose from "mongoose";
import Razorpay from "razorpay";

import Refund from "./refund.model.js";
import Order from "../orders/order.model.js";
import Payment from "../payments/payment.model.js";
// NOTE: folder ka naam apne project ke hisaab se adjust karo (returns / return)
import Return from "../return/return.model.js";

import {
    createRefundDB,
    getRefundByIdDB,
    getRefundsByOrderDB,
    getAllRefundsDB
} from "./refund.repository.js";


// =====================================================
// HELPERS
// =====================================================

const ACTIVE_REFUND_STATUSES = [
    "REQUESTED",
    "APPROVED",
    "PROCESSING",
    "COMPLETED"
];

// Same check jo return.service.js me hai (local Mongo standalone ho to transaction skip)
const supportsTransactions = () =>
    mongoose.connection?.client?.topology?.description?.type?.includes(
        "ReplicaSet"
    );

// Agar payments module me already Razorpay instance hai to wahi import kar lo
let razorpayInstance = null;

const getRazorpay = () => {
    if (!razorpayInstance) {
        razorpayInstance = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET
        });
    }
    return razorpayInstance;
};

// Payment model me Razorpay ka payment id (pay_xxx) jis field me save hota hai,
// wo yaha add kar do.
const getGatewayPaymentId = (payment) =>
    payment?.gatewayPaymentId ||
    payment?.razorpayPaymentId ||
    payment?.razorpay_payment_id ||
    payment?.transactionId ||
    null;

const generateRefundNumber = () =>
    `REF${Date.now().toString().slice(-8)}${Math.floor(
        100 + Math.random() * 900
    )}`;


// =====================================================
// CREATE REFUND REQUEST (from a COMPLETED return)
// =====================================================

export const createRefundService = async (data, userId) => {

    const {
        returnId,
        paymentId,
        refundAmount,
        refundMethod,
        reason,
        notes = "",
        upiId = "",
        bankDetails = {}
    } = data;

    if (!returnId) {
        throw new Error("Return ID is required");
    }

    // -------------------------------------------------
    // RETURN VALIDATION
    // -------------------------------------------------

    const returnRequest = await Return.findOne({
        _id: returnId,
        isDeleted: false
    });

    if (!returnRequest) {
        throw new Error("Return request not found");
    }

    if (returnRequest.status !== "COMPLETED") {
        throw new Error(
            "Refund can only be initiated after the return is completed"
        );
    }

    // Ek return ka ek hi active refund
    const existing = await Refund.findOne({
        returnRequest: returnRequest._id,
        status: { $in: ACTIVE_REFUND_STATUSES }
    });

    if (existing) {
        throw new Error(
            `Refund ${existing.refundNumber} already exists for this return`
        );
    }

    // -------------------------------------------------
    // ORDER + PAYMENT
    // -------------------------------------------------

    const order = await Order.findById(returnRequest.order);

    if (!order) {
        throw new Error("Order not found");
    }

    const payment = paymentId
        ? await Payment.findById(paymentId)
        : await Payment.findOne({
            referenceId: order._id,
            paymentStatus: "PAID"
        }).sort({ createdAt: -1 });

    if (!payment) {
        throw new Error("No paid payment found for this order");
    }

    if (payment.referenceId.toString() !== order._id.toString()) {
        throw new Error("Payment does not belong to this order");
    }

    if (payment.paymentStatus !== "PAID") {
        throw new Error("Only paid payment can be refunded");
    }

    // -------------------------------------------------
    // ITEMS + AMOUNT
    // -------------------------------------------------

    const refundItems = returnRequest.items.map((item) => ({
        product: item.product,
        title: item.title,
        quantity: item.quantity,
        refundAmount: Number(item.price) * Number(item.quantity),
        condition:
            item.condition === "PENDING" ? "GOOD" : item.condition
    }));

    const itemsTotal = refundItems.reduce(
        (sum, item) => sum + item.refundAmount,
        0
    );

    const requestedRefund =
        refundAmount === undefined || refundAmount === ""
            ? itemsTotal
            : Number(refundAmount);

    const refundableAmount =
        Number(payment.amount) - Number(payment.refundedAmount || 0);

    if (!requestedRefund || requestedRefund <= 0) {
        throw new Error("Refund amount must be greater than 0");
    }

    if (requestedRefund > itemsTotal) {
        throw new Error(
            `Refund cannot exceed returned items value (₹${itemsTotal})`
        );
    }

    if (requestedRefund > refundableAmount) {
        throw new Error(
            `Maximum refundable amount is ₹${refundableAmount}`
        );
    }

    // -------------------------------------------------
    // METHOD VALIDATION
    // -------------------------------------------------

    const validMethods = ["CASH", "BANK", "UPI", "RAZORPAY"];

    if (!validMethods.includes(refundMethod)) {
        throw new Error("Invalid refund method");
    }

    if (refundMethod === "RAZORPAY" && !getGatewayPaymentId(payment)) {
        throw new Error(
            "This payment was not made via Razorpay - choose BANK / UPI / CASH"
        );
    }

    if (refundMethod === "UPI" && !String(upiId).trim()) {
        throw new Error("UPI ID is required for UPI refund");
    }

    if (
        refundMethod === "BANK" &&
        (!bankDetails?.accountHolderName ||
            !bankDetails?.accountNumber ||
            !bankDetails?.ifscCode)
    ) {
        throw new Error("Bank details are required for BANK refund");
    }

    // -------------------------------------------------
    // CREATE
    // -------------------------------------------------

    return await createRefundDB({
        refundNumber: generateRefundNumber(),
        order: order._id,
        user: order.user,
        payment: payment._id,
        returnRequest: returnRequest._id,
        refundAmount: requestedRefund,
        refundMethod,
        reason:
            reason || `Return ${returnRequest.returnNumber} completed`,
        items: refundItems,
        requestedBy: userId,
        notes,
        upiId: refundMethod === "UPI" ? String(upiId).trim() : "",
        bankDetails: refundMethod === "BANK" ? bankDetails : undefined
    });
};


// =====================================================
// APPROVE REFUND
// =====================================================

export const approveRefundService = async (refundId, userId) => {

    // Atomic: sirf REQUESTED wala hi APPROVED hoga
    const refund = await Refund.findOneAndUpdate(
        { _id: refundId, status: "REQUESTED" },
        {
            status: "APPROVED",
            approvedBy: userId,
            approvedAt: new Date()
        },
        { new: true }
    );

    if (!refund) {
        throw new Error("Only requested refund can be approved");
    }

    return refund;
};


// =====================================================
// PROCESS REFUND (actual paisa wapas)
// =====================================================
//
// Flow:
//   1. APPROVED -> PROCESSING (atomic lock, double click safe)
//   2. RAZORPAY: gateway ko refund API call
//      BANK/UPI/CASH: admin ne manually bhej diya, reference save
//   3. Payment + Order + Refund update (COMPLETED)
//
// Gateway fail hua -> status wapas APPROVED, admin retry kar sakta hai.

export const processRefundService = async (
    refundId,
    userId,
    { transactionReference = "" } = {}
) => {

    // ---------------- 1. LOCK ----------------
    const refund = await Refund.findOneAndUpdate(
        { _id: refundId, status: "APPROVED" },
        { status: "PROCESSING", processedBy: userId },
        { new: true }
    );

    if (!refund) {
        throw new Error(
            "Refund must be APPROVED (or it is already being processed)"
        );
    }

    // ---------------- 2. MONEY MOVEMENT ----------------
    try {

        const payment = await Payment.findById(refund.payment);

        if (!payment) {
            throw new Error("Payment not found");
        }

        const remaining =
            Number(payment.amount) - Number(payment.refundedAmount || 0);

        if (Number(refund.refundAmount) > remaining) {
            throw new Error("Refund amount exceeds remaining payment amount");
        }

        let gatewayData = {};

        if (refund.refundMethod === "RAZORPAY") {

            const rzpPaymentId = getGatewayPaymentId(payment);

            if (!rzpPaymentId) {
                throw new Error("Razorpay payment id missing on payment");
            }

            const rzpRefund = await getRazorpay().payments.refund(
                rzpPaymentId,
                {
                    amount: Math.round(Number(refund.refundAmount) * 100), // paise
                    speed: "normal",
                    receipt: refund.refundNumber,
                    notes: {
                        refundId: String(refund._id),
                        orderId: String(refund.order)
                    }
                }
            );

            gatewayData = {
                gatewayRefundId: rzpRefund.id,
                gatewayResponse: rzpRefund
            };

        } else {

            if (
                ["BANK", "UPI"].includes(refund.refundMethod) &&
                !String(transactionReference).trim()
            ) {
                throw new Error(
                    "Transaction reference / UTR is required for manual refund"
                );
            }

            gatewayData = {
                transactionReference: String(transactionReference).trim()
            };
        }

        // Paisa ja chuka hai -> turant save karo, taaki DB step fail ho
        // to bhi gateway refund id hamare paas rahe.
        await Refund.updateOne({ _id: refund._id }, gatewayData);

    } catch (error) {

        // Paisa nahi gaya -> retry allow
        await Refund.updateOne(
            { _id: refund._id },
            { status: "APPROVED", processedBy: null }
        );

        throw error;
    }

    // ---------------- 3. BOOKKEEPING ----------------
    const session = supportsTransactions()
        ? await mongoose.startSession()
        : null;

    try {

        if (session) session.startTransaction();

        const saveOpts = session ? { session } : {};

        const payment = await Payment.findById(refund.payment).session(session);
        const order = await Order.findById(refund.order).session(session);
        const freshRefund = await Refund.findById(refund._id).session(session);

        if (!payment || !order || !freshRefund) {
            throw new Error("Payment / Order / Refund missing during finalize");
        }

        const newRefunded =
            Number(payment.refundedAmount || 0) +
            Number(freshRefund.refundAmount);

        payment.refundedAmount = newRefunded;
        payment.refundReason = freshRefund.reason;
        payment.refundedAt = new Date();

        const fullyRefunded = newRefunded >= Number(payment.amount);

        if (fullyRefunded) {
            payment.paymentStatus = "REFUNDED";
        }

        order.paymentStatus = fullyRefunded
            ? "REFUNDED"
            : "PARTIALLY_REFUNDED";

        freshRefund.status = "COMPLETED";
        freshRefund.processedBy = userId;
        freshRefund.processedAt = new Date();

        await payment.save(saveOpts);
        await order.save(saveOpts);
        await freshRefund.save(saveOpts);

        if (session) await session.commitTransaction();

        return freshRefund;

    } catch (error) {

        if (session) await session.abortTransaction();

        console.error(
            `[REFUND ${refund.refundNumber}] money sent but DB finalize failed:`,
            error
        );

        throw new Error(
            "Refund was sent but saving failed. Refund is kept in PROCESSING - contact developer. " +
            error.message
        );

    } finally {

        if (session) await session.endSession();
    }
};


// =====================================================
// REJECT REFUND
// =====================================================

export const rejectRefundService = async (
    refundId,
    userId,
    notes = ""
) => {

    const refund = await Refund.findOne({
        _id: refundId,
        status: "REQUESTED"
    });

    if (!refund) {
        throw new Error("Only requested refund can be rejected");
    }

    refund.status = "REJECTED";
    refund.approvedBy = userId;
    refund.approvedAt = new Date();
    refund.notes = notes || refund.notes;

    await refund.save();

    return refund;
};


// =====================================================
// READ
// =====================================================

export const getRefundService = async (id) => {

    const refund = await getRefundByIdDB(id);

    if (!refund) {
        throw new Error("Refund not found");
    }

    return refund;
};

export const getOrderRefundsService = async (orderId) =>
    await getRefundsByOrderDB(orderId);

export const getAllRefundsService = async () =>
    await getAllRefundsDB();


// =====================================================
// AUTO REFUND (Flipkart jaisa) - return COMPLETED hote hi
// =====================================================
//
// Rules:
//  - Original payment Razorpay se hua ho  -> auto refund possible
//  - COD / manual payment                 -> auto nahi, admin "Initiate Refund" karega
//  - Item eligible = condition GOOD, ya customer ki reason seller-fault
//    (WRONG_PRODUCT / DAMAGED / DEFECTIVE)
//  - Saare items eligible  -> approve + process turant
//  - Kuch items eligible nahi -> refund REQUESTED bana rahega (admin review)
//
// Kabhi throw nahi karta: return completion is wajah se fail nahi honi chahiye.

const SELLER_FAULT_REASONS = ["WRONG_PRODUCT", "DAMAGED", "DEFECTIVE"];

export const autoRefundForReturn = async (returnId, userId) => {

    try {

        const ret = await Return.findOne({
            _id: returnId,
            isDeleted: false
        });

        if (!ret || ret.status !== "COMPLETED") {
            return { status: "SKIPPED", message: "Return not completed" };
        }

        const existing = await Refund.findOne({
            returnRequest: ret._id,
            status: { $in: ACTIVE_REFUND_STATUSES }
        });

        if (existing) {
            return { status: "SKIPPED", message: "Refund already exists" };
        }

        const payment = await Payment.findOne({
            referenceId: ret.order,
            paymentStatus: "PAID"
        }).sort({ createdAt: -1 });

        if (!payment || !getGatewayPaymentId(payment)) {
            return {
                status: "MANUAL_NEEDED",
                message: "Not a Razorpay payment - initiate refund manually"
            };
        }

        const eligibleItems = ret.items.filter(
            (item) =>
                item.condition === "GOOD" ||
                SELLER_FAULT_REASONS.includes(item.reason)
        );

        if (eligibleItems.length === 0) {
            return {
                status: "MANUAL_NEEDED",
                message: "No item eligible for auto refund"
            };
        }

        const eligibleTotal = eligibleItems.reduce(
            (sum, item) => sum + Number(item.price) * Number(item.quantity),
            0
        );

        const refund = await createRefundService(
            {
                returnId: ret._id,
                paymentId: payment._id,
                refundAmount: eligibleTotal,
                refundMethod: "RAZORPAY",
                reason: `Auto refund for return ${ret.returnNumber}`
            },
            userId
        );

        // Kuch item eligible nahi -> admin review
        if (eligibleItems.length !== ret.items.length) {
            return { status: "REVIEW_NEEDED", refund };
        }

        await approveRefundService(refund._id, userId);

        try {
            const done = await processRefundService(refund._id, userId);
            return { status: "REFUNDED", refund: done };
        } catch (error) {
            // Gateway fail -> refund APPROVED rehta hai, admin "Process Refund" se retry
            console.error(
                `[AUTO REFUND] gateway failed for ${ret.returnNumber}:`,
                error.message
            );
            return { status: "APPROVED_PENDING", error: error.message };
        }

    } catch (error) {

        console.error("[AUTO REFUND] failed:", error.message);

        return { status: "ERROR", error: error.message };
    }
};