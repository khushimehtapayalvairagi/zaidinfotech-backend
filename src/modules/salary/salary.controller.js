import { salaryService } from "./salary.service.js";
import { exportSalaryExcelService } from "./salary.service.js";


// =====================================================
// EXPORT SALARY EXCEL
// =====================================================

export const exportSalaryExcel = async (req, res) => {

    try {

        const workbook =
            await exportSalaryExcelService();

        res.setHeader(
            "Content-Type",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        );

        res.setHeader(
            "Content-Disposition",
            'attachment; filename="Employee_Salary_List.xlsx"'
        );

        await workbook.xlsx.write(res);

        res.end();

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: error.message
        });

    }

};


// =====================================================
// CREATE / SET SALARY CONFIGURATION
// POST /api/salary/config/:employeeId
// =====================================================

export const createSalaryController = async (req, res) => {

    try {

        const { employeeId } = req.params;

        const result =
            await salaryService.createSalary(
                employeeId,
                req.body
            );

        return res.status(200).json({

            success: true,

            message:
                "Salary configuration created successfully",

            data:
                result.salaryDetails

        });

    } catch (error) {

        return res.status(400).json({

            success: false,

            message: error.message

        });

    }

};


// =====================================================
// GET EMPLOYEE SALARY DETAILS
// GET /api/salary/:employeeId
// =====================================================

export const getSalaryController = async (req, res) => {

    try {

        const { employeeId } =
            req.params;

        const data =
            await salaryService.getSalary(
                employeeId
            );

        return res.status(200).json({

            success: true,

            data

        });

    } catch (error) {

        return res.status(400).json({

            success: false,

            message: error.message

        });

    }

};


// =====================================================
// CALCULATE MONTHLY SALARY
// POST /api/salary/calculate/:employeeId
// =====================================================
// This will:
// 1. Calculate salary
// 2. Create/update PENDING salary record
// 3. Return salary calculation
// =====================================================

export const calculateEmployeeSalaryController = async (
    req,
    res
) => {

    try {

        const { employeeId } =
            req.params;

        const {
            month,
            year
        } = req.body;

        if (!month || !year) {

            return res.status(400).json({

                success: false,

                message:
                    "Month and year are required"

            });

        }

        const result =
            await salaryService.calculateEmployeeSalary(
                employeeId,
                month,
                year
            );

        return res.status(200).json({

            success: true,

            message:
                "Salary calculated successfully and marked as pending",

            data: result

        });

    } catch (error) {

        return res.status(400).json({

            success: false,

            message: error.message

        });

    }

};


// =====================================================
// PAY SALARY
// PUT /api/salary/pay/:employeeId
// =====================================================
// This will:
// 1. Find PENDING salary record
// 2. Validate payment mode
// 3. Mark salary as PAID
// =====================================================

export const updateSalaryController = async (
    req,
    res
) => {

    try {

        const { employeeId } =
            req.params;

        const updatedUser =
            await salaryService.updateSalary(
                employeeId,
                {
                    ...req.body,

                    // Accountant/Admin who actually paid salary
                    paidBy: req.user?._id
                }
            );

        return res.status(200).json({

            success: true,

            message:
                "Salary paid successfully",

            data:
                updatedUser.salaryHistory

        });

    } catch (error) {

        return res.status(400).json({

            success: false,

            message: error.message

        });

    }

};


// =====================================================
// GET ALL EMPLOYEES SALARY SUMMARY
// GET /api/salary/all-summary
// =====================================================

export const getAllEmployeesSalaryController = async (
    req,
    res
) => {

    try {

        const data =
            await salaryService.getAllEmployeesSalarySummary();

        return res.status(200).json({

            success: true,

            data

        });

    } catch (error) {

        return res.status(400).json({

            success: false,

            message: error.message

        });

    }

};


// =====================================================
// GET INDIVIDUAL SALARY SUMMARY
// GET /api/salary/summary/:employeeId
// =====================================================

export const getSalarySummaryController = async (
    req,
    res
) => {

    try {

        const { employeeId } =
            req.params;

        const data =
            await salaryService.getSalarySummary(
                employeeId
            );

        return res.status(200).json({

            success: true,

            message:
                "Salary summary retrieved successfully",

            data

        });

    } catch (error) {

        return res.status(400).json({

            success: false,

            message: error.message

        });

    }

};


// =====================================================
// UPDATE BANK DETAILS
// PUT /api/salary/bank/:employeeId
// =====================================================

export const updateBankDetailsController = async (
    req,
    res
) => {

    try {

        const { employeeId } =
            req.params;

        const result =
            await salaryService.updateBankDetails(
                employeeId,
                req.body
            );

        return res.status(200).json({

            success: true,

            message:
                "Bank details updated successfully",

            data:
                result?.bankDetails || null

        });

    } catch (error) {

        return res.status(400).json({

            success: false,

            message:
                error.message

        });

    }

};