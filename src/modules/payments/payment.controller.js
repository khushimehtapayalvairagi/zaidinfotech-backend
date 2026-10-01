import * as paymentService
    from "./payment.service.js";

import Order
    from "../orders/order.model.js";


// =======================================
// CREATE RAZORPAY ORDER
// =======================================
// =======================================
// CREATE RAZORPAY ORDER
// =======================================

export const createRazorpayOrder = async (
    req,
    res
) => {

    try {

        const {
            orderId,
            amount
        } = req.body;


        console.log(
            "======================================"
        );

        console.log(
            "CREATE RAZORPAY ORDER REQUEST"
        );

        console.log(
            "ORDER ID:",
            orderId
        );

        console.log(
            "REQUEST AMOUNT:",
            amount
        );

        console.log(
            "======================================"
        );


        if (!orderId) {

            return res.status(400).json({

                success: false,

                message:
                    "Order ID is required"

            });

        }


        // -----------------------------------
        // FIND ORDER
        // -----------------------------------

        const order =
            await Order.findById(
                orderId
            );


        if (!order) {

            return res.status(404).json({

                success: false,

                message:
                    "Order not found"

            });

        }


        // -----------------------------------
        // VALIDATE AMOUNT
        // -----------------------------------

        const requestedAmount =
            Number(amount);


        if (
            !Number.isFinite(
                requestedAmount
            ) ||
            requestedAmount <= 0
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Valid payment amount is required"

            });

        }


        const finalAmount =
            Math.round(
                requestedAmount * 100
            ) / 100;


        console.log(
            "ORDER DATABASE TOTAL:",
            order.totalAmount
        );

        console.log(
            "FINAL RAZORPAY AMOUNT:",
            finalAmount
        );


        // -----------------------------------
        // CREATE RAZORPAY ORDER
        // -----------------------------------

        const razorpayOrder =
            await paymentService.createRazorpayPaymentOrder(

                finalAmount,

                `order_${order._id}`

            );


        console.log(
            "RAZORPAY ORDER CREATED =",
            razorpayOrder
        );


        // -----------------------------------
        // RESPONSE
        // -----------------------------------

        return res.status(200).json({

            success: true,

            message:
                "Razorpay order created successfully",

            order:
                razorpayOrder,

            razorpayOrderId:
                razorpayOrder.id,

            amount:
                razorpayOrder.amount,

            currency:
                razorpayOrder.currency,

            paymentAmount:
                finalAmount

        });

    }

    catch (error) {

        console.error(
            "CREATE RAZORPAY ORDER ERROR =",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                error.message ||
                "Unable to create Razorpay order"

        });

    }

};




// =======================================
// VERIFY RAZORPAY PAYMENT
// =======================================

export const verifyRazorpayPaymentController =
    async (
        req,
        res
    ) => {

        try {

            const {

                paymentId,

                razorpayOrderId,

                razorpayPaymentId,

                razorpaySignature

            } = req.body;

            console.log(
                "VERIFY PAYMENT REQUEST =",
                req.body
            );

            if (!paymentId) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Payment ID is required"

                });

            }

            if (!razorpayOrderId) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Razorpay Order ID is required"

                });

            }

            if (!razorpayPaymentId) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Razorpay Payment ID is required"

                });

            }

            if (!razorpaySignature) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Razorpay Signature is required"

                });

            }

            const payment =
                await paymentService.verifyRazorpayPaymentService({

                    paymentId,

                    razorpayOrderId,

                    razorpayPaymentId,

                    razorpaySignature

                });

            return res.status(200).json({

                success: true,

                message:
                    "Payment verified successfully",

                payment

            });

        }

        catch (error) {

            console.error(
                "VERIFY RAZORPAY PAYMENT ERROR =",
                error
            );

            return res.status(400).json({

                success: false,

                message:
                    error.message

            });

        }

    };


// =======================================
// CREATE PAYMENT
// =======================================

// =======================================
// CREATE PAYMENT
// =======================================

export const createPayment = async (
    req,
    res
) => {

    try {

        const userId =
            req.user?._id;


        if (!userId) {

            return res.status(401).json({

                success: false,

                message:
                    "Authenticated user not found"

            });

        }


        const paymentData = {

            ...req.body,

            user: userId

        };


        console.log(
            "======================================"
        );

        console.log(
            "CREATE PAYMENT REQUEST"
        );

        console.log(
            "USER:",
            userId
        );

        console.log(
            "BODY:",
            req.body
        );

        console.log(
            "FINAL PAYMENT DATA:",
            paymentData
        );

        console.log(
            "======================================"
        );


        const payment =
            await paymentService.createPayment(
                paymentData
            );


        return res.status(201).json({

            success: true,

            message:
                "Payment created successfully",

            payment

        });

    }

    catch (error) {

        console.error(
            "======================================"
        );

        console.error(
            "CREATE PAYMENT ERROR"
        );

        console.error(
            error
        );

        console.error(
            "MESSAGE:",
            error.message
        );

        console.error(
            "======================================"
        );


        return res.status(400).json({

            success: false,

            message:
                error.message ||
                "Unable to create payment"

        });

    }

};

// =======================================
// GET PAYMENT BY ID
// =======================================

export const getPaymentById = async (
    req,
    res
) => {

    try {

        const {
            id
        } = req.params;

        const payment =
            await paymentService.getPaymentById(
                id
            );

        return res.status(200).json({

            success: true,

            payment

        });

    }

    catch (error) {

        return res.status(404).json({

            success: false,

            message:
                error.message

        });

    }

};


// =======================================
// GET MY PAYMENTS
// =======================================

export const getMyPayments = async (
    req,
    res
) => {

    try {

        const userId =
            req.user._id;

        const payments =
            await paymentService.getUserPayments(
                userId
            );

        return res.status(200).json({

            success: true,

            payments

        });

    }

    catch (error) {

        return res.status(400).json({

            success: false,

            message:
                error.message

        });

    }

};


// =======================================
// GET ALL PAYMENTS
// =======================================

export const getAllPayments = async (
    req,
    res
) => {

    try {

        const payments =
            await paymentService.getAllPayments();

        return res.status(200).json({

            success: true,

            payments

        });

    }

    catch (error) {

        return res.status(400).json({

            success: false,

            message:
                error.message

        });

    }

};


// =======================================
// PAYMENT SUCCESS
// =======================================

export const paymentSuccess = async (
    req,
    res
) => {

    try {

        const {
            id
        } = req.params;

        const {

            transactionId,

            gatewayPaymentId,

            gateway,

            gatewayResponse

        } = req.body;

        const payment =
            await paymentService.markPaymentSuccess(

                id,

                transactionId,

                gatewayPaymentId,

                gateway,

                gatewayResponse

            );

        return res.status(200).json({

            success: true,

            message:
                "Payment successful",

            payment

        });

    }

    catch (error) {

        return res.status(400).json({

            success: false,

            message:
                error.message

        });

    }

};


// =======================================
// PAYMENT FAILED
// =======================================

export const paymentFailed = async (
    req,
    res
) => {

    try {

        const {
            id
        } = req.params;

        const {
            failureReason
        } = req.body;

        const payment =
            await paymentService.markPaymentFailed(

                id,

                failureReason

            );

        return res.status(200).json({

            success: true,

            message:
                "Payment failed",

            payment

        });

    }

    catch (error) {

        return res.status(400).json({

            success: false,

            message:
                error.message

        });

    }

};


// =======================================
// REFUND PAYMENT
// =======================================

export const refundPayment = async (
    req,
    res
) => {

    try {

        const {
            id
        } = req.params;

        const {

            refundReason,

            refundedAmount

        } = req.body;

        const payment =
            await paymentService.refundPayment(

                id,

                refundReason,

                refundedAmount

            );

        return res.status(200).json({

            success: true,

            message:
                "Payment refunded",

            payment

        });

    }

    catch (error) {

        return res.status(400).json({

            success: false,

            message:
                error.message

        });

    }

};