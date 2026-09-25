import Payment from "../payments/payment.model.js";

import {
    notifyAdminsService
} from "../notification/notification.service.js";

import Rental from "./rental.model.js";
import RentalProduct from "./rentalProduct.model.js";

import {
    createPayment
} from "../payments/payment.service.js";

import {
    PAYMENT_STATUS
} from "../../common/constants/paymentStatus.js";


import {
    createRentalDB,
    getRentalByIdDB,
    getCustomerRentalsDB,
    getAllRentalsDB,
    updateRentalDB,
    searchActiveRentalsForReturnDB
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

const startDate = new Date();

const expectedEndDate = new Date(startDate);

if (rentalDurationType === "MONTHS") {
    expectedEndDate.setMonth(
        expectedEndDate.getMonth() +
        rentalDuration
    );
} else {
    expectedEndDate.setDate(
        expectedEndDate.getDate() +
        rentalDuration
    );
}

const nextPaymentDate = new Date(startDate);

if (rentalDurationType === "MONTHS") {
    nextPaymentDate.setMonth(
        nextPaymentDate.getMonth() + 1
    );
} else {
    nextPaymentDate.setDate(
        nextPaymentDate.getDate() + 1
    );
}

    // =============================================
    // DEPOSIT INFO (from the Walk-In Rental form)
    // =============================================
    //
    // The receptionist may have already collected the
    // security deposit (fully or partially) at the time
    // of creating this walk-in rental. Save that on the
    // Rental itself so it shows correctly in
    // WalkInRentalOrders.jsx without needing a separate
    // "Mark Deposit Received" step.
    //
    // This is independent from securityDepositPaymentId /
    // depositReceived, which belong to the separate
    // markRentalDepositReceivedService flow below.
    // =============================================

    const depositAmountPaid =
        Math.max(
            Number(data.depositAmountPaid || 0),
            0
        );

    let depositPaymentStatus =
        String(
            data.depositPaymentStatus || ""
        ).toUpperCase();

    if (
        !["UNPAID", "PARTIAL", "PAID"].includes(
            depositPaymentStatus
        )
    ) {

        if (securityDeposit <= 0) {
            depositPaymentStatus = "PAID";
        } else if (depositAmountPaid >= securityDeposit) {
            depositPaymentStatus = "PAID";
        } else if (depositAmountPaid > 0) {
            depositPaymentStatus = "PARTIAL";
        } else {
            depositPaymentStatus = "UNPAID";
        }
    }

    let depositPaymentMethod =
        String(
            data.depositPaymentMethod || "NONE"
        )
            .trim()
            .toUpperCase();

    const allowedDepositPaymentMethods = [
        "CASH",
        "UPI",
        "CARD",
        "BANK_TRANSFER",
        "ONLINE",
        "NONE"
    ];

    if (
        !allowedDepositPaymentMethods.includes(
            depositPaymentMethod
        )
    ) {
        depositPaymentMethod = "NONE";
    }

    const depositPaymentReference =
        String(
            data.depositPaymentReference || ""
        ).trim();

    const depositPaidAt =
        depositAmountPaid > 0
            ? (data.depositPaidAt
                ? new Date(data.depositPaidAt)
                : new Date())
            : null;

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

            rentalDurationType,

            rentalDuration,

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
                ).trim(),

            // =========================================
            // DEPOSIT — PAID AT CREATION TIME
            // =========================================

            depositPaymentStatus,

            depositPaid:
                depositPaymentStatus === "PAID",

            depositAmountPaid,

            depositPaymentMethod,

            depositPaymentReference,

            depositPaidAt
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

// =====================================================
// MARK SECURITY DEPOSIT RECEIVED
// WALK-IN RENTAL
// =====================================================
//
// ACTIVE rental rahega.
// Stock/inventory change nahi hoga.
//
// Flow:
//
// WALK-IN RENTAL CREATED
//        ↓
// SECURITY DEPOSIT PENDING
//        ↓
// DEPOSIT RECEIVED
//        ↓
// PAYMENT SUCCESS
//
// Existing rental status / inventory / return flow
// is function se change nahi hoga.
// =====================================================

export const markRentalDepositReceivedService = async (
    rentalId,
    data,
    userId
) => {

    console.log(
        "========== MARK RENTAL DEPOSIT RECEIVED =========="
    );

    console.log(
        "RENTAL ID:",
        rentalId
    );

    console.log(
        "DEPOSIT DATA:",
        data
    );

    // =================================================
    // GET RENTAL
    // =================================================

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
    // ONLY WALK-IN RENTAL
    // =================================================

    if (
        String(
            rental.rentalSource || ""
        ).toUpperCase() !== "WALK_IN"
    ) {

        throw new Error(
            "Security deposit receipt is available only for walk-in rentals"
        );
    }

    // =================================================
    // USER
    // =================================================

    const receivedBy =
        userId || null;

    if (!receivedBy) {

        throw new Error(
            "Authenticated user is required to receive security deposit"
        );
    }

    // =================================================
    // PAYMENT METHOD
    // =================================================

    let paymentMethod =
        String(
            data?.paymentMethod ||
            data?.depositPaymentMethod ||
            ""
        )
            .trim()
            .toUpperCase();

    // Common frontend aliases
    if (paymentMethod === "BANK") {
        paymentMethod = "BANK_TRANSFER";
    }

    if (paymentMethod === "BANK TRANSFER") {
        paymentMethod = "BANK_TRANSFER";
    }

    if (paymentMethod === "WALK_IN") {
        paymentMethod = "CASH";
    }

    const allowedPaymentMethods = [
        "CASH",
        "UPI",
        "CARD",
        "BANK_TRANSFER",
        "ONLINE"
    ];

    if (
        !allowedPaymentMethods.includes(
            paymentMethod
        )
    ) {

        throw new Error(
            "Valid deposit payment method is required"
        );
    }

    // =================================================
    // DEPOSIT AMOUNT
    // =================================================

    const securityDeposit =
        Number(
            rental.securityDeposit || 0
        );

    const requestedAmount =
        data?.amount ??
        data?.depositAmount ??
        securityDeposit;

    const depositAmount =
        Number(
            requestedAmount
        );

    if (
        !Number.isFinite(
            depositAmount
        )
    ) {

        throw new Error(
            "Invalid security deposit amount"
        );
    }

    if (
        depositAmount < 0
    ) {

        throw new Error(
            "Security deposit amount cannot be negative"
        );
    }

    // =================================================
    // IMPORTANT
    // =================================================
    //
    // Deposit amount must match rental security deposit.
    //
    // This prevents accidental partial deposit marking.
    //
    // =================================================

    if (
        Number(
            depositAmount.toFixed(2)
        ) !==
        Number(
            securityDeposit.toFixed(2)
        )
    ) {

        throw new Error(
            `Deposit amount must be ₹${securityDeposit.toFixed(2)}`
        );
    }

    // =================================================
    // DUPLICATE CHECK
    // =================================================

    if (
        rental.securityDepositPaymentId
    ) {

        throw new Error(
            "Security deposit has already been received"
        );
    }

    // =================================================
    // SECONDARY DUPLICATE CHECK
    // =================================================
    //
    // In case payment was created previously but
    // rental field was not linked.
    //
    // =================================================

    const existingDeposit =
        await Payment.findOne({

            paymentFor:
                "RENTAL",

            referenceId:
                rental._id,

            paymentType:
                "SECURITY_DEPOSIT",

            paymentStatus:
                PAYMENT_STATUS.SUCCESS,

            isDeleted:
                false

        });

    if (
        existingDeposit
    ) {

        // Link existing payment to rental
        const updatedExisting =
            await updateRentalDB(
                rentalId,
                {
                    securityDepositPaymentId:
                        existingDeposit._id,

                    depositReceived:
                        true,

                    depositReceivedAt:
                        existingDeposit.paidAt ||
                        new Date(),

                    depositReceivedBy:
                        receivedBy,

                    depositPaymentMethod:
                        existingDeposit.paymentMethod
                }
            );

        return await getRentalByIdDB(
            updatedExisting._id
        );
    }

    // =================================================
    // ZERO DEPOSIT
    // =================================================
    //
    // If security deposit is 0, no payment record
    // is necessary.
    //
    // =================================================

    if (
        depositAmount === 0
    ) {

        const updated =
            await updateRentalDB(
                rentalId,
                {
                    depositReceived:
                        true,

                    depositReceivedAt:
                        new Date(),

                    depositReceivedBy:
                        receivedBy,

                    depositPaymentMethod:
                        paymentMethod,

                    securityDepositPaymentId:
                        null
                }
            );

        if (!updated) {

            throw new Error(
                "Failed to mark deposit as received"
            );
        }

        return await getRentalByIdDB(
            rentalId
        );
    }

    // =================================================
    // CREATE PAYMENT
    // =================================================

    let payment = null;

    try {

        payment =
            await createPayment({

                user:
                    receivedBy,

                paymentFor:
                    "RENTAL",

                saleSource:
                    "WALK_IN",

                paymentType:
                    "SECURITY_DEPOSIT",

                referenceId:
                    rental._id,

                amount:
                    depositAmount,

                currency:
                    "INR",

                paymentMethod:
                    paymentMethod,

                paymentStatus:
                    PAYMENT_STATUS.SUCCESS,

                gateway:
                    "OFFLINE",

                transactionId:
                    String(
                        data?.transactionId ||
                        data?.referenceNumber ||
                        ""
                    ).trim(),

                gatewayPaymentId:
                    "",

                gatewayResponse:
                    {},

                paymentDate:
                    new Date(),

                paidAt:
                    new Date()
            });

    } catch (paymentError) {

        console.error(
            "SECURITY DEPOSIT PAYMENT CREATE ERROR:",
            paymentError
        );

        throw new Error(
            paymentError?.message ||
            "Failed to create security deposit payment"
        );
    }

    // =================================================
    // UPDATE RENTAL
    // =================================================

    try {

        const updated =
            await updateRentalDB(
                rentalId,
                {

                    securityDepositPaymentId:
                        payment._id,

                    depositReceived:
                        true,

                    depositReceivedAt:
                        new Date(),

                    depositReceivedBy:
                        receivedBy,

                    depositPaymentMethod:
                        paymentMethod,

                    depositTransactionId:
                        String(
                            data?.transactionId ||
                            data?.referenceNumber ||
                            ""
                        ).trim(),

                    // Keep the "paid at creation" fields in sync
                    // with this later-confirmed deposit too.
                    depositPaymentStatus:
                        "PAID",

                    depositPaid:
                        true,

                    depositAmountPaid:
                        depositAmount,

                    depositPaidAt:
                        new Date()

                }
            );

        if (!updated) {

            throw new Error(
                "Failed to update rental with deposit payment"
            );
        }

        // =================================================
        // FINAL RENTAL
        // =================================================

        const finalRental =
            await getRentalByIdDB(
                rentalId
            );

        console.log(
            "SECURITY DEPOSIT RECEIVED SUCCESSFULLY"
        );

        console.log(
            "PAYMENT ID:",
            payment._id
        );

        console.log(
            "RENTAL ID:",
            rentalId
        );

        return finalRental;

    } catch (rentalUpdateError) {

        console.error(
            "RENTAL DEPOSIT UPDATE ERROR:",
            rentalUpdateError
        );

        // =================================================
        // ROLLBACK PAYMENT
        // =================================================
        //
        // Payment bana but rental update fail hua,
        // to orphan payment nahi chhodenge.
        //
        // =================================================

        if (
            payment?._id
        ) {

            try {

                await Payment.findByIdAndDelete(
                    payment._id
                );

            } catch (deleteError) {

                console.error(
                    "DEPOSIT PAYMENT ROLLBACK ERROR:",
                    deleteError
                );
            }
        }

        throw new Error(
            rentalUpdateError?.message ||
            "Failed to record security deposit"
        );
    }
};


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
// SEARCH RENTALS FOR RETURN
// =====================================================

export const searchRentalsForReturnService = async (
    search
) => {

    const value =
        String(search || "").trim();

    if (!value) {
        throw new Error(
            "Rental number or customer phone is required"
        );
    }

    return await searchActiveRentalsForReturnDB(
        value
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

// export const markRentalReturnedService = async (rentalId, data) => {

//     const rental = await getRentalByIdDB(rentalId);

//     if (!rental) {
//         throw new Error("Rental not found");
//     }

//     // =====================================================
//     // ONLY ACTIVE RENTAL CAN BE RETURNED
//     // =====================================================

//     if (rental.status !== "ACTIVE") {
//         throw new Error("Only active rental can be returned");
//     }

//     // =====================================================
//     // RETURN CONDITION
//     // =====================================================

//     const allowedConditions = [
//         "GOOD",
//         "DAMAGED",
//         "HEAVILY_DAMAGED",
//         "MISSING"
//     ];

//     if (!allowedConditions.includes(data.returnCondition)) {
//         throw new Error("Invalid return condition");
//     }

//     // =====================================================
//     // CHARGES
//     // =====================================================

//     const damageCharges = Number(data.damageCharges || 0);

//     const otherDeductions = Number(data.otherDeductions || 0);

//     if (damageCharges < 0) {
//         throw new Error("Damage charges cannot be negative");
//     }

//     if (otherDeductions < 0) {
//         throw new Error("Other deductions cannot be negative");
//     }

//     // =====================================================
//     // CALCULATE PENDING RENT
//     // =====================================================

//     const monthlyRent = Number(rental.monthlyRent || 0);

//     const gstPercentage = Number(rental.gstPercentage || 0);

//     let pendingRent = Number(data.pendingRent || 0);

//     if (pendingRent < 0) {
//         throw new Error("Pending rent cannot be negative");
//     }

//     // =====================================================
//     // GST ON PENDING RENT
//     // =====================================================

//     const pendingRentGST =
//         Number(
//             (
//                 pendingRent *
//                 gstPercentage /
//                 100
//             ).toFixed(2)
//         );

//     // =====================================================
//     // TOTAL PENDING RENT
//     // =====================================================

//     const totalPendingRent =
//         Number(
//             (
//                 pendingRent +
//                 pendingRentGST
//             ).toFixed(2)
//         );

//     // =====================================================
//     // TOTAL DEDUCTIONS
//     // =====================================================

//     const totalDeductions =
//         Number(
//             (
//                 totalPendingRent +
//                 damageCharges +
//                 otherDeductions
//             ).toFixed(2)
//         );

//     // =====================================================
//     // SECURITY DEPOSIT
//     // =====================================================

//     const securityDeposit =
//         Number(rental.securityDeposit || 0);

//     // =====================================================
//     // CALCULATE REFUND
//     // =====================================================

//     const depositBalance =
//         securityDeposit - totalDeductions;

//     const depositRefundAmount =
//         Math.max(
//             Number(depositBalance.toFixed(2)),
//             0
//         );

//     // =====================================================
//     // EXTRA AMOUNT CUSTOMER HAS TO PAY
//     // =====================================================

//     const extraPayableAmount =
//         Math.max(
//             Number((-depositBalance).toFixed(2)),
//             0
//         );

//     // =====================================================
//     // UPDATE RENTAL
//     // =====================================================

//     const updated = await updateRentalDB(
//         rentalId,
//         {
//             status: "SETTLEMENT_PENDING",

//             actualReturnDate: new Date(),

//             returnCondition: data.returnCondition,

//             damageCharges,

//             otherDeductions,

//             pendingRent,

//             pendingRentGST,

//             totalPendingRent,

//             totalDeductions,

//             depositRefundAmount,

//             extraPayableAmount,

//             depositRefundStatus:
//                 extraPayableAmount > 0
//                     ? "PENDING"
//                     : depositRefundAmount > 0
//                         ? "PENDING"
//                         : "NOT_APPLICABLE"
//         }
//     );

//     // =====================================================
//     // RETURN LAPTOP TO INVENTORY
//     // =====================================================

//     const updatedRentalProduct =
//         await RentalProduct.findOneAndUpdate(
//             {
//                 _id: rental.rentalProductId,
//                 rentedQuantity: { $gt: 0 }
//             },
//             {
//                 $inc: {
//                     availableQuantity: 1,
//                     rentedQuantity: -1
//                 }
//             },
//             {
//                 new: true
//             }
//         );

//     if (!updatedRentalProduct) {

//         throw new Error(
//             "Rental inventory update failed"
//         );
//     }

//     // =====================================================
//     // LOW STOCK NOTIFICATION
//     // =====================================================

//     if (
//         updatedRentalProduct.availableQuantity <= 5
//     ) {

//         try {

//             await notifyAdminsService({
//                 type: "RENTAL_STOCK_LOW",

//                 title: "Rental Stock Low",

//                 message:
//                     `${updatedRentalProduct.productId?.name || "Rental product"} has only ` +
//                     `${updatedRentalProduct.availableQuantity} unit(s) available for rent.`,

//                 relatedId: updatedRentalProduct._id,

//                 relatedModel: "RentalProduct"
//             });

//         } catch (notificationError) {

//             console.error(
//                 "Rental stock notification failed:",
//                 notificationError.message
//             );
//         }
//     }

//     return updated;
// };


// =====================================================
// RECEIVE RENTAL RETURN
// =====================================================
// Customer physically returns laptop
//
// ACTIVE
//   ↓
// SETTLEMENT_PENDING
//
// Stock will NOT be increased here.
// Stock will be increased only after settlement.
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

    // =====================================================
    // ONLY ACTIVE RENTAL
    // =====================================================

    if (rental.status !== "ACTIVE") {

        throw new Error(
            "Only active rental can be returned"
        );
    }

    // =====================================================
    // CONDITION
    // =====================================================

    const returnCondition =
        String(
            data.returnCondition || ""
        )
            .trim()
            .toUpperCase();

    const allowedConditions = [
        "GOOD",
        "DAMAGED",
        "HEAVILY_DAMAGED",
        "MISSING"
    ];

    if (
        !allowedConditions.includes(
            returnCondition
        )
    ) {

        throw new Error(
            "Invalid return condition"
        );
    }

    // =====================================================
    // CHARGES
    // =====================================================

    const pendingRent =
        Number(
            data.pendingRent || 0
        );

    const damageCharges =
        Number(
            data.damageCharges || 0
        );

    const otherDeductions =
        Number(
            data.otherDeductions || 0
        );

    if (pendingRent < 0) {
        throw new Error(
            "Pending rent cannot be negative"
        );
    }

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

    // =====================================================
    // GST
    // =====================================================

    const gstPercentage =
        Number(
            rental.gstPercentage || 0
        );

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
        Number(
            rental.securityDeposit || 0
        );

    // =====================================================
    // DEPOSIT BALANCE
    // =====================================================

    const depositBalance =
        Number(
            (
                securityDeposit -
                totalDeductions
            ).toFixed(2)
        );

    // =====================================================
    // REFUND
    // =====================================================

    const depositRefundAmount =
        Math.max(
            depositBalance,
            0
        );

    // =====================================================
    // EXTRA PAYMENT
    // =====================================================

    const extraPayableAmount =
        Math.max(
            -depositBalance,
            0
        );

    // =====================================================
    // REFUND STATUS
    // =====================================================

    let depositRefundStatus =
        "NOT_APPLICABLE";

    let settlementStatus =
        "PENDING";

    if (depositRefundAmount > 0) {

        depositRefundStatus =
            "PENDING";

        settlementStatus =
            "PENDING";

    } else if (extraPayableAmount > 0) {

        depositRefundStatus =
            "NOT_APPLICABLE";

        settlementStatus =
            "EXTRA_PAYMENT_PENDING";

    }

    // =====================================================
    // UPDATE RENTAL
    // =====================================================

    const updated =
        await updateRentalDB(
            rentalId,
            {
                status:
                    "SETTLEMENT_PENDING",

                actualReturnDate:
                    new Date(),

                returnCondition,

                damageCharges,

                otherDeductions,

                pendingRent,

                pendingRentGST,

                totalPendingRent,

                totalDeductions,

                depositRefundAmount,

                extraPayableAmount,

                depositRefundStatus,

                settlementStatus
            }
        );

    if (!updated) {

        throw new Error(
            "Failed to update rental return"
        );
    }

    // =====================================================
    // IMPORTANT
    // =====================================================
    //
    // DO NOT increase rental stock here.
    //
    // Laptop is physically received, but settlement
    // is still pending.
    //
    // Stock will become available after:
    //
    // SETTLEMENT → COMPLETED
    //
    // =====================================================

    return updated;
};



// =====================================================
// COMPLETE RENTAL SETTLEMENT
// =====================================================
// SETTLEMENT_PENDING
//        ↓
// SETTLED
//        ↓
// COMPLETED
//        ↓
// Rental stock AVAILABLE
// =====================================================

export const completeRentalSettlementService = async (
    rentalId,
    data,
    userId
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

    // =====================================================
    // STATUS CHECK
    // =====================================================

    if (
        rental.status !==
        "SETTLEMENT_PENDING"
    ) {

        throw new Error(
            "Rental is not waiting for settlement"
        );
    }

    // =====================================================
    // AMOUNTS
    // =====================================================

    const refundAmount =
        Number(
            rental.depositRefundAmount || 0
        );

    const extraPayableAmount =
        Number(
            rental.extraPayableAmount || 0
        );

    const settlementAmountReceived =
        Number(
            data.settlementAmountReceived || 0
        );

    if (
        settlementAmountReceived < 0
    ) {

        throw new Error(
            "Settlement amount cannot be negative"
        );
    }

    // =====================================================
    // IF EXTRA PAYMENT REQUIRED
    // =====================================================

    if (
        extraPayableAmount > 0 &&
        settlementAmountReceived <
        extraPayableAmount
    ) {

        throw new Error(
            `Customer must pay ₹${extraPayableAmount.toFixed(2)} before completing settlement`
        );
    }

    // =====================================================
    // PAYMENT METHOD
    // =====================================================

    const paymentMethod =
        String(
            data.settlementPaymentMethod ||
            "NONE"
        )
            .trim()
            .toUpperCase();

    const allowedPaymentMethods = [
        "CASH",
        "UPI",
        "CARD",
        "BANK_TRANSFER",
        "ONLINE",
        "NONE"
    ];

    if (
        !allowedPaymentMethods.includes(
            paymentMethod
        )
    ) {

        throw new Error(
            "Invalid settlement payment method"
        );
    }

    // =====================================================
    // REFUND
    // =====================================================

    let finalRefundStatus =
        "NOT_APPLICABLE";

    if (refundAmount > 0) {

        finalRefundStatus =
            "REFUNDED";
    }

    // =====================================================
    // UPDATE RENTAL SETTLEMENT
    // =====================================================

    const updated =
        await updateRentalDB(
            rentalId,
            {
                status:
                    "COMPLETED",

                settlementStatus:
                    "SETTLED",

                settlementPaymentMethod:
                    paymentMethod,

                settlementAmountReceived,

                settlementReference:
                    String(
                        data.settlementReference ||
                        ""
                    ).trim(),

                settlementNotes:
                    String(
                        data.settlementNotes ||
                        ""
                    ).trim(),

                settledAt:
                    new Date(),

                settledBy:
                    userId || null,

                depositRefundStatus:
                    finalRefundStatus
            }
        );

    if (!updated) {

        throw new Error(
            "Failed to complete settlement"
        );
    }

    // =====================================================
    // NOW RETURN LAPTOP TO RENTAL INVENTORY
    // =====================================================

    const updatedRentalProduct =
        await RentalProduct.findOneAndUpdate(
            {
                _id:
                    rental.rentalProductId,

                rentedQuantity: {
                    $gt: 0
                }
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

        // Try to prevent silent completion
        await updateRentalDB(
            rentalId,
            {
                status:
                    "SETTLEMENT_PENDING",

                settlementStatus:
                    "PENDING",

                settledAt:
                    null,

                settledBy:
                    null
            }
        );

        throw new Error(
            "Rental inventory update failed. Rental was not completed."
        );
    }

    // =====================================================
    // RETURN STOCK NOTIFICATION
    // =====================================================

    if (
        updatedRentalProduct.availableQuantity <= 5
    ) {

        try {

            await notifyAdminsService({

                type:
                    "RENTAL_STOCK_LOW",

                title:
                    "Rental Stock Low",

                message:
                    `Rental stock is low. Only ${updatedRentalProduct.availableQuantity} unit(s) available.`,

                relatedId:
                    updatedRentalProduct._id,

                relatedModel:
                    "RentalProduct"
            });

        } catch (notificationError) {

            console.error(
                "Rental stock notification failed:",
                notificationError.message
            );
        }
    }

    // =====================================================
    // FINAL RENTAL
    // =====================================================

    return await getRentalByIdDB(
        rentalId
    );
};