



import {
    notifyAdminsService
} from "../notification/notification.service.js";

import Rental from "./rental.model.js";
import RentalProduct from "./rentalProduct.model.js";
import { createPayment } from "../payments/payment.service.js";

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
// CREATE WALK-IN RENTAL
// RECEPTIONIST / ADMIN / STAFF
// =====================================================

export const createWalkInRentalService = async (
    data,
    createdBy
) => {

    console.log(
        "========== CREATE WALK-IN RENTAL =========="
    );

    console.log(
        "WALK-IN DATA:",
        data
    );

    if (!data) {
        throw new Error(
            "Rental data is required"
        );
    }

    if (!data.rentalProductId) {
        throw new Error(
            "Rental product is required"
        );
    }

    if (!data.customerType) {
        throw new Error(
            "Customer type is required"
        );
    }

    const customerType =
        String(data.customerType).toUpperCase();

    if (
        !["INDIVIDUAL", "COMPANY"].includes(
            customerType
        )
    ) {
        throw new Error(
            "Invalid customer type"
        );
    }

    // =============================================
    // FIND RENTAL PRODUCT
    // =============================================

    const rentalProduct =
        await RentalProduct
            .findById(data.rentalProductId)
            .populate("productId");

    if (!rentalProduct) {
        throw new Error(
            "Rental product not found"
        );
    }

    if (rentalProduct.status !== "ACTIVE") {
        throw new Error(
            "This rental product is inactive"
        );
    }

    if (rentalProduct.isAvailableForRent !== true) {
        throw new Error(
            "This product is not available for rent"
        );
    }

    if (
        Number(rentalProduct.availableQuantity || 0) <= 0
    ) {
        throw new Error(
            "Rental product is currently out of stock"
        );
    }

    // =============================================
    // RENTAL MONTHS
    // =============================================

    const rentalMonths =
        Number(
            data.rentalMonths ||
            rentalProduct.minimumRentalMonths ||
            3
        );

    const minimumMonths =
        Number(
            rentalProduct.minimumRentalMonths || 3
        );

    if (rentalMonths < minimumMonths) {
        throw new Error(
            `Minimum rental period is ${minimumMonths} months`
        );
    }

    // =============================================
    // PRICING
    // =============================================

    const monthlyRent =
        Number(
            data.monthlyRent ??
            rentalProduct.monthlyRent ??
            0
        );

    if (monthlyRent <= 0) {
        throw new Error(
            "Monthly rent must be greater than 0"
        );
    }

    const securityDeposit =
        Number(
            data.securityDeposit ??
            rentalProduct.securityDeposit ??
            0
        );

    if (securityDeposit < 0) {
        throw new Error(
            "Security deposit cannot be negative"
        );
    }

    const gstPercentage =
        Number(
            data.gstPercentage ??
            rentalProduct.gst ??
            0
        );

    if (gstPercentage < 0) {
        throw new Error(
            "GST percentage cannot be negative"
        );
    }

    // =============================================
    // CUSTOMER DETAILS
    // =============================================

    let individualDetails = null;
    let companyDetails = null;

    if (customerType === "INDIVIDUAL") {

        const details =
            data.individualDetails || {};

        const fullName =
            String(details.fullName || "").trim();

        const phone =
            String(details.phone || "").trim();

        if (!fullName) {
            throw new Error(
                "Customer full name is required"
            );
        }

        if (!phone) {
            throw new Error(
                "Customer phone number is required"
            );
        }

        individualDetails = {
            fullName,
            phone,
            email: String(
                details.email || ""
            )
                .trim()
                .toLowerCase(),
            address: String(
                details.address || ""
            ).trim()
        };
    }

    if (customerType === "COMPANY") {

        const details =
            data.companyDetails || {};

        const companyName =
            String(
                details.companyName || ""
            ).trim();

        const contactPerson =
            String(
                details.contactPerson || ""
            ).trim();

        const phone =
            String(
                details.phone || ""
            ).trim();

        if (!companyName) {
            throw new Error(
                "Company name is required"
            );
        }

        if (!contactPerson) {
            throw new Error(
                "Contact person is required"
            );
        }

        if (!phone) {
            throw new Error(
                "Company phone number is required"
            );
        }

        companyDetails = {
            companyName,
            contactPerson,
            phone,
            email: String(
                details.email || ""
            )
                .trim()
                .toLowerCase(),
            officeAddress: String(
                details.officeAddress || ""
            ).trim(),
            gstNumber: String(
                details.gstNumber || ""
            )
                .trim()
                .toUpperCase()
        };
    }

    // =============================================
    // RENTAL NUMBER
    // =============================================

    const rentalNumber =
        generateRentalNumber();

    // =============================================
    // DATES
    // =============================================

    const startDate =
        new Date();

    const expectedEndDate =
        new Date(startDate);

    expectedEndDate.setMonth(
        expectedEndDate.getMonth() +
        rentalMonths
    );

    const nextPaymentDate =
        new Date(startDate);

    nextPaymentDate.setMonth(
        nextPaymentDate.getMonth() + 1
    );

    // =============================================
    // CREATE WALK-IN RENTAL
    // =============================================

    const rental =
        await Rental.create({

            rentalNumber,

            customerId: null,

            productId:
                rentalProduct.productId?._id ||
                rentalProduct.productId,

            rentalProductId:
                rentalProduct._id,

            rentalSource:
                "WALK_IN",

            customerType,

            individualDetails,

            companyDetails,

            monthlyRent,

            gstPercentage,

            securityDeposit,

            rentalMonths,

            startDate,

            expectedEndDate,

            nextPaymentDate,

            lastPaymentDate:
                null,

            status:
                "ACTIVE",

            allocatedAt:
                new Date(),

            allocatedBy:
                createdBy,

            notes:
                String(
                    data.notes ||
                    data.handoverNotes ||
                    ""
                ).trim()
        });

    // =============================================
    // ATOMIC STOCK UPDATE
    // =============================================

    const updatedRentalProduct =
        await RentalProduct.findOneAndUpdate(
            {
                _id:
                    rentalProduct._id,

                status:
                    "ACTIVE",

                isAvailableForRent:
                    true,

                availableQuantity:
                    {
                        $gt: 0
                    }
            },

            {
                $inc: {
                    availableQuantity: -1,
                    rentedQuantity: 1
                },

                $set: {
                    updatedBy:
                        createdBy
                }
            },

            {
                new: true
            }
        );

    // =============================================
    // ROLLBACK IF STOCK FAILED
    // =============================================

    if (!updatedRentalProduct) {

        await Rental.findByIdAndDelete(
            rental._id
        );

        throw new Error(
            "Rental stock became unavailable. Please refresh and try again."
        );
    }
     // =============================================
// LOW RENTAL STOCK NOTIFICATION
// =============================================

if (updatedRentalProduct.availableQuantity <= 5) {

    await notifyAdminsService({

        type: "RENTAL_STOCK_LOW",

        title: "Rental Stock Low",

        message:
            `${rentalProduct.productId.name} rental stock is low. ` +
            `Only ${updatedRentalProduct.availableQuantity} unit(s) available.`,

        relatedId:
            updatedRentalProduct._id,

        relatedModel:
            "RentalProduct"
    });
}
    // =============================================
    // GET FINAL RENTAL
    // =============================================

    const finalRental =
        await Rental
            .findById(rental._id)
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
            .populate(
                "rentalProductId"
            );

    console.log(
        "WALK-IN RENTAL CREATED:",
        finalRental
    );

    return finalRental;
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
// DEPOSIT RECEIVED
// =====================================================
// Security deposit physically received by receptionist
//
// DEPOSIT_PENDING
//        ↓
// READY_FOR_ALLOCATION
// =====================================================

// =====================================================
// DEPOSIT RECEIVED
// =====================================================
// Security deposit physically received
//
// DEPOSIT_PENDING
//        ↓
// Create Payment
//        ↓
// READY_FOR_ALLOCATION
// =====================================================

// =====================================================
// DEPOSIT RECEIVED
// =====================================================
// DEPOSIT_PENDING
//        ↓
// Create Payment
//        ↓
// READY_FOR_ALLOCATION
// =====================================================




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

// =====================================================
// ALLOCATE RENTAL PRODUCT
// =====================================================

