import mongoose from "mongoose";

import Rental from "./rental.model.js";
import RentalPayment from "./rentalPayment.model.js";

import { createPayment } from "../payments/payment.service.js";
import { PAYMENT_STATUS } from "../../common/constants/paymentStatus.js";

import {
    ALLOWED_PAYMENT_METHODS,
    COMPANY_MIN_MONTHS,
    RENT_PAYMENT_TYPE,
    normalizePaymentMethod,
    round2
} from "../../common/constants/rental.constants.js";

// =====================================================
// CONSTANTS
// =====================================================

const OPEN_STATUSES = ["PENDING", "PARTIAL"];

const CLOSED_STATUSES = [
    "PAID",
    "CANCELLED",
    "ADJUSTED"
];

const PAYMENT_TOLERANCE = 0.005;

// =====================================================
// DATE HELPERS
// =====================================================

// Jan 31 + 1 month = Feb 28/29
// Month overflow avoid karta hai.
export const addMonths = (date, months) => {
    const d = new Date(date);
    const day = d.getDate();

    d.setDate(1);
    d.setMonth(d.getMonth() + Number(months));

    const lastDay = new Date(
        d.getFullYear(),
        d.getMonth() + 1,
        0
    ).getDate();

    d.setDate(Math.min(day, lastDay));

    return d;
};

export const addDays = (date, days) => {
    const d = new Date(date);
    d.setDate(d.getDate() + Number(days));
    return d;
};

const startOfToday = () => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
};

// =====================================================
// SAFE AMOUNT HELPERS
// =====================================================

const toAmount = (value) => {
    const n = Number(value ?? 0);
    return Number.isFinite(n) ? round2(n) : 0;
};

const sumAmounts = (items, field) => {
    return round2(
        items.reduce(
            (sum, item) => sum + toAmount(item[field]),
            0
        )
    );
};

// =====================================================
// BUILD SCHEDULE
//
// MONTHS:
// Har month ka alag installment.
//
// DAYS:
// Poore rental period ka ek installment.
// =====================================================

export const buildScheduleDefinitions = ({
    startDate,
    rentalDurationType,
    rentalDuration,
    monthlyRent,
    gstPercentage
}) => {
    // const gst = Number(gstPercentage || 0);

    const gst = Number(gstPercentage ?? 0);
    const duration = Number(rentalDuration);
    const rent = Number(monthlyRent);

    if (
        !startDate ||
        Number.isNaN(new Date(startDate).getTime())
    ) {
        throw new Error("Valid rental start date is required");
    }

 if (
    rentalDurationType !== "MONTHS" ||
    !Number.isInteger(duration) ||
    duration < 3
) {
    throw new Error(
        "Rental must be in MONTHS with minimum 3 months"
    );
}

    if (
        !Number.isFinite(rent) ||
        rent < 0
    ) {
        throw new Error("Invalid monthly rent");
    }

    if (
        !Number.isFinite(gst) ||
        gst < 0
    ) {
        throw new Error("Invalid GST percentage");
    }

    const defs = [];

    // -------------------------------------------------
    // MONTHLY RENTAL
    // -------------------------------------------------

    if (rentalDurationType === "MONTHS") {
        for (let i = 0; i < duration; i++) {
            const rentAmount = round2(rent);

            const gstAmount = round2(
                (rentAmount * gst) / 100
            );

            defs.push({
                installmentNumber: i + 1,
                totalInstallments: duration,

                periodStart: addMonths(startDate, i),

                periodEnd: addMonths(
                    startDate,
                    i + 1
                ),

                dueDate: addMonths(startDate, i),

                rentAmount,
                gstAmount,

                totalAmount: round2(
                    rentAmount + gstAmount
                )
            });
        }

        return defs;
    }

    // -------------------------------------------------
    // DAILY RENTAL
    // -------------------------------------------------

    if (rentalDurationType === "DAYS") {
        const rentAmount = round2(
            (rent / 30) * duration
        );

        const gstAmount = round2(
            (rentAmount * gst) / 100
        );

        defs.push({
            installmentNumber: 1,
            totalInstallments: 1,

            periodStart: new Date(startDate),

            periodEnd: addDays(
                startDate,
                duration
            ),

            dueDate: new Date(startDate),

            rentAmount,
            gstAmount,

            totalAmount: round2(
                rentAmount + gstAmount
            )
        });

        return defs;
    }

    throw new Error(
        "Rental duration type must be DAYS or MONTHS"
    );
};

// =====================================================
// DECORATE INSTALLMENT
//
// UI ke liye extra fields.
// =====================================================

export const decorateInstallment = (installment) => {
    if (!installment) {
        return null;
    }

    const o =
        typeof installment.toObject === "function"
            ? installment.toObject()
            : { ...installment };

    const closed = CLOSED_STATUSES.includes(
        o.status
    );

    const remainingAmount = closed
        ? 0
        : round2(
            Math.max(
                0,
                toAmount(o.totalAmount) -
                    toAmount(o.paidAmount)
            )
        );

    const today = startOfToday();

    const dueDay = new Date(o.dueDate);
    dueDay.setHours(0, 0, 0, 0);

    let displayStatus = o.status;

    if (OPEN_STATUSES.includes(o.status)) {
        if (dueDay < today) {
            displayStatus = "OVERDUE";
        } else if (
            dueDay.getTime() === today.getTime()
        ) {
            displayStatus = "DUE_TODAY";
        } else {
            displayStatus =
                o.status === "PARTIAL"
                    ? "PARTIAL"
                    : "UPCOMING";
        }
    }

    return {
        ...o,
        remainingAmount,
        displayStatus,
        isOverdue: displayStatus === "OVERDUE"
    };
};

// =====================================================
// BUILD SCHEDULE SUMMARY
// =====================================================

const buildSummary = (decorated) => {
    const active = decorated.filter(
        (i) => i.status !== "CANCELLED"
    );

    const open = decorated.filter(
        (i) => OPEN_STATUSES.includes(i.status)
    );

    const overdue = open.filter(
        (i) => i.isOverdue
    );

    const nextDue =
        [...open].sort(
            (a, b) =>
                new Date(a.dueDate) -
                new Date(b.dueDate)
        )[0] || null;

    const totalRent = sumAmounts(
        active,
        "totalAmount"
    );

    const totalPaid = sumAmounts(
        decorated,
        "paidAmount"
    );

    const totalPending = sumAmounts(
        open,
        "remainingAmount"
    );

    const overdueAmount = sumAmounts(
        overdue,
        "remainingAmount"
    );

    return {
        totalInstallments: active.length,

        paidCount: decorated.filter(
            (i) => i.status === "PAID"
        ).length,

        overdueCount: overdue.length,

        totalRent,
        totalPaid,
        totalPending,
        overdueAmount,

        nextDueDate: nextDue
            ? nextDue.dueDate
            : null,

        nextDueAmount: nextDue
            ? nextDue.remainingAmount
            : 0
    };
};

// =====================================================
// SYNC RENTAL PAYMENT FIELDS
//
// IMPORTANT FIX:
//
// Earlier only counters and dates were updated.
//
// Now updates:
// rentSubtotal
// rentGstAmount
// rentTotalAmount
// rentPaidAmount
// rentBalanceAmount
// rentPaymentStatus
//
// Deposit payments are NOT included in rent paid.
// =====================================================

export const syncRentalPaymentFields = async (
    rentalId
) => {
    if (!mongoose.isValidObjectId(rentalId)) {
        throw new Error("Invalid rental ID");
    }

    const rental = await Rental.findById(rentalId);

    if (!rental) {
        throw new Error("Rental not found");
    }

    const installments = await RentalPayment
        .find({ rentalId })
        .sort({
            installmentNumber: 1,
            dueDate: 1
        });

    // -------------------------------------------------
    // NO SCHEDULE FOUND
    //
    // Existing rental summary preserve karo.
    // -------------------------------------------------

    if (!installments.length) {
        return rental;
    }

    // -------------------------------------------------
    // ACTIVE INSTALLMENTS
    //
    // CANCELLED installment ka unpaid portion
    // payable nahi hai.
    //
    // ADJUSTED installment ke unpaid portion ko
    // settlement mein handle kiya gaya hai.
    // -------------------------------------------------

    const active = installments.filter(
        (i) => i.status !== "CANCELLED"
    );

    const paidInstallments = installments.filter(
        (i) => i.status === "PAID"
    ).length;

    // -------------------------------------------------
    // RENT TOTALS
    // -------------------------------------------------

    const rentSubtotal = sumAmounts(
        active,
        "rentAmount"
    );

    const rentGstAmount = sumAmounts(
        active,
        "gstAmount"
    );

    const rentTotalAmount = sumAmounts(
        active,
        "totalAmount"
    );

    // Count actual collected rent, not security deposit.
    const rentPaidAmount = sumAmounts(
        installments,
        "paidAmount"
    );

    // -------------------------------------------------
    // OUTSTANDING INSTALLMENTS
    // -------------------------------------------------

    const open = installments.filter(
        (i) => OPEN_STATUSES.includes(i.status)
    );

    const nextUnpaid =
        [...open].sort(
            (a, b) =>
                new Date(a.dueDate) -
                new Date(b.dueDate)
        )[0] || null;

    const rentBalanceAmount = round2(
        Math.max(
            0,
            rentTotalAmount - rentPaidAmount
        )
    );

    // -------------------------------------------------
    // PAYMENT STATUS
    //
    // PAID:
    // Entire payable rent received in cash/bank/UPI.
    //
    // PARTIAL:
    // Some rent received.
    //
    // PENDING:
    // No rent received.
    //
    // NOTE:
    // Settlement adjustment is not treated as
    // an actual rent payment.
    // -------------------------------------------------

    let rentPaymentStatus = "PENDING";

    if (
        rentTotalAmount > 0 &&
        rentBalanceAmount <= PAYMENT_TOLERANCE
    ) {
        rentPaymentStatus = "PAID";
    } else if (rentPaidAmount > 0) {
        rentPaymentStatus = "PARTIAL";
    }

    // -------------------------------------------------
    // LAST PAYMENT DATE
    // -------------------------------------------------

    const paidDates = installments
        .flatMap((i) =>
            (i.payments || [])
                .map((p) =>
                    new Date(p.paidAt).getTime()
                )
                .filter(Number.isFinite)
        )
        .sort((a, b) => b - a);

    const lastPaymentDate = paidDates.length
        ? new Date(paidDates[0])
        : null;

    // -------------------------------------------------
    // UPDATE RENTAL DOCUMENT
    // -------------------------------------------------

    const updatedRental =
        await Rental.findByIdAndUpdate(
            rentalId,
            {
                $set: {
                    totalInstallments: active.length,

                    paidInstallments,

                    nextPaymentDate: nextUnpaid
                        ? nextUnpaid.dueDate
                        : null,

                    lastPaymentDate,

                    rentSubtotal,
                    rentGstAmount,
                    rentTotalAmount,
                    rentPaidAmount,
                    rentBalanceAmount,
                    rentPaymentStatus
                }
            },
            {
                new: true,
                runValidators: true
            }
        );

    return updatedRental;
};

// =====================================================
// GET RENTAL PAYMENT SCHEDULE
// =====================================================

export const getRentalPaymentScheduleService =
    async (rentalId) => {
        if (!mongoose.isValidObjectId(rentalId)) {
            throw new Error("Invalid rental ID");
        }

        const rental = await Rental
            .findById(rentalId)
            .select(
                [
                    "rentalNumber",
                    "orderId",
                    "customerType",
                    "rentalDurationType",
                    "rentalDuration",
                    "monthlyRent",
                    "gstPercentage",

                    "originalMonthlyRent",
                    "pricingType",
                    "billingType",
                    "negotiationReason",
                    
                    "startDate",
                    "expectedEndDate",
                    "status",
                    "rentSubtotal",
                    "rentGstAmount",
                    "rentTotalAmount",
                    "rentPaidAmount",
                    "rentBalanceAmount",
                    "rentPaymentStatus",
                    "totalInstallments",
                    "paidInstallments",
                    "nextPaymentDate",
                    "lastPaymentDate"
                ].join(" ")
            );

        if (!rental) {
            throw new Error("Rental not found");
        }

        const installments =
            await RentalPayment
                .find({ rentalId })
                .populate(
                    "payments.receivedBy",
                    "name"
                )
                .sort({
                    installmentNumber: 1
                });

        const decorated = installments.map(
            decorateInstallment
        );

        return {
            rental,
            installments: decorated,
            summary: buildSummary(decorated)
        };
    };

// =====================================================
// RECORD INSTALLMENT PAYMENT
//
// Supports:
// Full payment
// Partial payment
// Cash
// UPI
// Card
// Bank transfer
// Payment history
// Accounting Payment record
// =====================================================

export const recordRentalInstallmentPaymentService =
    async (
        installmentId,
        data = {},
        userId = null
    ) => {
        // ---------------------------------------------
        // VALIDATE INSTALLMENT ID
        // ---------------------------------------------

        if (
            !mongoose.isValidObjectId(
                installmentId
            )
        ) {
            throw new Error(
                "Invalid installment ID"
            );
        }

        const installment =
            await RentalPayment.findById(
                installmentId
            );

        if (!installment) {
            throw new Error(
                "Rent installment not found"
            );
        }

        // ---------------------------------------------
        // STATUS CHECK
        // ---------------------------------------------

        if (
            !OPEN_STATUSES.includes(
                installment.status
            )
        ) {
            throw new Error(
                `This installment is already ${installment.status.toLowerCase()}`
            );
        }

        // ---------------------------------------------
        // RENTAL CHECK
        // ---------------------------------------------

        const rental = await Rental.findById(
            installment.rentalId
        );

        if (!rental) {
            throw new Error(
                "Rental not found"
            );
        }

        if (rental.status !== "ACTIVE") {
            throw new Error(
                "Rent can be collected only for an active rental"
            );
        }

        // ---------------------------------------------
        // PAYMENT METHOD
        // ---------------------------------------------

        const paymentMethod =
            normalizePaymentMethod(
                data.paymentMethod
            );

        if (
            !ALLOWED_PAYMENT_METHODS.includes(
                paymentMethod
            )
        ) {
            throw new Error(
                "Valid payment method is required"
            );
        }

        // ---------------------------------------------
        // REMAINING AMOUNT
        // ---------------------------------------------

        const remaining = round2(
            installment.totalAmount -
                installment.paidAmount
        );

        // ---------------------------------------------
        // PAYMENT AMOUNT
        // ---------------------------------------------

        const amount = round2(
            data.amount === undefined ||
            data.amount === null ||
            data.amount === ""
                ? remaining
                : Number(data.amount)
        );

        if (
            !Number.isFinite(amount) ||
            amount <= 0
        ) {
            throw new Error(
                "Payment amount must be greater than 0"
            );
        }

        if (
            amount >
            remaining + PAYMENT_TOLERANCE
        ) {
            throw new Error(
                `Amount cannot be more than remaining ₹${remaining.toFixed(2)}`
            );
        }

        // ---------------------------------------------
        // PAYMENT REFERENCE
        // ---------------------------------------------

        const reference = String(
            data.reference ||
                data.transactionId ||
                ""
        ).trim();

        if (
            paymentMethod !== "CASH" &&
            !reference
        ) {
            throw new Error(
                "Payment reference / transaction number is required"
            );
        }

        // ---------------------------------------------
        // PAYMENT DATE
        // ---------------------------------------------

        const paidAt = data.paidAt
            ? new Date(data.paidAt)
            : new Date();

        if (
            Number.isNaN(
                paidAt.getTime()
            )
        ) {
            throw new Error(
                "Invalid payment date"
            );
        }

        if (
            paidAt.getTime() >
            Date.now() + 5 * 60 * 1000
        ) {
            throw new Error(
                "Payment date cannot be in the future"
            );
        }

        // ---------------------------------------------
        // ATOMIC INSTALLMENT UPDATE
        // ---------------------------------------------

        const newPaid = round2(
            installment.paidAmount + amount
        );

        const fullyPaid =
            newPaid >=
            installment.totalAmount -
                PAYMENT_TOLERANCE;

        const entryId =
            new mongoose.Types.ObjectId();

        const set = {
            paidAmount: fullyPaid
                ? installment.totalAmount
                : newPaid,

            status: fullyPaid
                ? "PAID"
                : "PARTIAL"
        };

        if (fullyPaid) {
            set.paidAt = paidAt;
        }

        const updated =
            await RentalPayment.findOneAndUpdate(
                {
                    _id: installment._id,

                    status: {
                        $in: OPEN_STATUSES
                    },

                    paidAmount:
                        installment.paidAmount
                },
                {
                    $set: set,

                    $push: {
                        payments: {
                            _id: entryId,
                            amount,
                            paymentMethod,
                            reference,
                            paidAt,
                            receivedBy:
                                userId || null
                        }
                    }
                },
                {
                    new: true,
                    runValidators: true
                }
            );

        if (!updated) {
            throw new Error(
                "This installment was just updated by someone else. Please refresh and try again."
            );
        }

        // ---------------------------------------------
        // ACCOUNTING PAYMENT RECORD
        //
        // Preserve original behavior:
        // If accounting record fails, installment
        // remains recorded.
        // ---------------------------------------------

        try {
            const payment =
                await createPayment({
                    user: userId,

                    paymentFor: "RENTAL",

                    saleSource:
                        rental.rentalSource ||
                        "WALK_IN",

                    paymentType:
                        RENT_PAYMENT_TYPE,

                    referenceId:
                        rental._id,

                    amount,

                    currency: "INR",

                    paymentMethod,

                    paymentStatus:
                        PAYMENT_STATUS.SUCCESS,

                    gateway: "OFFLINE",

                    transactionId:
                        reference,

                    gatewayPaymentId: "",

                    gatewayResponse: {},

                    paymentDate: paidAt,

                    paidAt
                });

            if (payment?._id) {
                await RentalPayment.updateOne(
                    {
                        _id: updated._id,
                        "payments._id": entryId
                    },
                    {
                        $set: {
                            "payments.$.paymentId":
                                payment._id
                        }
                    }
                );
            }
        } catch (paymentError) {
            console.warn(
                "RENT PAYMENT RECORD (Payment collection) FAILED:",
                paymentError?.message
            );
        }

        // ---------------------------------------------
        // IMPORTANT: SYNC RENTAL PAYMENT SUMMARY
        // ---------------------------------------------

        await syncRentalPaymentFields(
            rental._id
        );

        // ---------------------------------------------
        // RETURN FRESH INSTALLMENT
        // ---------------------------------------------

        const fresh =
            await RentalPayment
                .findById(updated._id)
                .populate(
                    "payments.receivedBy",
                    "name"
                );

        return decorateInstallment(fresh);
    };

// =====================================================
// GET OVERDUE / UPCOMING INSTALLMENTS
//
// overdue:
// Due date already passed.
//
// upcoming:
// Today + next 7 days.
// =====================================================

export const getDueInstallmentsService =
    async (scope = "overdue") => {
        const today = startOfToday();

        const dueFilter =
            scope === "upcoming"
                ? {
                    $gte: today,
                    $lt: addDays(today, 8)
                }
                : {
                    $lt: today
                };

        const installments =
            await RentalPayment
                .find({
                    status: {
                        $in: OPEN_STATUSES
                    },

                    dueDate: dueFilter
                })
                .populate({
                    path: "rentalId",

                    select:
                        "rentalNumber customerType individualDetails companyDetails status rentalSource",

                    match: {
                        status: "ACTIVE"
                    }
                })
                .sort({
                    dueDate: 1
                });

        return installments
            .filter((i) => i.rentalId)
            .map((i) => {
                const d =
                    decorateInstallment(i);

                return {
                    ...d,
                    rental: d.rentalId
                };
            });
    };

// =====================================================
// CALCULATE RETURN DUES
//
// Pending rent:
// 1. Already due installments
// 2. COMPANY compulsory first months
//
// Future installments may be cancelled.
// =====================================================

// export const calculateReturnDues = async (
//     rental,
//     returnDate = new Date()
// ) => {
//     const open =
//         await RentalPayment
//             .find({
//                 rentalId: rental._id,

//                 status: {
//                     $in: OPEN_STATUSES
//                 }
//             })
//             .sort({
//                 installmentNumber: 1
//             });

//     const isCompany =
//         rental.customerType === "COMPANY";

//     let pendingRent = 0;

//     const collectIds = [];
//     const cancelIds = [];

//     for (const inst of open) {
//         const compulsory =
//             isCompany &&
//             inst.installmentNumber <=
//                 COMPANY_MIN_MONTHS;

//         const isDue =
//             new Date(inst.dueDate) <=
//             new Date(returnDate);

//         if (compulsory || isDue) {
//             const unpaidTotal = Math.max(
//                 0,
//                 toAmount(inst.totalAmount) -
//                     toAmount(inst.paidAmount)
//             );

//             const ratio =
//                 inst.totalAmount > 0
//                     ? unpaidTotal /
//                       inst.totalAmount
//                     : 0;

//             pendingRent +=
//                 toAmount(inst.rentAmount) *
//                 ratio;

//             collectIds.push(
//                 inst._id
//             );
//         } else {
//             cancelIds.push(
//                 inst._id
//             );
//         }
//     }

//     return {
//         pendingRent: round2(
//             pendingRent
//         ),

//         collectIds,
//         cancelIds
//     };
// };


// =====================================================
// CALCULATE RETURN DUES
// GST and rent calculated separately.
// Paid amounts are never counted twice.
// =====================================================

export const calculateReturnDues = async (
    rental,
    returnDate = new Date()
) => {
    const open = await RentalPayment.find({
        rentalId: rental._id,
        status: {
            $in: OPEN_STATUSES
        }
    }).sort({
        installmentNumber: 1
    });

    const isCompany =
        rental.customerType === "COMPANY";

    let pendingRent = 0;
    let pendingRentGST = 0;

    const collectIds = [];
    const cancelIds = [];

    for (const inst of open) {
        const compulsory =
            isCompany &&
            inst.installmentNumber <= COMPANY_MIN_MONTHS;

        const isDue =
            new Date(inst.dueDate) <= new Date(returnDate);

        if (!compulsory && !isDue) {
            cancelIds.push(inst._id);
            continue;
        }

        const totalAmount =
            toAmount(inst.totalAmount);

        const paidAmount =
            toAmount(inst.paidAmount);

        const unpaidAmount = round2(
            Math.max(0, totalAmount - paidAmount)
        );

        if (unpaidAmount <= PAYMENT_TOLERANCE) {
            continue;
        }

        // Split outstanding total into rent and GST
        // proportionally, including partial payments.
        const rentAmount =
            toAmount(inst.rentAmount);

        const gstAmount =
            toAmount(inst.gstAmount);

        let unpaidRent = 0;
        let unpaidGst = 0;

        if (totalAmount > 0) {
            unpaidRent = round2(
                unpaidAmount *
                (rentAmount / totalAmount)
            );

            // Remainder assigned to GST so totals match.
            unpaidGst = round2(
                unpaidAmount - unpaidRent
            );
        }

        pendingRent = round2(
            pendingRent + unpaidRent
        );

        pendingRentGST = round2(
            pendingRentGST + unpaidGst
        );

        collectIds.push(inst._id);
    }

    return {
        pendingRent: round2(pendingRent),

        pendingRentGST: round2(
            pendingRentGST
        ),

        totalPendingRent: round2(
            pendingRent + pendingRentGST
        ),

        collectIds,
        cancelIds
    };
};
// =====================================================
// CANCEL INSTALLMENTS
// =====================================================

export const cancelInstallments = async (
    ids,
    note = ""
) => {
    if (
        !Array.isArray(ids) ||
        !ids.length
    ) {
        return;
    }

    await RentalPayment.updateMany(
        {
            _id: {
                $in: ids
            },

            status: {
                $in: OPEN_STATUSES
            }
        },
        {
            $set: {
                status: "CANCELLED",
                notes: note
            }
        }
    );
};

// =====================================================
// ADJUST REMAINING INSTALLMENTS
//
// Return settlement ke time open installments
// ADJUSTED ho jaate hain.
//
// NOTE:
// ADJUSTED does not automatically mean
// actual cash rent was collected.
// =====================================================

export const adjustRemainingInstallments =
    async (rentalId) => {
        await RentalPayment.updateMany(
            {
                rentalId,

                status: {
                    $in: OPEN_STATUSES
                }
            },
            {
                $set: {
                    status: "ADJUSTED",

                    notes:
                        "Settled during return settlement"
                }
            }
        );

        // Refresh rental-level totals and status.
        await syncRentalPaymentFields(
            rentalId
        );
    };

// =====================================================
// GET RETURN PREVIEW
//
// Returns:
// Pending rent
// Held deposit
// Security deposit
// GST
// Customer type
// Rental status
// =====================================================

export const getReturnPreviewService =
    async (rentalId) => {
        if (
            !mongoose.isValidObjectId(
                rentalId
            )
        ) {
            throw new Error(
                "Invalid rental ID"
            );
        }

        const rental =
            await Rental.findById(
                rentalId
            );

        if (!rental) {
            throw new Error(
                "Rental not found"
            );
        }

        const dues =
            await calculateReturnDues(
                rental,
                new Date()
            );

        const heldDeposit = round2(
            Math.min(
                Number(
                    rental.depositAmountPaid ||
                        0
                ),

                Number(
                    rental.securityDeposit ||
                        0
                )
            )
        );

        return {
            pendingRent:
                dues.pendingRent,

                pendingRentGST:
    dues.pendingRentGST,

totalPendingRent:
    dues.totalPendingRent,

            heldDeposit,

            securityDeposit:
                round2(
                    rental.securityDeposit ||
                        0
                ),

            gstPercentage:
                Number(
                    rental.gstPercentage ||
                        0
                ),

            customerType:
                rental.customerType,

            status:
                rental.status
        };
    };