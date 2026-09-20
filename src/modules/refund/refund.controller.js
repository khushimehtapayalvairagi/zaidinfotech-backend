import {
    createRefundService,
    approveRefundService,
    processRefundService,
    rejectRefundService,
    getRefundService,
    getOrderRefundsService,
    getAllRefundsService
} from "./refund.service.js";


// =====================================================
// CREATE REFUND REQUEST
// =====================================================

export const createRefund = async (
    req,
    res
) => {

    try {

        const refund =
            await createRefundService(
                req.body,
                req.user.id
            );


        res.status(201).json({

            success: true,

            message:
                "Refund request created successfully",

            data: refund

        });

    } catch (error) {

        res.status(400).json({

            success: false,

            message:
                error.message

        });

    }

};


// =====================================================
// APPROVE REFUND
// =====================================================

export const approveRefund = async (
    req,
    res
) => {

    try {

        const refund =
            await approveRefundService(
                req.params.id,
                req.user.id
            );


        res.status(200).json({

            success: true,

            message:
                "Refund approved successfully",

            data: refund

        });

    } catch (error) {

        res.status(400).json({

            success: false,

            message:
                error.message

        });

    }

};


// =====================================================
// PROCESS REFUND
// =====================================================

export const processRefund = async (
    req,
    res
) => {

    try {

        const refund =
            await processRefundService(
                req.params.id,
                req.user.id
            );


        res.status(200).json({

            success: true,

            message:
                "Refund processed successfully",

            data: refund

        });

    } catch (error) {

        res.status(400).json({

            success: false,

            message:
                error.message

        });

    }

};


// =====================================================
// REJECT REFUND
// =====================================================

export const rejectRefund = async (
    req,
    res
) => {

    try {

        const refund =
            await rejectRefundService(
                req.params.id,
                req.user.id,
                req.body.notes
            );


        res.status(200).json({

            success: true,

            message:
                "Refund rejected successfully",

            data: refund

        });

    } catch (error) {

        res.status(400).json({

            success: false,

            message:
                error.message

        });

    }

};


// =====================================================
// GET REFUND
// =====================================================

export const getRefund = async (
    req,
    res
) => {

    try {

        const refund =
            await getRefundService(
                req.params.id
            );


        res.status(200).json({

            success: true,

            data: refund

        });

    } catch (error) {

        res.status(404).json({

            success: false,

            message:
                error.message

        });

    }

};


// =====================================================
// GET ORDER REFUNDS
// =====================================================

export const getOrderRefunds = async (
    req,
    res
) => {

    try {

        const refunds =
            await getOrderRefundsService(
                req.params.orderId
            );


        res.status(200).json({

            success: true,

            data: refunds

        });

    } catch (error) {

        res.status(400).json({

            success: false,

            message:
                error.message

        });

    }

};


// =====================================================
// GET ALL REFUNDS
// =====================================================

export const getAllRefunds = async (
    req,
    res
) => {

    try {

        const refunds =
            await getAllRefundsService();


        res.status(200).json({

            success: true,

            data: refunds

        });

    } catch (error) {

        res.status(400).json({

            success: false,

            message:
                error.message

        });

    }

};