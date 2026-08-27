import { salaryService } from "./salary.service.js";
import { exportSalaryExcelService } from "./salary.service.js";

// =======================================
// EXPORT SALARY EXCEL
// =======================================

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

    }

    catch (error) {

        return res.status(500).json({

            success: false,

            message: error.message

        });

    }

};


// 1. Create/Set Initial Salary Configuration
export const createSalaryController = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const result = await salaryService.createSalary(employeeId, req.body);

    return res.status(200).json({
      success: true,
      message: "Salary configuration created successfully",
      data: result.salaryDetails
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

// 2. Fetch Employee Salary Details & History
export const getSalaryController = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const data = await salaryService.getSalary(employeeId);

    return res.status(200).json({
      success: true,
      data
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

// 3. Update or Add Salary Record
export const updateSalaryController = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const updatedUser = await salaryService.updateSalary(employeeId, req.body);

    return res.status(200).json({
      success: true,
      message: "Salary payment record updated successfully",
      data: updatedUser.salaryHistory
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};


export const getAllEmployeesSalaryController = async (req, res) => {
  try {
    const data = await salaryService.getAllEmployeesSalarySummary();
    return res.status(200).json({
      success: true,
      data
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

export const getSalarySummaryController = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const data = await salaryService.getSalarySummary(employeeId);

    return res.status(200).json({
      success: true,
      message: "Salary summary retrieved successfully",
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

    }

    catch (error) {

        return res.status(400).json({

            success: false,

            message:
                error.message

        });

    }

};