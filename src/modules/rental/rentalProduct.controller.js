import {
    getRentalProductsService,
    getRentalProductService,
    saveRentalProductService
} from "./rentalProduct.service.js";


// =====================================================
// GET ALL RENTAL PRODUCTS
// =====================================================

export const getRentalProductsController = async (
    req,
    res
) => {

    try {

        const products =
            await getRentalProductsService();

        return res.status(200).json({

            success: true,

            message:
                "Rental products fetched successfully",

            data: products

        });

    } catch (error) {

        return res.status(500).json({

            success: false,

            message: error.message

        });

    }

};


// =====================================================
// GET RENTAL CONFIG BY PRODUCT
// =====================================================

export const getRentalProductController = async (
    req,
    res
) => {

    try {

        const rentalProduct =
            await getRentalProductService(
                req.params.productId
            );

        return res.status(200).json({

            success: true,

            data: rentalProduct

        });

    } catch (error) {

        return res.status(404).json({

            success: false,

            message: error.message

        });

    }

};


// =====================================================
// CREATE / UPDATE RENTAL CONFIG
// =====================================================

export const saveRentalProductController = async (
    req,
    res
) => {

    try {

        const rentalProduct =
            await saveRentalProductService(
                req.params.productId,
                req.body,
                req.user._id
            );

        return res.status(200).json({

            success: true,

            message:
                "Rental configuration saved successfully",

            data: rentalProduct

        });

    } catch (error) {

        return res.status(400).json({

            success: false,

            message: error.message

        });

    }

};