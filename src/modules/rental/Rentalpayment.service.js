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
// DATE HELPERS
// =====================================================

// Jan 31 + 1 month = Feb 28/29 (overflow nahi hoga)
export const addMonths = (date, months) => {

    const d = new Date(date);
    const day = d.getDate();

    d.setDate(1);
    d.setMonth(d.getMonth() + months);

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
    d.setDate(d.getDate() + days);
    return d;
};

const startOfToday = () => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
};

const OPEN_STATUSES = ["PENDING", "PARTIAL"];


// =====================================================
// BUILD SCHEDULE
// MONTHS -> har month ka alag installment
// DAYS   -> poore rent ka 1 installment (start par due)
// =====================================================

export const buildScheduleDefinitions = ({
    startDate,
    rentalDurationType,
    rentalDuration,
    monthlyRent,
    gstPercentage
}) => {

    const gst = Number(gstPercentage || 0);
    const defs = [];

    if (rentalDurationType === "MONTHS") {

        const count = Number(rentalDuration);

        for (let i = 0; i < count; i++) {

            const rentAmount = round2(monthlyRent);
            const gstAmount = round2((rentAmount * gst) / 100);

            defs.push({
                installmentNumber: i + 1,
                totalInstallments: count,
                periodStart: addMonths(startDate, i),
                periodEnd: addMonths(startDate, i + 1),
                dueDate: addMonths(startDate, i),
                rentAmount,
                gstAmount,
                totalAmount: round2(rentAmount + gstAmount)
            });
        }

        return defs;
    }

    // DAYS
    const days = Number(rentalDuration);
    const rentAmount = round2((monthlyRent / 30) * days);
    const gstAmount = round2((rentAmount * gst) / 100);

    defs.push({
        installmentNumber: 1,
        totalInstallments: 1,
        periodStart: new Date(startDate),
        periodEnd: addDays(startDate, days),
        dueDate: new Date(startDate),
        rentAmount,
        gstAmount,
        totalAmount: round2(rentAmount + gstAmount)
    });

    return defs;
};


// =====================================================
// DECORATE (UI ke liye extra fields)
// =====================================================

export const decorateInstallment = (installment) => {

    const o = installment.toObject
        ? installment.toObject()
        : { ...installment };

    const closed = ["CANCELLED", "ADJUSTED", "PAID"].includes(o.status);

    const remainingAmount = closed
        ? 0
        : round2(o.totalAmount - o.paidAmount);

    const today = startOfToday();
    const due = new Date(o.dueDate);
    const dueDay = new Date(due);
    dueDay.setHours(0, 0, 0, 0);

    let displayStatus = o.status;

    if (OPEN_STATUSES.includes(o.status)) {

        if (dueDay < today) {
            displayStatus = "OVERDUE";
        } else if (dueDay.getTime() === today.getTime()) {
            displayStatus = "DUE_TODAY";
        } else {
            displayStatus = o.status === "PARTIAL" ? "PARTIAL" : "UPCOMING";
        }
    }

    return {
        ...o,
        remainingAmount,
        displayStatus,
        isOverdue: displayStatus === "OVERDUE"
    };
};

const buildSummary = (decorated) => {

    const active = decorated.filter(
        (i) => i.status !== "CANCELLED"
    );

    const open = decorated.filter(
        (i) => OPEN_STATUSES.includes(i.status)
    );

    const overdue = open.filter((i) => i.isOverdue);

    const nextDue = open[0] || null;

    return {
        totalInstallments: active.length,
        paidCount: decorated.filter((i) => i.status === "PAID").length,
        overdueCount: overdue.length,

        totalRent: round2(active.reduce((s, i) => s + i.totalAmount, 0)),
        totalPaid: round2(active.reduce((s, i) => s + i.paidAmount, 0)),
        totalPending: round2(open.reduce((s, i) => s + i.remainingAmount, 0)),
        overdueAmount: round2(overdue.reduce((s, i) => s + i.remainingAmount, 0)),

        nextDueDate: nextDue ? nextDue.dueDate : null,
        nextDueAmount: nextDue ? nextDue.remainingAmount : 0
    };
};


// =====================================================
// SYNC RENTAL COUNTERS
// =====================================================

export const syncRentalPaymentFields = async (rentalId) => {

    const installments = await RentalPayment
        .find({ rentalId })
        .sort({ installmentNumber: 1 });

    const active = installments.filter((i) => i.status !== "CANCELLED");

    const paidInstallments = installments.filter(
        (i) => i.status === "PAID"
    ).length;

    const nextUnpaid = installments.find(
        (i) => OPEN_STATUSES.includes(i.status)
    );

    const paidDates = installments
        .flatMap((i) => i.payments.map((p) => new Date(p.paidAt).getTime()))
        .sort((a, b) => b - a);

    await Rental.findByIdAndUpdate(rentalId, {
        $set: {
            totalInstallments: active.length,
            paidInstallments,
            nextPaymentDate: nextUnpaid ? nextUnpaid.dueDate : null,
            lastPaymentDate: paidDates.length ? new Date(paidDates[0]) : null
        }
    });
};


// =====================================================
// GET SCHEDULE
// =====================================================

export const getRentalPaymentScheduleService = async (rentalId) => {

    if (!mongoose.isValidObjectId(rentalId)) {
        throw new Error("Invalid rental ID");
    }

    const rental = await Rental.findById(rentalId).select(
        "rentalNumber orderId customerType rentalDurationType rentalDuration monthlyRent gstPercentage startDate expectedEndDate status"
    );

    if (!rental) {
        throw new Error("Rental not found");
    }

    const installments = await RentalPayment
        .find({ rentalId })
        .populate("payments.receivedBy", "name")
        .sort({ installmentNumber: 1 });

    const decorated = installments.map(decorateInstallment);

    return {
        rental,
        installments: decorated,
        summary: buildSummary(decorated)
    };
};


// =====================================================
// RECORD INSTALLMENT PAYMENT
// =====================================================

export const recordRentalInstallmentPaymentService = async (
    installmentId,
    data = {},
    userId = null
) => {

    if (!mongoose.isValidObjectId(installmentId)) {
        throw new Error("Invalid installment ID");
    }

    const installment = await RentalPayment.findById(installmentId);

    if (!installment) {
        throw new Error("Rent installment not found");
    }

    if (!OPEN_STATUSES.includes(installment.status)) {
        throw new Error(
            `This installment is already ${installment.status.toLowerCase()}`
        );
    }

    const rental = await Rental.findById(installment.rentalId);

    if (!rental) {
        throw new Error("Rental not found");
    }

    if (rental.status !== "ACTIVE") {
        throw new Error(
            "Rent can be collected only for an active rental"
        );
    }

    // ---------- method ----------
    const paymentMethod = normalizePaymentMethod(
        data.paymentMethod
    );

    if (!ALLOWED_PAYMENT_METHODS.includes(paymentMethod)) {
        throw new Error("Valid payment method is required");
    }

    // ---------- amount (default = poora baaki) ----------
    const remaining = round2(
        installment.totalAmount - installment.paidAmount
    );

    const amount = round2(
        data.amount === undefined ||
        data.amount === null ||
        data.amount === ""
            ? remaining
            : Number(data.amount)
    );

    if (!Number.isFinite(amount) || amount <= 0) {
        throw new Error("Payment amount must be greater than 0");
    }

    if (amount > remaining + 0.005) {
        throw new Error(
            `Amount cannot be more than remaining ₹${remaining.toFixed(2)}`
        );
    }

    const reference = String(
        data.reference || data.transactionId || ""
    ).trim();

    if (paymentMethod !== "CASH" && !reference) {
        throw new Error(
            "Payment reference / transaction number is required"
        );
    }

    const paidAt = data.paidAt ? new Date(data.paidAt) : new Date();

    if (Number.isNaN(paidAt.getTime())) {
        throw new Error("Invalid payment date");
    }

    // Aane wali date allow nahi (5 min clock difference chhod kar)
    if (paidAt.getTime() > Date.now() + 5 * 60 * 1000) {
        throw new Error("Payment date cannot be in the future");
    }

    // ---------- atomic update ----------
    const newPaid = round2(installment.paidAmount + amount);
    const fullyPaid = newPaid >= installment.totalAmount - 0.005;

    const entryId = new mongoose.Types.ObjectId();

    const set = {
        paidAmount: fullyPaid ? installment.totalAmount : newPaid,
        status: fullyPaid ? "PAID" : "PARTIAL"
    };

    if (fullyPaid) {
        set.paidAt = paidAt;
    }

    const updated = await RentalPayment.findOneAndUpdate(
        {
            _id: installment._id,
            status: { $in: OPEN_STATUSES },
            paidAmount: installment.paidAmount
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
                    receivedBy: userId || null
                }
            }
        },
        { new: true }
    );

    if (!updated) {
        throw new Error(
            "This installment was just updated by someone else. Please refresh and try again."
        );
    }

    // ---------- accounting record (optional) ----------
    try {

        const payment = await createPayment({
            user: userId,
            paymentFor: "RENTAL",
            saleSource: rental.rentalSource || "WALK_IN",
            paymentType: RENT_PAYMENT_TYPE,
            referenceId: rental._id,
            amount,
            currency: "INR",
            paymentMethod,
            paymentStatus: PAYMENT_STATUS.SUCCESS,
            gateway: "OFFLINE",
            transactionId: reference,
            gatewayPaymentId: "",
            gatewayResponse: {},
            paymentDate: paidAt,
            paidAt
        });

        if (payment?._id) {
            await RentalPayment.updateOne(
                { _id: updated._id, "payments._id": entryId },
                { $set: { "payments.$.paymentId": payment._id } }
            );
        }

    } catch (paymentError) {

        // Rent installment save ho chuka hai, accounting record fail hua.
        console.warn(
            "RENT PAYMENT RECORD (Payment collection) FAILED:",
            paymentError?.message
        );
    }

    await syncRentalPaymentFields(rental._id);

    const fresh = await RentalPayment
        .findById(updated._id)
        .populate("payments.receivedBy", "name");

    return decorateInstallment(fresh);
};


// =====================================================
// OVERDUE / UPCOMING LIST
// scope = overdue | upcoming (next 7 days)
// =====================================================

export const getDueInstallmentsService = async (
    scope = "overdue"
) => {

    const today = startOfToday();

    const dueFilter =
        scope === "upcoming"
            ? { $gte: today, $lt: addDays(today, 8) }
            : { $lt: today };

    const installments = await RentalPayment
        .find({
            status: { $in: OPEN_STATUSES },
            dueDate: dueFilter
        })
        .populate({
            path: "rentalId",
            select:
                "rentalNumber customerType individualDetails companyDetails status rentalSource",
            match: { status: "ACTIVE" }
        })
        .sort({ dueDate: 1 });

    return installments
        .filter((i) => i.rentalId)
        .map((i) => {
            const d = decorateInstallment(i);
            return { ...d, rental: d.rentalId };
        });
};


// =====================================================
// RETURN KE TIME KA HISAAB
//
// Pending rent = jo installments due ho chuki hain aur unpaid hain
// + COMPANY ke liye pehle 3 months (compulsory minimum), chahe
//   unki due date abhi aayi na ho.
// Baaki future installments cancel ho jayengi.
// =====================================================

export const calculateReturnDues = async (
    rental,
    returnDate = new Date()
) => {

    const open = await RentalPayment
        .find({
            rentalId: rental._id,
            status: { $in: OPEN_STATUSES }
        })
        .sort({ installmentNumber: 1 });

    const isCompany = rental.customerType === "COMPANY";

    let pendingRent = 0;
    const collectIds = [];
    const cancelIds = [];

    for (const inst of open) {

        const compulsory =
            isCompany && inst.installmentNumber <= COMPANY_MIN_MONTHS;

        const isDue = new Date(inst.dueDate) <= returnDate;

        if (compulsory || isDue) {

            const unpaidTotal = inst.totalAmount - inst.paidAmount;
            const ratio =
                inst.totalAmount > 0 ? unpaidTotal / inst.totalAmount : 0;

            pendingRent += inst.rentAmount * ratio;
            collectIds.push(inst._id);

        } else {
            cancelIds.push(inst._id);
        }
    }

    return {
        pendingRent: round2(pendingRent),
        collectIds,
        cancelIds
    };
};

export const cancelInstallments = async (ids, note = "") => {

    if (!ids?.length) return;

    await RentalPayment.updateMany(
        { _id: { $in: ids }, status: { $in: OPEN_STATUSES } },
        { $set: { status: "CANCELLED", notes: note } }
    );
};

// Settlement complete hone par bacha hua due rent deposit se adjust
export const adjustRemainingInstallments = async (rentalId) => {

    await RentalPayment.updateMany(
        { rentalId, status: { $in: OPEN_STATUSES } },
        {
            $set: {
                status: "ADJUSTED",
                notes: "Settled during return settlement"
            }
        }
    );
};


// =====================================================
// RETURN PREVIEW
// Return form ko pehle hi dikhane ke liye:
//   - schedule se kitna rent pending banega
//   - customer ka asal me mila hua deposit
// (markRentalReturnedService bhi wahi hisaab use karta hai)
// =====================================================

export const getReturnPreviewService = async (rentalId) => {

    if (!mongoose.isValidObjectId(rentalId)) {
        throw new Error("Invalid rental ID");
    }

    const rental = await Rental.findById(rentalId);

    if (!rental) {
        throw new Error("Rental not found");
    }

    const dues = await calculateReturnDues(rental, new Date());

    const heldDeposit = round2(
        Math.min(
            Number(rental.depositAmountPaid || 0),
            Number(rental.securityDeposit || 0)
        )
    );

    return {
        pendingRent: dues.pendingRent,
        heldDeposit,
        securityDeposit: round2(rental.securityDeposit || 0),
        gstPercentage: Number(rental.gstPercentage || 0),
        customerType: rental.customerType,
        status: rental.status
    };
};