import mongoose from "mongoose";

import Refund from "./refund.model.js";

import Order from "../orders/order.model.js";

import Payment from "../payments/payment.model.js";

import Inventory from "../inventory/inventory.model.js";

import {
    createRefundDB,
    getRefundByIdDB,
    getRefundsByOrderDB,
    getAllRefundsDB,
    updateRefundDB
} from "./refund.repository.js";


// =====================================================
// GENERATE REFUND NUMBER
// =====================================================

const generateRefundNumber = async () => {

    const count = await Refund.countDocuments();

    const nextNumber = count + 1;

    return `REF${String(nextNumber).padStart(6, "0")}`;

};


// =====================================================
// CREATE REFUND REQUEST
// =====================================================

export const createRefundService = async (
    data,
    userId
) => {

    const {
        orderId,
        paymentId,
        refundAmount,
        refundMethod,
        reason,
        items = [],
        notes = ""
    } = data;


    // =================================================
    // VALIDATE ORDER
    // =================================================

    const order = await Order.findById(
        orderId
    );


    if (!order) {

        throw new Error(
            "Order not found"
        );

    }


    // =================================================
    // VALIDATE PAYMENT
    // =================================================

    const payment = await Payment.findById(
        paymentId
    );


    if (!payment) {

        throw new Error(
            "Payment not found"
        );

    }


    // =================================================
    // PAYMENT MUST BELONG TO ORDER
    // =================================================

    if (
        payment.referenceId.toString()
        !==
        order._id.toString()
    ) {

        throw new Error(
            "Payment does not belong to this order"
        );

    }


    // =================================================
    // PAYMENT MUST BE PAID
    // =================================================

    if (
        payment.paymentStatus !== "PAID"
    ) {

        throw new Error(
            "Only paid payment can be refunded"
        );

    }


    // =================================================
    // CALCULATE REMAINING REFUNDABLE
    // =================================================

    const alreadyRefunded =
        Number(
            payment.refundedAmount || 0
        );


    const refundableAmount =
        Number(payment.amount)
        -
        alreadyRefunded;


    // =================================================
    // VALIDATE REFUND AMOUNT
    // =================================================

    const requestedRefund =
        Number(refundAmount);


    if (
        requestedRefund <= 0
    ) {

        throw new Error(
            "Refund amount must be greater than 0"
        );

    }


    if (
        requestedRefund > refundableAmount
    ) {

        throw new Error(
            `Maximum refundable amount is ₹${refundableAmount}`
        );

    }


    // =================================================
    // REFUND NUMBER
    // =================================================

    const refundNumber =
        await generateRefundNumber();


    // =================================================
    // CREATE REFUND REQUEST
    // =================================================

    const refund =
        await createRefundDB({

            refundNumber,

            order: order._id,

            user: order.user,

            payment: payment._id,

            refundAmount:
                requestedRefund,

            refundMethod,

            reason,

            items,

            requestedBy:
                userId,

            notes

        });


    return refund;

};


// =====================================================
// APPROVE REFUND
// =====================================================

export const approveRefundService = async (
    refundId,
    userId
) => {

    const refund =
        await Refund.findById(
            refundId
        );


    if (!refund) {

        throw new Error(
            "Refund not found"
        );

    }


    if (
        refund.status !==
        "REQUESTED"
    ) {

        throw new Error(
            "Only requested refund can be approved"
        );

    }


    refund.status =
        "APPROVED";

    refund.approvedBy =
        userId;

    refund.approvedAt =
        new Date();


    await refund.save();


    return refund;

};


// =====================================================
// PROCESS REFUND
// =====================================================

export const processRefundService = async (
    refundId,
    userId
) => {

    const session =
        await mongoose.startSession();


    session.startTransaction();


    try {

        // =============================================
        // GET REFUND
        // =============================================

        const refund =
            await Refund.findById(
                refundId
            )
            .session(session);


        if (!refund) {

            throw new Error(
                "Refund not found"
            );

        }


        if (
            refund.status !==
            "APPROVED"
        ) {

            throw new Error(
                "Refund must be approved first"
            );

        }


        // =============================================
        // PAYMENT
        // =============================================

        const payment =
            await Payment.findById(
                refund.payment
            )
            .session(session);


        if (!payment) {

            throw new Error(
                "Payment not found"
            );

        }


        // =============================================
        // CALCULATE REFUND
        // =============================================

        const oldRefunded =
            Number(
                payment.refundedAmount || 0
            );


        const newRefunded =
            oldRefunded
            +
            Number(
                refund.refundAmount
            );


        if (
            newRefunded >
            payment.amount
        ) {

            throw new Error(
                "Refund amount exceeds payment amount"
            );

        }


        // =============================================
        // UPDATE PAYMENT
        // =============================================

        payment.refundedAmount =
            newRefunded;


        payment.refundReason =
            refund.reason;


        payment.refundedAt =
            new Date();


        if (
            newRefunded >=
            payment.amount
        ) {

            payment.paymentStatus =
                "REFUNDED";

        }


        await payment.save({
            session
        });


        // =============================================
        // UPDATE ORDER
        // =============================================

        const order =
            await Order.findById(
                refund.order
            )
            .session(session);


        if (!order) {

            throw new Error(
                "Order not found"
            );

        }


        if (
            newRefunded >=
            payment.amount
        ) {

            order.paymentStatus =
                "REFUNDED";

        } else {

            order.paymentStatus =
                "PARTIALLY_REFUNDED";

        }


        await order.save({
            session
        });


        // =============================================
        // RETURN PRODUCT STOCK
        // =============================================

        for (
            const item
            of refund.items
        ) {

            if (
                item.condition ===
                "GOOD"
            ) {

                await Inventory.findOneAndUpdate(

                    {
                        product:
                            item.product
                    },

                    {
                        $inc: {
                            currentStock:
                                item.quantity
                        }
                    },

                    {
                        session
                    }

                );

            }

        }


        // =============================================
        // UPDATE REFUND
        // =============================================

        refund.status =
            "COMPLETED";

        refund.processedBy =
            userId;

        refund.processedAt =
            new Date();


        await refund.save({
            session
        });


        await session.commitTransaction();


        return refund;


    } catch (error) {

        await session.abortTransaction();

        throw error;

    } finally {

        await session.endSession();

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

    const refund =
        await Refund.findById(
            refundId
        );


    if (!refund) {

        throw new Error(
            "Refund not found"
        );

    }


    if (
        refund.status !==
        "REQUESTED"
    ) {

        throw new Error(
            "Only requested refund can be rejected"
        );

    }


    refund.status =
        "REJECTED";

    refund.approvedBy =
        userId;

    refund.approvedAt =
        new Date();

    refund.notes =
        notes || refund.notes;


    await refund.save();


    return refund;

};


// =====================================================
// GET REFUND
// =====================================================

export const getRefundService = async (
    id
) => {

    const refund =
        await getRefundByIdDB(
            id
        );


    if (!refund) {

        throw new Error(
            "Refund not found"
        );

    }


    return refund;

};


// =====================================================
// GET ORDER REFUNDS
// =====================================================

export const getOrderRefundsService = async (
    orderId
) => {

    return await getRefundsByOrderDB(
        orderId
    );

};


// =====================================================
// GET ALL REFUNDS
// =====================================================

export const getAllRefundsService = async () => {

    return await getAllRefundsDB();

};