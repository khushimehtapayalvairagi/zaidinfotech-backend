import * as paymentRepository from "./payment.repository.js";

import {
    PAYMENT_STATUS
} from "../../common/constants/paymentStatus.js";

import {
    createRazorpayOrder,
    verifyRazorpayPayment
} from "./razorpay.service.js";

import Order
    from "../orders/order.model.js";

import Repair from "../repair/repair.model.js";
import Rental from "../rental/rental.model.js";

// =======================================
// CREATE RAZORPAY ORDER
// =======================================

export const createRazorpayPaymentOrder = async (
    amount,
    receipt
) => {

    const razorpayOrder =
        await createRazorpayOrder({
            amount,
            receipt
        });

    return razorpayOrder;
};


// =======================================
// VERIFY RAZORPAY PAYMENT
// =======================================

export const verifyRazorpayPaymentService = async ({
    paymentId,
    razorpayOrderId,
    razorpayPaymentId,
    razorpaySignature
}) => {

    // ==========================================
    // 1. FIND PAYMENT
    // ==========================================

    const payment =
        await paymentRepository.getPaymentById(
            paymentId
        );

    if (!payment) {

        throw new Error(
            "Payment not found"
        );

    }


    // ==========================================
    // 2. VERIFY RAZORPAY SIGNATURE
    // ==========================================

    const isValid =
        verifyRazorpayPayment({

            razorpayOrderId,

            razorpayPaymentId,

            razorpaySignature

        });


    if (!isValid) {

        throw new Error(
            "Invalid Razorpay payment signature"
        );

    }


    console.log(
        "SIGNATURE VERIFY SUCCESS"
    );


    // ==========================================
    // 3. UPDATE PAYMENT = SUCCESS
    // ==========================================

    const updatedPayment =
        await paymentRepository.updatePaymentStatus(

            paymentId,

            PAYMENT_STATUS.SUCCESS,

            razorpayPaymentId,

            razorpayPaymentId,

            "RAZORPAY",

            {

                razorpayOrderId,

                razorpayPaymentId,

                razorpaySignature

            },

            ""

        );


    console.log(
        "PAYMENT STATUS = SUCCESS"
    );


    // ==========================================
    // 4. GET ORDER ID
    // ==========================================

    const orderId =
        payment.referenceId;


    if (!orderId) {

        throw new Error(
            "Order ID not found in payment"
        );

    }


    // ==========================================
    // 5. FIND ORDER
    // ==========================================

    const order =
        await Order.findById(
            orderId
        );


    if (!order) {

        throw new Error(
            "Order not found"
        );

    }


    // ==========================================
    // 6. UPDATE ORDER = PAID
    // ==========================================

    order.paymentStatus = "PAID";

    order.paymentId =
        razorpayPaymentId;


    await order.save();


    console.log(
        "ORDER PAYMENT STATUS = PAID"
    );


    // ==========================================
    // 7. RETURN PAYMENT
    // ==========================================

    return updatedPayment;

};


// =======================================
// CREATE PAYMENT
// =======================================

// export const createPayment = async (
//     paymentData
// ) => {

//     paymentData.receiptNumber =
//         await generateReceiptNumber();

//     if (!paymentData.currency) {
//         paymentData.currency = "INR";
//     }

//     return await paymentRepository.createPayment(
//         paymentData
//     );
// };

export const createPayment = async (
    paymentData
) => {

    paymentData.receiptNumber =
        await generateReceiptNumber();

    if (!paymentData.currency) {
        paymentData.currency = "INR";
    }

    return await paymentRepository.createPayment(
        paymentData
    );
};

// =======================================
// GENERATE RECEIPT NUMBER
// =======================================

const generateReceiptNumber = async () => {

    const count =
        await paymentRepository.getPaymentCount();

    const nextNumber = count + 1;

    return `PAY${new Date().getFullYear()}${String(
        nextNumber
    ).padStart(6, "0")}`;
};


// =======================================
// GET PAYMENT BY ID
// =======================================

export const getPaymentById = async (
    paymentId
) => {

    const payment =
        await paymentRepository.getPaymentById(
            paymentId
        );

    if (!payment) {
        throw new Error(
            "Payment not found"
        );
    }

    return payment;
};



// =======================================
// GET PAYMENT BY REFERENCE
// =======================================

export const getPaymentByReference = async (
    paymentFor,
    referenceId
) => {

    return await paymentRepository.getPaymentByReference(
        paymentFor,
        referenceId
    );
};


// =======================================
// GET USER PAYMENTS
// =======================================

export const getUserPayments = async (
    userId
) => {

    return await paymentRepository.getUserPayments(
        userId
    );
};


// =======================================
// GET ALL PAYMENTS
// =======================================

export const getAllPayments = async () => {

    return await paymentRepository.getAllPayments();
};


// =======================================
// MARK PAYMENT SUCCESS
// =======================================

export const markPaymentSuccess = async (
    paymentId,
    transactionId,
    gatewayPaymentId,
    gateway,
    gatewayResponse
) => {

    const payment =
        await paymentRepository.getPaymentById(
            paymentId
        );

    if (!payment) {
        throw new Error(
            "Payment not found"
        );
    }

    return await paymentRepository.updatePaymentStatus(

        paymentId,

        PAYMENT_STATUS.SUCCESS,

        transactionId,

        gatewayPaymentId,

        gateway,

        gatewayResponse,

        ""
    );
};


// =======================================
// MARK PAYMENT FAILED
// =======================================

export const markPaymentFailed = async (
    paymentId,
    reason
) => {

    const payment =
        await paymentRepository.getPaymentById(
            paymentId
        );

    if (!payment) {
        throw new Error(
            "Payment not found"
        );
    }

    return await paymentRepository.updatePaymentFailed(
        paymentId,
        reason
    );
};


// =======================================
// REFUND PAYMENT
// =======================================

export const refundPayment = async (
    paymentId,
    refundReason,
    refundedAmount
) => {

    const payment =
        await paymentRepository.getPaymentById(
            paymentId
        );

    if (!payment) {
        throw new Error(
            "Payment not found"
        );
    }

    return await paymentRepository.updateRefundStatus(

        paymentId,

        PAYMENT_STATUS.REFUNDED,

        refundReason,

        refundedAmount
    );
};


// =======================================
// GET PAYMENT COUNT
// =======================================

export const getPaymentCount = async () => {

    return await paymentRepository.getPaymentCount();
};



// =====================================================
// DETERMINE SALE SOURCE
// =====================================================

const determineSaleSource = async (
    paymentFor,
    referenceId
) => {

    // -------------------------------------------------
    // ORDER
    // -------------------------------------------------

    if (paymentFor === "ORDER") {

        const order =
            await Order.findById(referenceId)
                .select("orderSource source");

        if (!order) {
            throw new Error("Order not found");
        }

        // Different possible existing field names
        const source =
            order.orderSource ||
            order.source;

        if (
            String(source || "").toUpperCase() === "WALK_IN" ||
            String(source || "").toUpperCase() === "WALKIN"
        ) {
            return "WALK_IN";
        }

        return "ONLINE";
    }


    // -------------------------------------------------
    // REPAIR
    // -------------------------------------------------

    if (paymentFor === "REPAIR") {

        const repair =
            await Repair.findById(referenceId)
                .select("repairSource source");

        if (!repair) {
            throw new Error("Repair not found");
        }

        const source =
            repair.repairSource ||
            repair.source;

        if (
            String(source || "").toUpperCase() === "WALK_IN" ||
            String(source || "").toUpperCase() === "WALKIN"
        ) {
            return "WALK_IN";
        }

        return "ONLINE";
    }


    // -------------------------------------------------
    // RENTAL
    // -------------------------------------------------

    if (paymentFor === "RENTAL") {

        const rental =
            await Rental.findById(referenceId)
                .select("rentalSource source");

        if (!rental) {
            throw new Error("Rental not found");
        }

        const source =
            rental.rentalSource ||
            rental.source;

        if (
            String(source || "").toUpperCase() === "WALK_IN" ||
            String(source || "").toUpperCase() === "WALKIN"
        ) {
            return "WALK_IN";
        }

        return "ONLINE";
    }


    // -------------------------------------------------
    // DEFAULT
    // -------------------------------------------------

    return "ONLINE";
};