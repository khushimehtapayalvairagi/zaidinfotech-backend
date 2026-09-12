import User from "../users/user.model.js";


// =====================================================
// FIND EMPLOYEE BY ID
// =====================================================

export const findEmployeeById = async (employeeId) => {

    return await User.findById(
        employeeId
    );

};


// =====================================================
// UPDATE SALARY DETAILS
// =====================================================

export const updateSalaryDetails = async (
    employeeId,
    salaryDetails
) => {

    return await User.findByIdAndUpdate(

        employeeId,

        {
            $set: {
                salaryDetails
            }
        },

        {
            new: true,
            runValidators: true
        }

    );

};


// =====================================================
// PUSH SALARY HISTORY
// =====================================================
// Used when monthly salary is calculated.
// Creates a PENDING salary record.

export const pushSalaryHistory = async (
    employeeId,
    historyItem
) => {

    return await User.findByIdAndUpdate(

        employeeId,

        {
            $push: {
                salaryHistory: historyItem
            }
        },

        {
            new: true,
            runValidators: true
        }

    );

};


// =====================================================
// SAVE EMPLOYEE
// =====================================================
// Used when existing salary history record is updated.

export const saveEmployee = async (
    userDoc
) => {

    return await userDoc.save();

};


// =====================================================
// GET ALL EMPLOYEES SALARY DATA
// =====================================================

export const findAllEmployeesSalaryData = async () => {

    return await User.find({

        isDeleted: false

    })
        .select(
            "firstName lastName employeeId email department designation salaryDetails bankDetails salaryHistory status"
        )
        .sort({
            createdAt: -1
        });

};


// =====================================================
// GET SINGLE EMPLOYEE SALARY SUMMARY
// =====================================================

export const findEmployeeSalarySummary = async (
    employeeId
) => {

    return await User.findById(
        employeeId
    ).select(
        "firstName lastName employeeId designation email department salaryDetails bankDetails salaryHistory"
    );

};


// =====================================================
// UPDATE EMPLOYEE BANK DETAILS
// =====================================================

export const updateEmployeeBankDetails = async (
    employeeId,
    bankDetails
) => {

    return await User.findByIdAndUpdate(

        employeeId,

        {
            $set: {
                bankDetails
            }
        },

        {
            new: true,
            runValidators: true
        }

    ).select(
        "firstName lastName employeeId email bankDetails"
    );

};