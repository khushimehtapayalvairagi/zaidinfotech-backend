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

    const product =
        await Product.findById(productId);

    if (!product) {

        throw new Error(
            "Product not found"
        );

    }


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
                Number(data.minimumRentalMonths || 3),
                3
            ),

        gst:
            Number(data.gst || 0),

        availableQuantity:
            Number(data.availableQuantity || 0),

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

        updatedBy:
            userId
    };


    const existing =
        await getRentalProductByProductDB(
            productId
        );


    if (existing) {

        return await updateRentalProductDB(
            productId,
            rentalData
        );

    }


    return await RentalProduct.create({
        ...rentalData,
        createdBy: userId
    });

};