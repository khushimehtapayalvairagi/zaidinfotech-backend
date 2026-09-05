import Rental from "./rental.model.js";


// =====================================================
// CREATE RENTAL
// =====================================================

export const createRentalDB = async (data) => {

    return await Rental.create(data);

};


// =====================================================
// GET RENTAL BY ID
// =====================================================

export const getRentalByIdDB = async (id) => {

    return await Rental.findById(id)
        .populate("customerId", "name email phone")
        .populate("productId")
        .populate("rentalProductId")
        .populate("securityDepositPaymentId");

};


// =====================================================
// CUSTOMER RENTALS
// =====================================================

export const getCustomerRentalsDB = async (
    customerId
) => {

    return await Rental.find({
        customerId
    })
        .populate("productId")
        .populate("rentalProductId")
        .sort({
            createdAt: -1
        });

};


// =====================================================
// ALL RENTALS - ADMIN
// =====================================================

export const getAllRentalsDB = async () => {

    return await Rental.find()
        .populate("customerId", "name email phone")
        .populate("productId")
        .populate("rentalProductId")
        .sort({
            createdAt: -1
        });

};


// =====================================================
// UPDATE RENTAL
// =====================================================

export const updateRentalDB = async (
    id,
    data
) => {

    return await Rental.findByIdAndUpdate(
        id,
        data,
        {
            new: true,
            runValidators: true
        }
    );

};


// =====================================================
// FIND ACTIVE RENTAL FOR PRODUCT
// =====================================================

export const findActiveRentalByProductDB = async (
    productId
) => {

    return await Rental.findOne({
        productId,
        status: "ACTIVE"
    });

};