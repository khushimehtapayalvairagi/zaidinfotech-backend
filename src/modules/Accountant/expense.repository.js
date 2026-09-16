import Expense from "./expense.model.js";


// =====================================================
// CREATE
// =====================================================

export const createExpenseDB = async (data) => {

    return await Expense.create(data);

};


// =====================================================
// GET BY ID
// =====================================================

export const getExpenseByIdDB = async (id) => {

    return await Expense.findOne({
        _id: id,
        isDeleted: false
    })
        .populate(
            "createdBy",
            "firstName lastName employeeId"
        )
        .populate(
            "approvedBy",
            "firstName lastName employeeId"
        );

};


// =====================================================
// GET ALL
// =====================================================

export const getAllExpensesDB = async (filter = {}) => {

    return await Expense.find({
        isDeleted: false,
        ...filter
    })
        .populate(
            "createdBy",
            "firstName lastName employeeId"
        )
        .populate(
            "approvedBy",
            "firstName lastName employeeId"
        )
        .sort({
            expenseDate: -1,
            createdAt: -1
        });

};


// =====================================================
// UPDATE
// =====================================================

export const updateExpenseDB = async (
    id,
    data
) => {

    return await Expense.findOneAndUpdate(
        {
            _id: id,
            isDeleted: false
        },
        {
            $set: data
        },
        {
            new: true,
            runValidators: true
        }
    );

};


// =====================================================
// DELETE
// =====================================================

export const deleteExpenseDB = async (id) => {

    return await Expense.findOneAndUpdate(
        {
            _id: id,
            isDeleted: false
        },
        {
            $set: {
                isDeleted: true
            }
        },
        {
            new: true
        }
    );

};


// =====================================================
// EXPENSE TOTAL
// =====================================================

export const getExpenseTotalDB = async (
    startDate,
    endDate
) => {

    const result = await Expense.aggregate([

        {
            $match: {
                isDeleted: false,

                expenseDate: {
                    $gte: startDate,
                    $lte: endDate
                },

                status: "PAID"
            }
        },

        {
            $group: {
                _id: null,
                total: {
                    $sum: "$amount"
                }
            }
        }

    ]);

    return result[0]?.total || 0;

};