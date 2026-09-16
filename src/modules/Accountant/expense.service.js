import {
    createExpenseDB,
    getExpenseByIdDB,
    getAllExpensesDB,
    updateExpenseDB,
    deleteExpenseDB,
    getExpenseTotalDB
} from "./expense.repository.js";


// =====================================================
// EXPENSE NUMBER
// =====================================================

const generateExpenseNumber = () => {

    const timestamp =
        Date.now();

    return `EXP-${timestamp}`;

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

    if (
        data.amount === undefined ||
        Number(data.amount) <= 0
    ) {
        throw new Error(
            "Valid expense amount is required"
        );
    }

    if (!data.paymentMethod) {
        throw new Error(
            "Payment method is required"
        );
    }

    const expenseData = {

        expenseNumber:
            generateExpenseNumber(),

        category:
            data.category,

        title:
            data.title,

        description:
            data.description || "",

        amount:
            Number(data.amount),

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

    if (data.amount !== undefined) {

        data.amount =
            Number(data.amount);

        if (data.amount <= 0) {
            throw new Error(
                "Expense amount must be greater than zero"
            );
        }

    }

    return await updateExpenseDB(
        id,
        data
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