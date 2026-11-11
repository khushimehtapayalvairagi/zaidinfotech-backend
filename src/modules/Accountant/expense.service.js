import {
    createExpenseDB,
    getExpenseByIdDB,
    getAllExpensesDB,
    updateExpenseDB,
    deleteExpenseDB,
    getExpenseTotalDB
} from "./expense.repository.js";


// =====================================================
// HELPERS
// =====================================================

const round2 = (value) =>
    Math.round((Number(value) + Number.EPSILON) * 100) / 100;


const generateExpenseNumber = () => {

    const timestamp =
        Date.now();

    return `EXP-${timestamp}`;

};


// =====================================================
// GST CALCULATION (single source of truth)
// =====================================================
//
// GST      : total = base + (base * gst% / 100)
// NON_GST  : total = base, gst = 0
//
// `amount` is the final amount.
// Old clients that only send `amount` are treated as
// base amount.
// =====================================================

export const calculateExpenseAmounts = ({
    gstType,
    baseAmount,
    amount,
    gstPercentage
}) => {

    const type =
        String(gstType || "NON_GST")
            .trim()
            .toUpperCase();

    if (!["GST", "NON_GST"].includes(type)) {
        throw new Error(
            "Invalid GST type. Use GST or NON_GST"
        );
    }

    const base =
        Number(
            baseAmount !== undefined &&
            baseAmount !== null &&
            baseAmount !== ""
                ? baseAmount
                : amount
        );

    if (!Number.isFinite(base) || base <= 0) {
        throw new Error(
            "Valid expense amount is required"
        );
    }

    if (type === "NON_GST") {
        return {
            gstType: "NON_GST",
            baseAmount: round2(base),
            gstPercentage: 0,
            gstAmount: 0,
            amount: round2(base)
        };
    }

    const pct =
        Number(gstPercentage);

    if (
        !Number.isFinite(pct) ||
        pct < 0 ||
        pct > 100
    ) {
        throw new Error(
            "GST percentage must be between 0 and 100"
        );
    }

    const gstAmount =
        round2(base * pct / 100);

    return {
        gstType: "GST",
        baseAmount: round2(base),
        gstPercentage: pct,
        gstAmount,
        amount: round2(base + gstAmount)
    };

};


// =====================================================
// CREATE EXPENSE
// =====================================================

export const createExpenseService = async (
    data,
    userId
) => {

    if (!data.category) {
        throw new Error(
            "Expense category is required"
        );
    }

    if (!data.title) {
        throw new Error(
            "Expense title is required"
        );
    }

    if (!data.paymentMethod) {
        throw new Error(
            "Payment method is required"
        );
    }

    const amounts =
        calculateExpenseAmounts(data);

    const expenseData = {

        expenseNumber:
            generateExpenseNumber(),

        category:
            data.category,

        title:
            data.title,

        description:
            data.description || "",

        ...amounts,

        vendorGstNumber:
            amounts.gstType === "GST"
                ? (data.vendorGstNumber || "")
                : "",

        paymentMethod:
            data.paymentMethod,

        expenseDate:
            data.expenseDate || new Date(),

        receiptNumber:
            data.receiptNumber || "",

        vendorName:
            data.vendorName || "",

        status:
            data.status || "PAID",

        createdBy:
            userId,

        remark:
            data.remark || ""

    };


    return await createExpenseDB(
        expenseData
    );

};


// =====================================================
// GET ONE
// =====================================================

export const getExpenseService = async (
    id
) => {

    const expense =
        await getExpenseByIdDB(id);

    if (!expense) {
        throw new Error(
            "Expense not found"
        );
    }

    return expense;

};


// =====================================================
// GET ALL
// =====================================================

export const getAllExpensesService = async (
    filter = {}
) => {

    return await getAllExpensesDB(
        filter
    );

};


// =====================================================
// UPDATE
// =====================================================

const UPDATABLE_FIELDS = [
    "category",
    "title",
    "description",
    "paymentMethod",
    "expenseDate",
    "receiptNumber",
    "vendorName",
    "vendorGstNumber",
    "status",
    "remark"
];

export const updateExpenseService = async (
    id,
    data
) => {

    const expense =
        await getExpenseByIdDB(id);

    if (!expense) {
        throw new Error(
            "Expense not found"
        );
    }

    const update = {};

    for (const key of UPDATABLE_FIELDS) {
        if (data[key] !== undefined) {
            update[key] = data[key];
        }
    }

    const touchesAmount =
        data.amount !== undefined ||
        data.baseAmount !== undefined ||
        data.gstType !== undefined ||
        data.gstPercentage !== undefined;

    if (touchesAmount) {

        const amounts =
            calculateExpenseAmounts({

                gstType:
                    data.gstType ??
                    expense.gstType ??
                    "NON_GST",

                baseAmount:
                    data.baseAmount ??
                    data.amount ??
                    expense.baseAmount ??
                    expense.amount,

                gstPercentage:
                    data.gstPercentage ??
                    expense.gstPercentage
            });

        Object.assign(update, amounts);

        if (amounts.gstType === "NON_GST") {
            update.vendorGstNumber = "";
        }

    }

    return await updateExpenseDB(
        id,
        update
    );

};


// =====================================================
// DELETE
// =====================================================

export const deleteExpenseService = async (
    id
) => {

    const expense =
        await deleteExpenseDB(id);

    if (!expense) {
        throw new Error(
            "Expense not found"
        );
    }

    return expense;

};


// =====================================================
// EXPENSE TOTAL
// =====================================================

export const getExpenseTotalService = async (
    startDate,
    endDate
) => {

    return await getExpenseTotalDB(
        startDate,
        endDate
    );

};