import {
    getMyRentalsService,
    getRentalService,
    getAllRentalsService,
    markRentalReturnedService,
    createWalkInRentalService
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