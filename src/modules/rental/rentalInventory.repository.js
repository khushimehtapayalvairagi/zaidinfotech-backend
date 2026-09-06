import RentalProduct from "./rentalProduct.model.js";

// =====================================================
// GET RENTAL INVENTORY
// =====================================================

export const getRentalInventoryDB = async () => {

    return await RentalProduct.find()
        .populate({
            path: "productId",
            populate: [
                {
                    path: "brand"
                },
                {
                    path: "category"
                }
            ]
        })
        .sort({
            createdAt: -1
        });

};