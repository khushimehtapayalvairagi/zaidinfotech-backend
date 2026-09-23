import {
    getMyRentalsService,
    getRentalService,
    getAllRentalsService,
    markRentalReturnedService,
    createWalkInRentalService,
    searchRentalsForReturnService,
    completeRentalSettlementService,
    markRentalDepositReceivedService
} from "./rental.service.js";


// =====================================================
// CREATE RENTAL
// CUSTOMER ONLINE RENTAL REQUEST
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
// CUSTOMER
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
// ALL RENTALS
// ADMIN / RECEPTIONIST
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
// RECEPTIONIST - RECEIVE RETURN
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
                "Rental returned successfully. Settlement is pending.",

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
// CREATE WALK-IN RENTAL
// RECEPTIONIST / ADMIN / STAFF
// =====================================================

export const createWalkInRentalController =
    async (req, res) => {

        try {

            console.log(
                "========== WALK-IN RENTAL CONTROLLER =========="
            );

            console.log(
                "USER:",
                req.user?._id
            );

            console.log(
                "BODY:",
                req.body
            );

            const rental =
                await createWalkInRentalService(
                    req.body,
                    req.user?._id || null
                );

            return res.status(201).json({

                success: true,

                message:
                    "Walk-in rental created successfully",

                data: rental

            });

        } catch (error) {

            console.error(
                "CREATE WALK-IN RENTAL ERROR:",
                error
            );

            return res.status(400).json({

                success: false,

                message:
                    error.message ||
                    "Failed to create walk-in rental"

            });

        }

    };

    // =====================================================
// SEARCH RENTAL FOR RETURN
// RENTAL NUMBER / CUSTOMER PHONE
// =====================================================

export const searchRentalsForReturnController =
    async (req, res) => {

        try {

            const {
                search
            } = req.query;

            const rentals =
                await searchRentalsForReturnService(
                    search
                );

            return res.status(200).json({

                success: true,

                data: rentals

            });

        } catch (error) {

            console.error(
                "SEARCH RENTAL FOR RETURN ERROR:",
                error
            );

            return res.status(400).json({

                success: false,

                message:
                    error.message ||
                    "Failed to search rentals"

            });

        }
    };
    // =====================================================
// COMPLETE RENTAL SETTLEMENT
// =====================================================

export const completeRentalSettlementController =
    async (req, res) => {

        try {

            const rental =
                await completeRentalSettlementService(
                    req.params.id,
                    req.body,
                    req.user?._id
                );

            return res.status(200).json({

                success: true,

                message:
                    "Rental settlement completed successfully",

                data: rental

            });

        } catch (error) {

            console.error(
                "COMPLETE RENTAL SETTLEMENT ERROR:",
                error
            );

            return res.status(400).json({

                success: false,

                message:
                    error.message ||
                    "Failed to complete rental settlement"

            });

        }
    };
    // =====================================================
// SECURITY DEPOSIT RECEIVED
// WALK-IN RENTAL
// =====================================================

export const markRentalDepositReceivedController =
    async (req, res) => {

        try {

            console.log(
                "========== RENTAL DEPOSIT RECEIVED =========="
            );

            console.log(
                "RENTAL ID:",
                req.params.id
            );

            console.log(
                "USER:",
                req.user?._id
            );

            console.log(
                "BODY:",
                req.body
            );

            const rental =
                await markRentalDepositReceivedService(
                    req.params.id,
                    req.body || {},
                    req.user?._id
                );

            return res.status(200).json({

                success: true,

                message:
                    "Security deposit received successfully",

                data: rental

            });

        } catch (error) {

            console.error(
                "RENTAL DEPOSIT RECEIVED ERROR:",
                error
            );

            return res.status(400).json({

                success: false,

                message:
                    error?.message ||
                    "Failed to receive security deposit"

            });
        }
    };