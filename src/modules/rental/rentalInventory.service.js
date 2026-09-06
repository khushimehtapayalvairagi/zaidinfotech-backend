import {
    getRentalInventoryDB
} from "./rentalInventory.repository.js";


// =====================================================
// GET RENTAL INVENTORY
// =====================================================

export const getRentalInventoryService = async () => {

    const inventory =
        await getRentalInventoryDB();

    return inventory.map((item) => ({

        rentalProductId: item._id,

        productId: item.productId?._id,

        product: item.productId,

        totalQuantity: item.totalQuantity,

        availableQuantity: item.availableQuantity,

        rentedQuantity: item.rentedQuantity,

        isAvailableForRent:
            item.isAvailableForRent,

        status: item.status

    }));

};