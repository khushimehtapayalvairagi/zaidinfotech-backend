import RentalProduct from "./rentalProduct.model.js";

import {
    getRentalProductByProductDB,
    getRentalProductsDB,
    updateRentalProductDB
} from "./rentalProduct.repository.js";

import Product from "../products/product.model.js";


// =====================================================
// GET RENTAL PRODUCTS
// =====================================================

export const getRentalProductsService = async () => {

    return await getRentalProductsDB();

};


// =====================================================
// GET RENTAL PRODUCT BY PRODUCT ID
// =====================================================

export const getRentalProductService = async (
    productId
) => {

    const rentalProduct =
        await getRentalProductByProductDB(
            productId
        );

    if (!rentalProduct) {

        throw new Error(
            "Rental configuration not found"
        );

    }

    return rentalProduct;

};


// =====================================================
// CREATE / UPDATE RENTAL CONFIG
// =====================================================

export const saveRentalProductService = async (
    productId,
    data,
    userId
) => {

    // =================================================
    // CHECK PRODUCT
    // =================================================

    const product =
        await Product.findById(productId);

    if (!product) {

        throw new Error(
            "Product not found"
        );

    }


    // =================================================
    // CHECK EXISTING RENTAL CONFIG
    // =================================================

    const existing =
        await getRentalProductByProductDB(
            productId
        );


    // =================================================
    // QUANTITY
    // =================================================

    const requestedTotalQuantity =
        Math.max(
            Number(data.totalQuantity ?? 0),
            0
        );


    // =================================================
    // NEW RENTAL PRODUCT
    // =================================================

    if (!existing) {

        const rentalData = {

            productId,

            isAvailableForRent:
                data.isAvailableForRent ?? true,

            monthlyRent:
                Number(data.monthlyRent || 0),

            securityDeposit:
                Number(data.securityDeposit || 0),

            minimumRentalMonths:
                Math.max(
                    Number(
                        data.minimumRentalMonths || 3
                    ),
                    3
                ),

            gst:
                Number(data.gst || 0),

            // First time:
            // Total = Available
            totalQuantity:
                requestedTotalQuantity,

            availableQuantity:
                requestedTotalQuantity,

            rentedQuantity:
                0,

            basicSoftwareInstalled:
                data.basicSoftwareInstalled ?? true,

            includedItems:
                data.includedItems || [
                    "LAPTOP",
                    "CHARGING_ADAPTER",
                    "BACKPACK"
                ],

            status:
                data.status || "ACTIVE",

            notes:
                data.notes || "",

            createdBy:
                userId,

            updatedBy:
                userId

        };


        return await RentalProduct.create(
            rentalData
        );

    }


    // =================================================
    // EXISTING RENTAL PRODUCT
    // =================================================

    const rentedQuantity =
        Number(existing.rentedQuantity || 0);


    // =================================================
    // TOTAL CANNOT BE LESS THAN RENTED
    // =================================================

    if (
        requestedTotalQuantity <
        rentedQuantity
    ) {

        throw new Error(
            `Total quantity cannot be less than currently rented quantity (${rentedQuantity})`
        );

    }


    // =================================================
    // AVAILABLE = TOTAL - RENTED
    // =================================================

    const availableQuantity =
        requestedTotalQuantity -
        rentedQuantity;


    // =================================================
    // UPDATE RENTAL DATA
    // =================================================

    const rentalData = {

        productId,

        isAvailableForRent:
            data.isAvailableForRent ??
            existing.isAvailableForRent,

        monthlyRent:
            Number(
                data.monthlyRent ??
                existing.monthlyRent ??
                0
            ),

        securityDeposit:
            Number(
                data.securityDeposit ??
                existing.securityDeposit ??
                0
            ),

        minimumRentalMonths:
            Math.max(
                Number(
                    data.minimumRentalMonths ??
                    existing.minimumRentalMonths ??
                    3
                ),
                3
            ),

        gst:
            Number(
                data.gst ??
                existing.gst ??
                0
            ),

        totalQuantity:
            requestedTotalQuantity,

        availableQuantity:
            availableQuantity,

        // IMPORTANT:
        // rented quantity automatically maintain hoga
        rentedQuantity:
            rentedQuantity,

        basicSoftwareInstalled:
            data.basicSoftwareInstalled ??
            existing.basicSoftwareInstalled,

        includedItems:
            data.includedItems ??
            existing.includedItems,

        status:
            data.status ??
            existing.status,

        notes:
            data.notes ??
            existing.notes ??
            "",

        updatedBy:
            userId

    };


    return await updateRentalProductDB(
        productId,
        rentalData
    );

};