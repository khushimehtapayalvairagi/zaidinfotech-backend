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
// MY RENTALS (CUSTOMER)
// =====================================================

export const getMyRentalsController = async (req, res) => {

    try {

        const rentals = await getMyRentalsService(req.user._id);

        return res.status(200).json({ success: true, data: rentals });

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

export const getRentalController = async (req, res) => {

    try {

        const rental = await getRentalService(req.params.id);

        return res.status(200).json({ success: true, data: rental });

    } catch (error) {

        return res.status(404).json({
            success: false,
            message: error.message
        });
    }
};


// =====================================================
// ALL RENTALS
// =====================================================

export const getAllRentalsController = async (req, res) => {

    try {

        const rentals = await getAllRentalsService();

        return res.status(200).json({ success: true, data: rentals });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


// =====================================================
// RECEIVE RETURN
// Response data = rental + settlement (backend ka asli hisaab)
// =====================================================

export const markRentalReturnedController = async (req, res) => {

    try {

        const { rental, settlement } = await markRentalReturnedService(
            req.params.id,
            req.body || {}
        );

        const plain = rental?.toObject ? rental.toObject() : rental;

        return res.status(200).json({
            success: true,
            message: "Rental returned successfully. Settlement is pending.",
            data: { ...plain, settlement }
        });

    } catch (error) {

        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
};


// =====================================================
// CREATE WALK-IN RENTAL ORDER
// data = { orderId, rentals: [...], warnings: [...] }
// =====================================================

// export const createWalkInRentalController = async (req, res) => {

//     try {

//         const result = await createWalkInRentalService(
//             req.body,
//             req.user?._id || null
//         );

//         return res.status(201).json({
//             success: true,
//             message:
//                 result.rentals.length > 1
//                     ? `${result.rentals.length} walk-in rentals created successfully`
//                     : "Walk-in rental created successfully",
//             data: result
//         });

//     } catch (error) {

//         console.error("CREATE WALK-IN RENTAL ERROR:", error);

//         return res.status(400).json({
//             success: false,
//             message: error.message || "Failed to create walk-in rental"
//         });
//     }
// };


export const createWalkInRentalController = async (req, res) => {
try {
const result = await createWalkInRentalService(
req.body,
req.user?._id || req.user?.id
);

    console.log("WALK-IN RENTAL SERVICE RESULT:", {
        orderId: result?.orderId,
        rentalsCount: result?.rentals?.length,
        rentalIds: (result?.rentals || []).map(
            (rental) => rental?._id
        )
    });

    return res.status(201).json({
        success: true,
        message: "Walk-in rental created successfully",
        data: {
            orderId: result.orderId,
            rentals: result.rentals || [],
            warnings: result.warnings || []
        }
    });
} catch (error) {
    console.error("CREATE WALK-IN RENTAL CONTROLLER ERROR:", error);

    return res.status(400).json({
        success: false,
        message: error.message || "Failed to create walk-in rental"
    });
}


};


// =====================================================
// SEARCH RENTAL FOR RETURN
// =====================================================

export const searchRentalsForReturnController = async (req, res) => {

    try {

        const rentals = await searchRentalsForReturnService(
            req.query.search
        );

        return res.status(200).json({ success: true, data: rentals });

    } catch (error) {

        console.error("SEARCH RENTAL FOR RETURN ERROR:", error);

        return res.status(400).json({
            success: false,
            message: error.message || "Failed to search rentals"
        });
    }
};


// =====================================================
// COMPLETE SETTLEMENT
// =====================================================

export const completeRentalSettlementController = async (req, res) => {

    try {

        const rental = await completeRentalSettlementService(
            req.params.id,
            req.body || {},
            req.user?._id
        );

        return res.status(200).json({
            success: true,
            message: "Rental settlement completed successfully",
            data: rental
        });

    } catch (error) {

        console.error("COMPLETE RENTAL SETTLEMENT ERROR:", error);

        return res.status(400).json({
            success: false,
            message: error.message || "Failed to complete rental settlement"
        });
    }
};


// =====================================================
// SECURITY DEPOSIT RECEIVED
// =====================================================

export const markRentalDepositReceivedController = async (req, res) => {

    try {

        const rental = await markRentalDepositReceivedService(
            req.params.id,
            req.body || {},
            req.user?._id
        );

        return res.status(200).json({
            success: true,
            message: "Security deposit received successfully",
            data: rental
        });

    } catch (error) {

        console.error("RENTAL DEPOSIT RECEIVED ERROR:", error);

        return res.status(400).json({
            success: false,
            message: error?.message || "Failed to receive security deposit"
        });
    }
};