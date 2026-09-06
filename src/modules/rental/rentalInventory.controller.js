import {
    getRentalInventoryService
} from "./rentalInventory.service.js";


// =====================================================
// ADMIN - GET RENTAL INVENTORY
// =====================================================

export const getRentalInventoryController = async (
    req,
    res
) => {

    try {

        const inventory =
            await getRentalInventoryService();

        return res.status(200).json({

            success: true,

            message:
                "Rental inventory fetched successfully",

            data: inventory

        });

    } catch (error) {

        return res.status(500).json({

            success: false,

            message: error.message

        });

    }

};