import Rental from "./rental.model.js";
import RentalProduct from "./rentalProduct.model.js";

import {
    createRentalDB,
    getRentalByIdDB,
    getCustomerRentalsDB,
    getAllRentalsDB,
    updateRentalDB
} from "./rental.repository.js";


// =====================================================
// GENERATE RENTAL NUMBER
// =====================================================

const generateRentalNumber = () => {

    const timestamp =
        Date.now().toString().slice(-8);

    return `RENT-${timestamp}`;

};


// =====================================================
// CREATE RENTAL REQUEST
// =====================================================

export const createRentalService = async (
    data,
    customerId
) => {

    const rentalProduct =
        await RentalProduct.findById(
            data.rentalProductId
        );

    if (!rentalProduct) {

        throw new Error(
            "Rental product not found"
        );

    }


    if (
        !rentalProduct.isAvailableForRent ||
        rentalProduct.status !== "ACTIVE"
    ) {

        throw new Error(
            "Product is not available for rental"
        );

    }


    if (
        rentalProduct.availableQuantity <= 0
    ) {

        throw new Error(
            "Rental product is out of stock"
        );

    }


    const rentalMonths =
        Number(data.rentalMonths);


    if (
        !rentalMonths ||
        rentalMonths < rentalProduct.minimumRentalMonths
    ) {

        throw new Error(
            `Minimum rental period is ${rentalProduct.minimumRentalMonths} months`
        );

    }


    if (
        !["INDIVIDUAL", "COMPANY"]
            .includes(data.customerType)
    ) {

        throw new Error(
            "Invalid customer type"
        );

    }


    const rental = await createRentalDB({

        rentalNumber:
            generateRentalNumber(),

        customerId,

        productId:
            rentalProduct.productId,

        rentalProductId:
            rentalProduct._id,

        customerType:
            data.customerType,

        individualDetails:
            data.individualDetails || {},

        companyDetails:
            data.companyDetails || {},

        monthlyRent:
            rentalProduct.monthlyRent,

        gstPercentage:
            rentalProduct.gst,

        securityDeposit:
            rentalProduct.securityDeposit,

        rentalMonths,

        status:
            "PENDING",

        notes:
            data.notes || ""

    });


    return rental;

};


// =====================================================
// CUSTOMER RENTALS
// =====================================================

export const getMyRentalsService = async (
    customerId
) => {

    return await getCustomerRentalsDB(
        customerId
    );

};


// =====================================================
// GET SINGLE RENTAL
// =====================================================

export const getRentalService = async (
    rentalId
) => {

    const rental =
        await getRentalByIdDB(
            rentalId
        );

    if (!rental) {

        throw new Error(
            "Rental not found"
        );

    }

    return rental;

};


// =====================================================
// ADMIN - ALL RENTALS
// =====================================================

export const getAllRentalsService = async () => {

    return await getAllRentalsDB();

};


// =====================================================
// ADMIN APPROVE RENTAL
// =====================================================

export const approveRentalService = async (
    rentalId,
    adminId
) => {

    const rental =
        await getRentalByIdDB(
            rentalId
        );

    if (!rental) {

        throw new Error(
            "Rental not found"
        );

    }


    if (
        rental.status !== "PENDING" &&
        rental.status !== "DOCUMENT_VERIFICATION"
    ) {

        throw new Error(
            "Rental cannot be approved in current status"
        );

    }


    const updatedRental =
        await updateRentalDB(
            rentalId,
            {
                status: "DEPOSIT_PENDING",

                approvedBy:
                    adminId,

                approvedAt:
                    new Date()
            }
        );


    return updatedRental;

};


// =====================================================
// REJECT RENTAL
// =====================================================

export const rejectRentalService = async (
    rentalId,
    reason
) => {

    const rental =
        await getRentalByIdDB(
            rentalId
        );

    if (!rental) {

        throw new Error(
            "Rental not found"
        );

    }


    return await updateRentalDB(
        rentalId,
        {
            status: "REJECTED",
            rejectionReason:
                reason || "Rental rejected"
        }
    );

};


// =====================================================
// REQUEST RETURN
// =====================================================

export const requestReturnService = async (
    rentalId,
    customerId
) => {

    const rental =
        await getRentalByIdDB(
            rentalId
        );

    if (!rental) {

        throw new Error(
            "Rental not found"
        );

    }


    if (
        rental.customerId._id.toString() !==
        customerId.toString()
    ) {

        throw new Error(
            "Unauthorized"
        );

    }


    if (rental.status !== "ACTIVE") {

        throw new Error(
            "Rental is not active"
        );

    }


    return await updateRentalDB(
        rentalId,
        {
            status: "RETURN_REQUESTED"
        }
    );

};


// =====================================================
// ADMIN MARK RETURNED
// =====================================================

export const markRentalReturnedService = async (
    rentalId,
    data
) => {

    const rental =
        await getRentalByIdDB(
            rentalId
        );

    if (!rental) {

        throw new Error(
            "Rental not found"
        );

    }


    const damageCharges =
        Number(data.damageCharges || 0);

    const otherDeductions =
        Number(data.otherDeductions || 0);


    const deposit =
        rental.securityDeposit;


    const refundAmount =
        Math.max(
            deposit -
            damageCharges -
            otherDeductions,
            0
        );


    const updated =
        await updateRentalDB(
            rentalId,
            {

                status:
                    "SETTLEMENT_PENDING",

                actualReturnDate:
                    new Date(),

                returnCondition:
                    data.returnCondition,

                damageCharges,

                otherDeductions,

                depositRefundAmount:
                    refundAmount,

                depositRefundStatus:
                    "PENDING"

            }
        );


    // Rental quantity वापस available

    await RentalProduct.findByIdAndUpdate(
        rental.rentalProductId,
        {
            $inc: {
                availableQuantity: 1
            }
        }
    );


    return updated;

};