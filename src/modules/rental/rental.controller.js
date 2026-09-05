import {
    createRentalService,
    getMyRentalsService,
    getRentalService,
    getAllRentalsService,
    approveRentalService,
    rejectRentalService,
    requestReturnService,
    markRentalReturnedService
} from "./rental.service.js";


// =====================================================
// CREATE RENTAL
// =====================================================

export const createRentalController = async (
    req,
    res
) => {

    try {

        const rental =
            await createRentalService(
                req.body,
                req.user._id
            );

        return res.status(201).json({

            success: true,

            message:
                "Rental request created successfully",

            data: rental

        });

    } catch (error) {

        return res.status(400).json({

            success: false,

            message: error.message

        });

    }

};


// =====================================================
// MY RENTALS
// =====================================================

export const getMyRentalsController = async (
    req,
    res
) => {

    try {

        const rentals =
            await getMyRentalsService(
                req.user._id
            );

        return res.status(200).json({

            success: true,

            data: rentals

        });

    } catch (error) {

        return res.status(500).json({

            success: false,

            message: error.message

        });

    }

};


// =====================================================
// SINGLE RENTAL
// =====================================================

export const getRentalController = async (
    req,
    res
) => {

    try {

        const rental =
            await getRentalService(
                req.params.id
            );

        return res.status(200).json({

            success: true,

            data: rental

        });

    } catch (error) {

        return res.status(404).json({

            success: false,

            message: error.message

        });

    }

};


// =====================================================
// ADMIN - ALL RENTALS
// =====================================================

export const getAllRentalsController = async (
    req,
    res
) => {

    try {

        const rentals =
            await getAllRentalsService();

        return res.status(200).json({

            success: true,

            data: rentals

        });

    } catch (error) {

        return res.status(500).json({

            success: false,

            message: error.message

        });

    }

};


// =====================================================
// ADMIN APPROVE
// =====================================================

export const approveRentalController = async (
    req,
    res
) => {

    try {

        const rental =
            await approveRentalService(
                req.params.id,
                req.user._id
            );

        return res.status(200).json({

            success: true,

            message:
                "Rental approved. Security deposit is pending.",

            data: rental

        });

    } catch (error) {

        return res.status(400).json({

            success: false,

            message: error.message

        });

    }

};


// =====================================================
// ADMIN REJECT
// =====================================================

export const rejectRentalController = async (
    req,
    res
) => {

    try {

        const rental =
            await rejectRentalService(
                req.params.id,
                req.body.reason
            );

        return res.status(200).json({

            success: true,

            message:
                "Rental rejected",

            data: rental

        });

    } catch (error) {

        return res.status(400).json({

            success: false,

            message: error.message

        });

    }

};


// =====================================================
// CUSTOMER RETURN REQUEST
// =====================================================

export const requestReturnController = async (
    req,
    res
) => {

    try {

        const rental =
            await requestReturnService(
                req.params.id,
                req.user._id
            );

        return res.status(200).json({

            success: true,

            message:
                "Return request submitted",

            data: rental

        });

    } catch (error) {

        return res.status(400).json({

            success: false,

            message: error.message

        });

    }

};


// =====================================================
// ADMIN MARK RETURNED
// =====================================================

export const markRentalReturnedController = async (
    req,
    res
) => {

    try {

        const rental =
            await markRentalReturnedService(
                req.params.id,
                req.body
            );

        return res.status(200).json({

            success: true,

            message:
                "Rental marked for settlement",

            data: rental

        });

    } catch (error) {

        return res.status(400).json({

            success: false,

            message: error.message

        });

    }

};