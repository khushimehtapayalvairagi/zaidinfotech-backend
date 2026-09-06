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
// CREATE RENTAL
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
        rentalMonths <
        rentalProduct.minimumRentalMonths
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
// ALL RENTALS
// =====================================================

export const getAllRentalsService = async () => {

    return await getAllRentalsDB();

};


// =====================================================
// APPROVE RENTAL
// =====================================================

export const approveRentalService = async (
    rentalId,
    receptionistId
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
                status:
                    "DEPOSIT_PENDING",

                approvedBy:
                    receptionistId,

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
            status:
                "REJECTED",

            rejectionReason:
                reason ||
                "Rental rejected"
        }
    );

};


// =====================================================
// DEPOSIT RECEIVED
// =====================================================
// Security deposit physically received by receptionist
//
// DEPOSIT_PENDING
//        ↓
// READY_FOR_ALLOCATION
// =====================================================

export const markDepositReceivedService = async (
    rentalId,
    receptionistId,
    paymentId = null
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
        rental.status !== "DEPOSIT_PENDING"
    ) {

        throw new Error(
            "Security deposit is not pending"
        );

    }

    const updateData = {

        status:
            "READY_FOR_ALLOCATION"

    };

    if (paymentId) {

        updateData.securityDepositPaymentId =
            paymentId;

    }

    const updatedRental =
        await updateRentalDB(
            rentalId,
            updateData
        );

    return updatedRental;

};


// =====================================================
// RECEIVE RENTAL RETURN
// =====================================================
// Offline rental flow:
//
// Customer physically returns product
//              ↓
// Receptionist receives product
//              ↓
// Condition check
//              ↓
// Settlement Pending
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


    // =================================================
    // ONLY ACTIVE RENTAL CAN BE RETURNED
    // =================================================

    if (
        rental.status !== "ACTIVE"
    ) {

        throw new Error(
            "Only active rental can be returned"
        );

    }


    // =================================================
    // RETURN CONDITION
    // =================================================

    const allowedConditions = [
        "GOOD",
        "DAMAGED",
        "HEAVILY_DAMAGED",
        "MISSING"
    ];

    if (
        !allowedConditions.includes(
            data.returnCondition
        )
    ) {

        throw new Error(
            "Invalid return condition"
        );

    }


    // =================================================
    // DAMAGE CHARGES
    // =================================================

    const damageCharges =
        Number(
            data.damageCharges || 0
        );

    const otherDeductions =
        Number(
            data.otherDeductions || 0
        );


    if (damageCharges < 0) {

        throw new Error(
            "Damage charges cannot be negative"
        );

    }


    if (otherDeductions < 0) {

        throw new Error(
            "Other deductions cannot be negative"
        );

    }


    // =================================================
    // SECURITY DEPOSIT
    // =================================================

    const deposit =
        Number(
            rental.securityDeposit || 0
        );


    // =================================================
    // REFUND CALCULATION
    // =================================================

    const refundAmount =
        Math.max(
            deposit -
            damageCharges -
            otherDeductions,
            0
        );


    // =================================================
    // UPDATE RENTAL
    // =================================================

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


    // =================================================
    // UPDATE RENTAL INVENTORY
    // =================================================
    //
    // Product returned:
    //
    // availableQuantity + 1
    // rentedQuantity - 1
    //
    // =================================================

    await RentalProduct.findByIdAndUpdate(
        rental.rentalProductId,
        {
            $inc: {

                availableQuantity: 1,

                rentedQuantity: -1

            }
        }
    );


    return updated;

};


// =====================================================
// ALLOCATE RENTAL PRODUCT
// =====================================================

export const allocateRentalService = async (
    rentalId,
    receptionistId
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


    // =================================================
    // READY FOR ALLOCATION
    // =================================================

    if (
        rental.status !==
        "READY_FOR_ALLOCATION"
    ) {

        throw new Error(
            "Rental is not ready for allocation"
        );

    }


    // =================================================
    // FIND RENTAL PRODUCT
    // =================================================

    const rentalProduct =
        await RentalProduct.findById(
            rental.rentalProductId
        );

    if (!rentalProduct) {

        throw new Error(
            "Rental product not found"
        );

    }


    // =================================================
    // AVAILABLE QUANTITY
    // =================================================

    if (
        rentalProduct.availableQuantity <= 0
    ) {

        throw new Error(
            "No product available for allocation"
        );

    }


    // =================================================
    // UPDATE INVENTORY
    // =================================================

    await RentalProduct.findByIdAndUpdate(
        rentalProduct._id,
        {
            $inc: {

                availableQuantity: -1,

                rentedQuantity: 1

            }
        }
    );


    // =================================================
    // START RENTAL
    // =================================================

    const startDate =
        new Date();

    const updatedRental =
        await updateRentalDB(
            rentalId,
            {

                status:
                    "ACTIVE",

                allocatedAt:
                    startDate,

                allocatedBy:
                    receptionistId,

                startDate

            }
        );


    return updatedRental;

};