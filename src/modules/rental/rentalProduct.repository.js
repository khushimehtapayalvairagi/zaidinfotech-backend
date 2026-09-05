import RentalProduct from "./rentalProduct.model.js";


// =====================================================
// CREATE
// =====================================================

export const createRentalProductDB = async (data) => {

    return await RentalProduct.create(data);

};


// =====================================================
// GET BY PRODUCT
// =====================================================

export const getRentalProductByProductDB = async (
    productId
) => {

    return await RentalProduct.findOne({
        productId
    });

};


// =====================================================
// GET BY ID
// =====================================================

export const getRentalProductByIdDB = async (
    id
) => {

    return await RentalProduct.findById(id)
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
        });

};


// =====================================================
// GET ALL RENTAL PRODUCTS
// =====================================================

export const getRentalProductsDB = async () => {

    return await RentalProduct.find({
        isAvailableForRent: true,
        status: "ACTIVE",
        availableQuantity: {
            $gt: 0
        }
    })
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


// =====================================================
// UPDATE
// =====================================================

export const updateRentalProductDB = async (
    productId,
    data
) => {

    return await RentalProduct.findOneAndUpdate(
        { productId },
        data,
        {
            new: true,
            runValidators: true
        }
    );

};


// =====================================================
// DELETE / DISABLE
// =====================================================

export const disableRentalProductDB = async (
    productId
) => {

    return await RentalProduct.findOneAndUpdate(
        { productId },
        {
            isAvailableForRent: false,
            status: "INACTIVE"
        },
        {
            new: true
        }
    );

};