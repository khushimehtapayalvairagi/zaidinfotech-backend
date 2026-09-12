



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

import RentalDocument from "./rentalDocument.model.js";

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
// =============================================
// RENTAL DURATION
// =============================================

const rentalDurationType =
    String(data.rentalDurationType || "").toUpperCase();

const rentalDuration =
    Number(data.rentalDuration || 0);

if (!["DAYS", "MONTHS"].includes(rentalDurationType)) {
    throw new Error(
        "Rental duration type must be DAYS or MONTHS"
    );
}

if (rentalDuration < 1) {
    throw new Error(
        "Rental duration must be at least 1"
    );
}

// =============================================
// COMPANY RENTAL RULE
// COMPANY = MINIMUM 3 MONTHS
// =============================================

if (
    customerType === "COMPANY" &&
    (
        rentalDurationType !== "MONTHS" ||
        rentalDuration < 3
    )
) {
    throw new Error(
        "Company rental must be for a minimum of 3 months"
    );
}

// =============================================
// PERSONAL RENTAL RULE
// INDIVIDUAL = FLEXIBLE
// =============================================

if (
    customerType === "INDIVIDUAL" &&
    rentalDuration < 1
) {
    throw new Error(
        "Personal rental duration must be at least 1 day"
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

export const markRentalReturnedService = async (rentalId, data) => {

    const rental = await getRentalByIdDB(rentalId);

    if (!rental) {
        throw new Error("Rental not found");
    }

    // =====================================================
    // ONLY ACTIVE RENTAL CAN BE RETURNED
    // =====================================================

    if (rental.status !== "ACTIVE") {
        throw new Error("Only active rental can be returned");
    }

    // =====================================================
    // RETURN CONDITION
    // =====================================================

    const allowedConditions = [
        "GOOD",
        "DAMAGED",
        "HEAVILY_DAMAGED",
        "MISSING"
    ];

    if (!allowedConditions.includes(data.returnCondition)) {
        throw new Error("Invalid return condition");
    }

    // =====================================================
    // CHARGES
    // =====================================================

    const damageCharges = Number(data.damageCharges || 0);

    const otherDeductions = Number(data.otherDeductions || 0);

    if (damageCharges < 0) {
        throw new Error("Damage charges cannot be negative");
    }

    if (otherDeductions < 0) {
        throw new Error("Other deductions cannot be negative");
    }

    // =====================================================
    // CALCULATE PENDING RENT
    // =====================================================

    const monthlyRent = Number(rental.monthlyRent || 0);

    const gstPercentage = Number(rental.gstPercentage || 0);

    let pendingRent = Number(data.pendingRent || 0);

    if (pendingRent < 0) {
        throw new Error("Pending rent cannot be negative");
    }

    // =====================================================
    // GST ON PENDING RENT
    // =====================================================

    const pendingRentGST =
        Number(
            (
                pendingRent *
                gstPercentage /
                100
            ).toFixed(2)
        );

    // =====================================================
    // TOTAL PENDING RENT
    // =====================================================

    const totalPendingRent =
        Number(
            (
                pendingRent +
                pendingRentGST
            ).toFixed(2)
        );

    // =====================================================
    // TOTAL DEDUCTIONS
    // =====================================================

    const totalDeductions =
        Number(
            (
                totalPendingRent +
                damageCharges +
                otherDeductions
            ).toFixed(2)
        );

    // =====================================================
    // SECURITY DEPOSIT
    // =====================================================

    const securityDeposit =
        Number(rental.securityDeposit || 0);

    // =====================================================
    // CALCULATE REFUND
    // =====================================================

    const depositBalance =
        securityDeposit - totalDeductions;

    const depositRefundAmount =
        Math.max(
            Number(depositBalance.toFixed(2)),
            0
        );

    // =====================================================
    // EXTRA AMOUNT CUSTOMER HAS TO PAY
    // =====================================================

    const extraPayableAmount =
        Math.max(
            Number((-depositBalance).toFixed(2)),
            0
        );

    // =====================================================
    // UPDATE RENTAL
    // =====================================================

    const updated = await updateRentalDB(
        rentalId,
        {
            status: "SETTLEMENT_PENDING",

            actualReturnDate: new Date(),

            returnCondition: data.returnCondition,

            damageCharges,

            otherDeductions,

            pendingRent,

            pendingRentGST,

            totalPendingRent,

            totalDeductions,

            depositRefundAmount,

            extraPayableAmount,

            depositRefundStatus:
                extraPayableAmount > 0
                    ? "PENDING"
                    : depositRefundAmount > 0
                        ? "PENDING"
                        : "NOT_APPLICABLE"
        }
    );

    // =====================================================
    // RETURN LAPTOP TO INVENTORY
    // =====================================================

    const updatedRentalProduct =
        await RentalProduct.findOneAndUpdate(
            {
                _id: rental.rentalProductId,
                rentedQuantity: { $gt: 0 }
            },
            {
                $inc: {
                    availableQuantity: 1,
                    rentedQuantity: -1
                }
            },
            {
                new: true
            }
        );

    if (!updatedRentalProduct) {

        throw new Error(
            "Rental inventory update failed"
        );
    }

    // =====================================================
    // LOW STOCK NOTIFICATION
    // =====================================================

    if (
        updatedRentalProduct.availableQuantity <= 5
    ) {

        try {

            await notifyAdminsService({
                type: "RENTAL_STOCK_LOW",

                title: "Rental Stock Low",

                message:
                    `${updatedRentalProduct.productId?.name || "Rental product"} has only ` +
                    `${updatedRentalProduct.availableQuantity} unit(s) available for rent.`,

                relatedId: updatedRentalProduct._id,

                relatedModel: "RentalProduct"
            });

        } catch (notificationError) {

            console.error(
                "Rental stock notification failed:",
                notificationError.message
            );
        }
    }

    return updated;
};



export const uploadRentalDocumentService = async (
    rentalId,
    userId,
    data,
    file
) => {

    // --------------------------------------------------------
    // Validate rental ID
    // --------------------------------------------------------

    if (!rentalId) {
        throw new Error("Rental ID is required");
    }

    // --------------------------------------------------------
    // Validate user
    // --------------------------------------------------------

    if (!userId) {
        throw new Error("User ID is required");
    }

    // --------------------------------------------------------
    // Validate file
    // --------------------------------------------------------

    if (!file) {
        throw new Error("Document file is required");
    }

    // --------------------------------------------------------
    // Find rental
    // --------------------------------------------------------

    const rental = await Rental.findById(rentalId);

    if (!rental) {
        throw new Error("Rental not found");
    }

    // --------------------------------------------------------
    // Document type
    // --------------------------------------------------------

    const documentType = String(
        data?.documentType || ""
    )
        .trim()
        .toUpperCase();

    if (!documentType) {
        throw new Error("Document type is required");
    }

    // --------------------------------------------------------
    // Allowed document types
    // Same as RentalDocument model
    // --------------------------------------------------------

    const allowedDocumentTypes = [
        "PASSPORT_PHOTO",
        "PAN_CARD",
        "AADHAAR_CARD",
        "HOUSE_RENTAL_AGREEMENT",
        "COLLEGE_ID",
        "OFFICE_ID",
        "GST_REGISTRATION",
        "AUTHORIZATION_LETTER"
    ];

    if (!allowedDocumentTypes.includes(documentType)) {
        throw new Error(
            `Invalid document type: ${documentType}`
        );
    }

    // --------------------------------------------------------
    // File URL
    // --------------------------------------------------------

    const fileUrl =
        `/uploads/rental-documents/${file.filename}`;

    // --------------------------------------------------------
    // Create document
    // --------------------------------------------------------

    const document = await RentalDocument.create({
        rentalId: rental._id,

        // For walk-in rental this is the logged-in
        // receptionist/sales/staff user who uploaded it.
        customerId: userId,

        documentType,

        fileUrl,

        fileName:
            file.originalname || file.filename,

        verificationStatus: "PENDING",

        verifiedBy: null,

        verifiedAt: null,

        rejectionReason: ""
    });

    return document;
};


// ============================================================
// GET RENTAL DOCUMENTS
// ============================================================

export const getRentalDocumentsService = async (
    rentalId
) => {

    if (!rentalId) {
        throw new Error("Rental ID is required");
    }

    const rental =
        await Rental.findById(rentalId);

    if (!rental) {
        throw new Error("Rental not found");
    }

    const documents =
        await RentalDocument.find({
            rentalId
        })
        .populate(
            "verifiedBy",
            "firstName lastName email role"
        )
        .sort({
            createdAt: -1
        });

    return documents;
};


// ============================================================
// VERIFY RENTAL DOCUMENT
// ============================================================

export const verifyRentalDocumentService = async (
    documentId,
    userId,
    data
) => {

    if (!documentId) {
        throw new Error(
            "Document ID is required"
        );
    }

    if (!userId) {
        throw new Error(
            "Verifier user ID is required"
        );
    }

    const document =
        await RentalDocument.findById(
            documentId
        );

    if (!document) {
        throw new Error(
            "Rental document not found"
        );
    }

    const verificationStatus =
        String(
            data?.verificationStatus || ""
        )
            .trim()
            .toUpperCase();

    if (
        !["APPROVED", "REJECTED"]
            .includes(verificationStatus)
    ) {
        throw new Error(
            "Verification status must be APPROVED or REJECTED"
        );
    }

    if (
        verificationStatus === "REJECTED" &&
        !String(
            data?.rejectionReason || ""
        ).trim()
    ) {
        throw new Error(
            "Rejection reason is required"
        );
    }

    document.verificationStatus =
        verificationStatus;

    document.verifiedBy =
        userId;

    document.verifiedAt =
        new Date();

    document.rejectionReason =
        verificationStatus === "REJECTED"
            ? String(
                data.rejectionReason
            ).trim()
            : "";

    await document.save();

    return document;
};


