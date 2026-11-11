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
        .populate("securityDepositPaymentId")

        // [CHANGE] Branch + salesperson (soldBy) are stored as IDs only.
        // populate() swaps the ID for the name at READ time so the UI can
        // show them. The database document is NOT modified by populate.
        .populate("branchId", "name")
        .populate("soldBy", "firstName lastName name email");

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

        // [CHANGE] Show branch name + salesperson name in the
        // admin / orders list (same populate as getRentalByIdDB).
        .populate("branchId", "name")
        .populate("soldBy", "firstName lastName name email")

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

// =====================================================
// SEARCH ACTIVE RENTAL FOR RETURN
// BY RENTAL NUMBER OR CUSTOMER PHONE
// =====================================================

export const searchActiveRentalsForReturnDB = async (
    search
) => {

    const value =
        String(search || "").trim();

    if (!value) {
        return [];
    }

    const escapedValue =
        value.replace(
            /[.*+?^${}()|[\]\\]/g,
            "\\$&"
        );

    return await Rental.find({
        status: "ACTIVE",

        $or: [
            {
                rentalNumber: {
                    $regex: escapedValue,
                    $options: "i"
                }
            },

            {
                "individualDetails.phone": {
                    $regex: escapedValue,
                    $options: "i"
                }
            },

            {
                "companyDetails.phone": {
                    $regex: escapedValue,
                    $options: "i"
                }
            }
        ]
    })
        .populate(
            "customerId",
            "name email phone"
        )
        .populate("productId")
        .populate("rentalProductId")
        .sort({
            createdAt: -1
        });
};