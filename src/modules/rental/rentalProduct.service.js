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

export const getRentalProductService = async (productId) => {

    const rentalProduct = await getRentalProductByProductDB(productId);

    if (!rentalProduct) {
        throw new Error("Rental configuration not found");
    }

    return rentalProduct;
};


// =====================================================
// CREATE / UPDATE RENTAL CONFIG
//
// Inventory rule (hamesha):
//   total = available + rented
//
// FIX: pehle agar update me totalQuantity nahi bheja jaata tha
// to total 0 maan liya jata tha (stock 0 ho jata ya error aata).
// Ab existing total hi use hota hai.
// =====================================================

export const saveRentalProductService = async (
    productId,
    data,
    userId
) => {

    const product = await Product.findById(productId);

    if (!product) {
        throw new Error("Product not found");
    }

    const existing = await getRentalProductByProductDB(productId);

    const toQuantity = (value, fallback) => {

        const quantity = Number(value ?? fallback ?? 0);

        if (!Number.isInteger(quantity) || quantity < 0) {
            throw new Error(
                "Total quantity must be a whole number (0 or more)"
            );
        }

        return quantity;
    };

    // ---------------- NEW RENTAL PRODUCT ----------------

    if (!existing) {

        const totalQuantity = toQuantity(data.totalQuantity, 0);

        return await RentalProduct.create({
            productId,

            isAvailableForRent: data.isAvailableForRent ?? true,

            monthlyRent: Number(data.monthlyRent || 0),
            securityDeposit: Number(data.securityDeposit || 0),

            minimumRentalMonths: Math.max(
                Number(data.minimumRentalMonths || 3),
                3
            ),

            gst: Number(data.gst || 0),

            totalQuantity,
            availableQuantity: totalQuantity,
            rentedQuantity: 0,

            basicSoftwareInstalled: data.basicSoftwareInstalled ?? true,

            includedItems:
                data.includedItems || [
                    "LAPTOP",
                    "CHARGING_ADAPTER",
                    "BACKPACK"
                ],

            status: data.status || "ACTIVE",
            notes: data.notes || "",

            createdBy: userId,
            updatedBy: userId
        });
    }

    // ---------------- EXISTING RENTAL PRODUCT ----------------

    const rentedQuantity = Number(existing.rentedQuantity || 0);

    const totalQuantity = toQuantity(
        data.totalQuantity,
        existing.totalQuantity
    );

    if (totalQuantity < rentedQuantity) {
        throw new Error(
            `Total quantity cannot be less than currently rented quantity (${rentedQuantity})`
        );
    }

    const rentalData = {
        productId,

        isAvailableForRent:
            data.isAvailableForRent ?? existing.isAvailableForRent,

        monthlyRent: Number(
            data.monthlyRent ?? existing.monthlyRent ?? 0
        ),

        securityDeposit: Number(
            data.securityDeposit ?? existing.securityDeposit ?? 0
        ),

        minimumRentalMonths: Math.max(
            Number(
                data.minimumRentalMonths ??
                existing.minimumRentalMonths ??
                3
            ),
            3
        ),

        gst: Number(data.gst ?? existing.gst ?? 0),

        totalQuantity,
        availableQuantity: totalQuantity - rentedQuantity,
        rentedQuantity,

        basicSoftwareInstalled:
            data.basicSoftwareInstalled ?? existing.basicSoftwareInstalled,

        includedItems: data.includedItems ?? existing.includedItems,

        status: data.status ?? existing.status,

        notes: data.notes ?? existing.notes ?? "",

        updatedBy: userId
    };

    return await updateRentalProductDB(productId, rentalData);
};