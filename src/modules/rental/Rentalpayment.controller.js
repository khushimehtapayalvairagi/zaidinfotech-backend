import {
    getRentalPaymentScheduleService,
    recordRentalInstallmentPaymentService,
    getDueInstallmentsService,
    getReturnPreviewService
} from "./Rentalpayment.service.js";


// =====================================================
// GET MONTHLY RENT SCHEDULE OF A RENTAL
// =====================================================

export const getRentalPaymentScheduleController = async (req, res) => {

    try {

        const data = await getRentalPaymentScheduleService(
            req.params.id
        );

        return res.status(200).json({
            success: true,
            data
        });

    } catch (error) {

        console.error("GET RENT SCHEDULE ERROR:", error);

        return res.status(404).json({
            success: false,
            message: error.message || "Failed to load rent schedule"
        });
    }
};


// =====================================================
// RECEIVE RENT FOR ONE MONTH (INSTALLMENT)
// =====================================================

export const recordRentalInstallmentPaymentController = async (req, res) => {

    try {

        const installment = await recordRentalInstallmentPaymentService(
            req.params.paymentId,
            req.body || {},
            req.user?._id
        );

        return res.status(200).json({
            success: true,
            message: "Rent payment recorded successfully",
            data: installment
        });

    } catch (error) {

        console.error("RECORD RENT PAYMENT ERROR:", error);

        return res.status(400).json({
            success: false,
            message: error.message || "Failed to record rent payment"
        });
    }
};


// =====================================================
// OVERDUE / UPCOMING INSTALLMENTS
// GET /payments/due?scope=overdue|upcoming
// =====================================================

export const getDueInstallmentsController = async (req, res) => {

    try {

        const scope =
            req.query.scope === "upcoming" ? "upcoming" : "overdue";

        const data = await getDueInstallmentsService(scope);

        return res.status(200).json({
            success: true,
            data
        });

    } catch (error) {

        console.error("GET DUE INSTALLMENTS ERROR:", error);

        return res.status(500).json({
            success: false,
            message: error.message || "Failed to load due installments"
        });
    }
};


// =====================================================
// RETURN PREVIEW (pending rent + held deposit)
// =====================================================

export const getReturnPreviewController = async (req, res) => {

    try {

        const data = await getReturnPreviewService(req.params.id);

        return res.status(200).json({
            success: true,
            data
        });

    } catch (error) {

        console.error("GET RETURN PREVIEW ERROR:", error);

        return res.status(404).json({
            success: false,
            message: error.message || "Failed to load return preview"
        });
    }
};