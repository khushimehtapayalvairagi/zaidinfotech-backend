import {
  findEmployeeById,
  updateSalaryDetails,
  pushSalaryHistory,
  saveEmployee,
  findAllEmployeesSalaryData,
  findEmployeeSalarySummary,
  updateEmployeeBankDetails
} from "./salary.repository.js";

import ExcelJS from "exceljs";
import Attendance from "../attendance/attendance.model.js";
import Leave from "../leave/leave.model.js";


// =====================================================
// UPDATE BANK DETAILS
// =====================================================

const updateBankDetails = async (
  employeeId,
  payload
) => {

  const employee =
    await findEmployeeById(employeeId);

  if (!employee) {
    throw new Error("Employee not found");
  }

  if (employee.role === "CUSTOMER") {
    throw new Error(
      "Customer cannot have salary bank details"
    );
  }

  const {
    accountHolderName,
    accountNumber,
    ifscCode,
    bankName,
    accountType
  } = payload;

  if (
    !accountHolderName ||
    !accountNumber ||
    !ifscCode ||
    !bankName ||
    !accountType
  ) {
    throw new Error(
      "All bank details are required"
    );
  }

  const cleanBankDetails = {

    accountHolderName:
      String(accountHolderName).trim(),

    accountNumber:
      String(accountNumber).trim(),

    ifscCode:
      String(ifscCode)
        .trim()
        .toUpperCase(),

    bankName:
      String(bankName).trim(),

    accountType:
      String(accountType)
        .trim()
        .toUpperCase()

  };

  return await updateEmployeeBankDetails(
    employeeId,
    cleanBankDetails
  );

};


// =====================================================
// EXPORT SALARY EXCEL
// =====================================================

export const exportSalaryExcelService = async () => {

  const employees =
    await findAllEmployeesSalaryData();

  const workbook =
    new ExcelJS.Workbook();

  const worksheet =
    workbook.addWorksheet(
      "Employee Salary"
    );

  worksheet.columns = [

    {
      header: "Employee ID",
      key: "employeeId",
      width: 20
    },

    {
      header: "Employee Name",
      key: "employeeName",
      width: 30
    },

    {
      header: "Email",
      key: "email",
      width: 30
    },

    {
      header: "Department",
      key: "department",
      width: 25
    },

    {
      header: "Designation",
      key: "designation",
      width: 25
    },

    {
      header: "Salary",
      key: "salary",
      width: 15
    },

    {
      header: "Salary Type",
      key: "salaryType",
      width: 20
    },

    {
      header: "Bank Name",
      key: "bankName",
      width: 25
    },

    {
      header: "Account Number",
      key: "accountNumber",
      width: 25
    },

    {
      header: "IFSC",
      key: "ifscCode",
      width: 20
    },

    {
      header: "Account Type",
      key: "accountType",
      width: 20
    },

    {
      header: "Status",
      key: "status",
      width: 15
    }

  ];

  employees.forEach((employee) => {

    worksheet.addRow({

      employeeId:
        employee.employeeId ||
        employee._id?.toString() ||
        "",

      employeeName:
        `${employee.firstName || ""} ${
          employee.lastName || ""
        }`.trim(),

      email:
        employee.email || "",

      department:
        employee.department || "",

      designation:
        employee.designation || "",

      salary:
        employee.salaryDetails?.amount || 0,

      salaryType:
        employee.salaryDetails?.salaryType ||
        "MONTHLY",

      bankName:
        employee.bankDetails?.bankName ||
        "",

      accountNumber:
        employee.bankDetails?.accountNumber ||
        "",

      ifscCode:
        employee.bankDetails?.ifscCode ||
        "",

      accountType:
        employee.bankDetails?.accountType ||
        "",

      status:
        employee.status || ""

    });

  });

  return workbook;

};


// =====================================================
// CREATE / SET SALARY
// =====================================================

const createSalary = async (
  employeeId,
  payload
) => {

  const {
    salaryType,
    amount,
    joiningDate
  } = payload;

  const employee =
    await findEmployeeById(
      employeeId
    );

  if (!employee) {
    throw new Error(
      "Employee not found"
    );
  }

  if (employee.role === "CUSTOMER") {
    throw new Error(
      "Salary cannot be assigned to customer"
    );
  }

  const salaryDetails = {

    salaryType:
      salaryType ||
      "MONTHLY",

    amount:
      amount !== undefined
        ? Number(amount)
        : 0,

    joiningDate:
      joiningDate ||
      employee.salaryDetails?.joiningDate ||
      new Date()

  };

  return await updateSalaryDetails(
    employeeId,
    salaryDetails
  );

};


// =====================================================
// GET SALARY DETAILS
// =====================================================

const getSalary = async (
  employeeId
) => {

  const employee =
    await findEmployeeById(
      employeeId
    );

  if (!employee) {
    throw new Error(
      "Employee not found"
    );
  }

  const totalPaid =
    (employee.salaryHistory || [])
      .filter(
        (entry) =>
          entry.status === "PAID"
      )
      .reduce(
        (acc, entry) =>
          acc +
          (entry.amount || 0),
        0
      );

  return {

    employeeId:
      employee._id,

    employeeCode:
      employee.employeeId,

    name:
      `${employee.firstName || ""} ${
        employee.lastName || ""
      }`.trim(),

    email:
      employee.email,

    designation:
      employee.designation,

    department:
      employee.department,

    salaryDetails:
      employee.salaryDetails,

    bankDetails:
      employee.bankDetails,

    totalPaidAmount:
      totalPaid,

    salaryHistory:
      employee.salaryHistory

  };

};


// =====================================================
// UPDATE SALARY / PAY SALARY
// =====================================================

const updateSalary = async (
  employeeId,
  payload
) => {

  const {
    recordId,
    month,
    amount,
    paymentDate,
    paymentMode,
    status,
    remark,
    paidBy
  } = payload;

  const employee =
    await findEmployeeById(
      employeeId
    );

  if (!employee) {
    throw new Error(
      "Employee not found"
    );
  }

  if (employee.role === "CUSTOMER") {
    throw new Error(
      "Customer cannot receive salary"
    );
  }

  // =================================================
  // RECORD ID IS REQUIRED FOR ACTUAL PAYMENT
  // =================================================

  if (!recordId) {
    throw new Error(
      "Salary record ID is required for payment"
    );
  }

  // =================================================
  // FIND SALARY RECORD
  // =================================================

  const record =
    employee.salaryHistory.id(
      recordId
    );

  if (!record) {
    throw new Error(
      "Salary record not found"
    );
  }

  // =================================================
  // ALREADY PAID CHECK
  // =================================================

  if (record.status === "PAID") {
    throw new Error(
      "Salary is already paid"
    );
  }

  // =================================================
  // PAYMENT MODE REQUIRED
  // =================================================

  if (!paymentMode) {
    throw new Error(
      "Payment mode is required"
    );
  }

  // =================================================
  // VALID PAYMENT MODES
  // =================================================

  const allowedPaymentModes = [
    "CASH",
    "BANK",
    "UPI"
  ];

  if (
    !allowedPaymentModes.includes(
      paymentMode
    )
  ) {
    throw new Error(
      "Invalid payment mode"
    );
  }

  // =================================================
  // BANK PAYMENT VALIDATION
  // =================================================

  if (paymentMode === "BANK") {

    const bank =
      employee.bankDetails;

    if (!bank) {
      throw new Error(
        "Employee bank details are not available"
      );
    }

    if (
      !bank.accountHolderName ||
      !bank.accountNumber ||
      !bank.ifscCode ||
      !bank.bankName
    ) {
      throw new Error(
        "Complete bank details are required for bank salary payment"
      );
    }

  }

  // =================================================
  // PAYMENT
  // =================================================

  record.status = "PAID";

  record.paymentDate =
    paymentDate ||
    new Date();

  record.paymentMode =
    paymentMode;

  if (remark !== undefined) {
    record.remark =
      remark;
  }

  if (paidBy) {
    record.paidBy =
      paidBy;
  }

  // =================================================
  // SAVE
  // =================================================

  return await saveEmployee(
    employee
  );

};


// =====================================================
// ALL EMPLOYEE SALARY SUMMARY
// =====================================================

const getAllEmployeesSalarySummary =
  async () => {

    const employees =
      await findAllEmployeesSalaryData();

    const summaryList =
      employees.map((emp) => {

        const salaryRecords =
          emp.salaryHistory || [];

        const paidRecords =
          salaryRecords.filter(
            (record) =>
              record.status ===
              "PAID"
          );

        const pendingRecords =
          salaryRecords.filter(
            (record) =>
              record.status ===
              "PENDING"
          );

        const totalPaidAmount =
          paidRecords.reduce(
            (acc, record) =>
              acc +
              (record.amount || 0),
            0
          );

        const totalPendingAmount =
          pendingRecords.reduce(
            (acc, record) =>
              acc +
              (record.amount || 0),
            0
          );

        const paidMonthsCount =
          paidRecords.length;

        const lastPayment =
          paidRecords[
            paidRecords.length - 1
          ];

        const lastPaidDate =
          lastPayment?.paymentDate
            ? new Date(
                lastPayment.paymentDate
              ).toLocaleDateString()
            : "-";

        const paymentModes =
          [
            ...new Set(
              paidRecords.map(
                (r) =>
                  r.paymentMode
              )
            )
          ].join(", ") || "-";

        return {

          _id:
            emp._id,

          employeeId:
            emp.employeeId,

          employeeName:
            `${emp.firstName || ""} ${
              emp.lastName || ""
            }`.trim() ||
            "N/A",

          email:
            emp.email,

          designation:
            emp.designation ||
            "N/A",

          department:
            emp.department ||
            "N/A",

          salaryType:
            emp.salaryDetails
              ?.salaryType ||
            "MONTHLY",

          baseSalary:
            emp.salaryDetails
              ?.amount || 0,

          bankDetails:
            emp.bankDetails ||
            null,

          totalPaidAmount,

          totalPendingAmount,

          paidMonthsCount,

          pendingMonthsCount:
            pendingRecords.length,

          paidMonthsLabel:
            `${paidMonthsCount} Month${
              paidMonthsCount === 1
                ? ""
                : "s"
            }`,

          lastPaidDate,

          paymentModes,

          salaryHistory:
            salaryRecords

        };

      });

    return summaryList;

  };


// =====================================================
// INDIVIDUAL SALARY SUMMARY
// =====================================================

const getSalarySummary = async (
  employeeId
) => {

  const employee =
    await findEmployeeSalarySummary(
      employeeId
    );

  if (!employee) {
    throw new Error(
      "Employee not found"
    );
  }

  const paidRecords =
    (employee.salaryHistory || [])
      .filter(
        (record) =>
          record.status ===
          "PAID"
      );

  const totalPaidSalary =
    paidRecords.reduce(
      (sum, record) =>
        sum +
        (record.amount || 0),
      0
    );

  const totalMonthsPaid =
    paidRecords.length;

  const paymentBreakdown =
    paidRecords.map(
      (record) => ({

        recordId:
          record._id,

        month:
          record.month,

        amountPaid:
          record.amount,

        paymentDate:
          record.paymentDate
            ? new Date(
                record.paymentDate
              ).toLocaleDateString()
            : "N/A",

        paymentMode:
          record.paymentMode ||
          "CASH",

        remark:
          record.remark ||
          ""

      })
    );

  return {

    employeeId:
      employee._id,

    employeeCode:
      employee.employeeId,

    employeeName:
      `${employee.firstName || ""} ${
        employee.lastName || ""
      }`.trim() ||
      "N/A",

    designation:
      employee.designation ||
      "N/A",

    department:
      employee.department ||
      "N/A",

    email:
      employee.email,

    salaryDetails: {

      salaryType:
        employee.salaryDetails
          ?.salaryType ||
        "MONTHLY",

      baseAmount:
        employee.salaryDetails
          ?.amount || 0,

      joiningDate:
        employee.salaryDetails
          ?.joiningDate

    },

    bankDetails:
      employee.bankDetails ||
      null,

    summary: {

      totalPaidSalary,

      totalMonthsPaid,

      paymentModesUsed:
        [
          ...new Set(
            paidRecords.map(
              (r) =>
                r.paymentMode
            )
          )
        ]

    },

    paymentHistory:
      paymentBreakdown

  };

};


// =====================================================
// CALCULATE EMPLOYEE SALARY
// =====================================================

const calculateEmployeeSalary = async (
  employeeId,
  month,
  year
) => {

  const employee =
    await findEmployeeById(
      employeeId
    );

  if (!employee) {
    throw new Error(
      "Employee not found"
    );
  }

  if (employee.role === "CUSTOMER") {
    throw new Error(
      "Customer cannot have salary"
    );
  }

  const baseSalary =
    Number(
      employee.salaryDetails?.amount || 0
    );

  if (baseSalary <= 0) {
    throw new Error(
      "Employee salary is not configured"
    );
  }

  // =================================================
  // VALIDATE MONTH / YEAR
  // =================================================

  month =
    Number(month);

  year =
    Number(year);

  if (
    month < 1 ||
    month > 12
  ) {
    throw new Error(
      "Invalid month"
    );
  }

  if (
    year < 2000 ||
    year > 2100
  ) {
    throw new Error(
      "Invalid year"
    );
  }

  // =================================================
  // MONTH DATE RANGE
  // =================================================

  const startDate =
    new Date(
      year,
      month - 1,
      1,
      0,
      0,
      0,
      0
    );

  const endDate =
    new Date(
      year,
      month,
      0,
      23,
      59,
      59,
      999
    );

  const totalCalendarDays =
    endDate.getDate();

  // =================================================
  // ATTENDANCE
  // =================================================

  const attendance =
    await Attendance.find({

      user: employeeId,

      date: {
        $gte: startDate,
        $lte: endDate
      }

    });

  let presentDays = 0;

  let absentDays = 0;

  let overtimeHours = 0;

  attendance.forEach(
    (record) => {

      if (
        record.status === "PRESENT" ||
        record.status === "LATE"
      ) {
        presentDays++;
      }

      if (
        record.status === "HALF_DAY"
      ) {
        presentDays += 0.5;
      }

      if (
        record.status === "ABSENT"
      ) {
        absentDays++;
      }

      overtimeHours +=
        Number(
          record.overtime || 0
        );

    }
  );

  // =================================================
  // LEAVE
  // =================================================

  const leaves =
    await Leave.find({

      user: employeeId,

      status: "APPROVED",

      fromDate: {
        $lte: endDate
      },

      toDate: {
        $gte: startDate
      }

    });

  let paidLeaveDays = 0;

  let unpaidLeaveDays = 0;

  leaves.forEach(
    (leave) => {

      if (
        leave.leaveType ===
        "UNPAID"
      ) {

        unpaidLeaveDays +=
          Number(
            leave.totalDays || 0
          );

      } else {

        paidLeaveDays +=
          Number(
            leave.totalDays || 0
          );

      }

    }
  );

  // =================================================
  // SALARY CALCULATION
  // =================================================

  const dailySalary =
    baseSalary /
    totalCalendarDays;

  // ABSENT = UNPAID
  const totalUnpaidDays =
    unpaidLeaveDays +
    absentDays;

  const deductionAmount =
    dailySalary *
    totalUnpaidDays;

  // =================================================
  // OVERTIME
  // =================================================

  const hourlySalary =
    baseSalary /
    26 /
    8;

  const overtimeAmount =
    hourlySalary *
    overtimeHours;

  // =================================================
  // NET SALARY
  // =================================================

  const netSalary =
    Math.max(
      0,
      baseSalary +
      overtimeAmount -
      deductionAmount
    );

  // =================================================
  // MONTH LABEL
  // =================================================

  const monthLabel =
    `${year}-${String(month).padStart(
      2,
      "0"
    )}`;

  // =================================================
  // CHECK EXISTING SALARY RECORD
  // =================================================

  const existingRecord =
    (employee.salaryHistory || [])
      .find(
        (record) =>
          record.month ===
            monthLabel
      );

  // =================================================
  // IF ALREADY PAID
  // =================================================

  if (
    existingRecord &&
    existingRecord.status ===
      "PAID"
  ) {

    throw new Error(
      `Salary for ${monthLabel} is already paid`
    );

  }

  // =================================================
  // CREATE / UPDATE PENDING RECORD
  // =================================================

  if (existingRecord) {

    existingRecord.amount =
      netSalary;

    existingRecord.status =
      "PENDING";

    existingRecord.paymentDate =
      null;

    existingRecord.paymentMode =
      null;

    existingRecord.remark =
      "Salary recalculated";

    const savedEmployee =
      await saveEmployee(
        employee
      );

    return {

      employeeId:
        employee._id,

      employeeCode:
        employee.employeeId,

      employeeName:
        `${employee.firstName || ""} ${
          employee.lastName || ""
        }`.trim(),

      month:
        monthLabel,

      workingDays:
        totalCalendarDays,

      presentDays,

      paidLeaveDays,

      unpaidLeaveDays,

      absentDays,

      overtimeHours,

      baseSalary,

      overtimeAmount,

      deductionAmount,

      netSalary,

      status:
        "PENDING",

      salaryRecordId:
        existingRecord._id,

      employee:
        savedEmployee

    };

  }

  // =================================================
  // NEW PENDING SALARY RECORD
  // =================================================

  const newHistoryItem = {

    month:
      monthLabel,

    amount:
      netSalary,

    paymentDate:
      null,

    paymentMode:
      null,

    status:
      "PENDING",

    remark:
      "Salary calculated and pending payment"

  };

  const savedEmployee =
    await pushSalaryHistory(
      employeeId,
      newHistoryItem
    );

  // Get newly created record ID
  const createdRecord =
    savedEmployee.salaryHistory[
      savedEmployee.salaryHistory.length - 1
    ];

  // =================================================
  // RETURN CALCULATION + RECORD
  // =================================================

  return {

    employeeId:
      employee._id,

    employeeCode:
      employee.employeeId,

    employeeName:
      `${employee.firstName || ""} ${
        employee.lastName || ""
      }`.trim(),

    month:
      monthLabel,

    workingDays:
      totalCalendarDays,

    presentDays,

    paidLeaveDays,

    unpaidLeaveDays,

    absentDays,

    overtimeHours,

    baseSalary,

    overtimeAmount,

    deductionAmount,

    netSalary,

    status:
      "PENDING",

    salaryRecordId:
      createdRecord?._id,

    employee:
      savedEmployee

  };

};


// =====================================================
// EXPORT
// =====================================================

export const salaryService = {

  createSalary,

  getSalary,

  updateSalary,

  getAllEmployeesSalarySummary,

  getSalarySummary,

  updateBankDetails,

  calculateEmployeeSalary

};