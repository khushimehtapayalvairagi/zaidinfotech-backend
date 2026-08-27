import {
  findEmployeeById,
  updateSalaryDetails,
  pushSalaryHistory,
  saveEmployee,
  findAllEmployeesSalaryData,
  findEmployeeSalarySummary
} from "./salary.repository.js";

import ExcelJS from "exceljs";


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


  if (
    employee.role === "CUSTOMER"
  ) {

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
// UPDATE / ADD SALARY PAYMENT
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
    remark
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


  if (
    employee.role === "CUSTOMER"
  ) {

    throw new Error(
      "Customer cannot receive salary"
    );

  }


  // =================================================
  // BANK PAYMENT VALIDATION
  // =================================================

  if (
    paymentMode === "BANK"
  ) {

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
  // UPDATE EXISTING RECORD
  // =================================================

  if (recordId) {

    const record =
      employee.salaryHistory.id(
        recordId
      );


    if (!record) {

      throw new Error(
        "Salary record not found"
      );

    }


    if (
      month !== undefined
    ) {
      record.month =
        month;
    }


    if (
      amount !== undefined
    ) {
      record.amount =
        Number(amount);
    }


    if (
      paymentDate !== undefined
    ) {
      record.paymentDate =
        paymentDate;
    }


    if (
      paymentMode !== undefined
    ) {
      record.paymentMode =
        paymentMode;
    }


    if (
      status !== undefined
    ) {
      record.status =
        status;
    }


    if (
      remark !== undefined
    ) {
      record.remark =
        remark;
    }


    return await saveEmployee(
      employee
    );

  }


  // =================================================
  // NEW SALARY PAYMENT
  // =================================================

  const newHistoryItem = {

    month:
      month ||
      new Date().toLocaleString(
        "default",
        {
          month: "long",
          year: "numeric"
        }
      ),

    amount:
      amount !== undefined
        ? Number(amount)
        : employee.salaryDetails?.amount || 0,

    paymentDate:
      paymentDate ||
      new Date(),

    paymentMode:
      paymentMode ||
      "CASH",

    status:
      status ||
      "PAID",

    remark:
      remark ||
      ""

  };


  return await pushSalaryHistory(
    employeeId,
    newHistoryItem
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

        const paidRecords =
          (emp.salaryHistory || [])
            .filter(
              (record) =>
                record.status ===
                "PAID"
            );


        const totalPaidAmount =
          paidRecords.reduce(
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
            emp.bankDetails || null,

          totalPaidAmount,

          paidMonthsCount,

          paidMonthsLabel:
            `${paidMonthsCount} Month${
              paidMonthsCount === 1
                ? ""
                : "s"
            }`,

          lastPaidDate,

          paymentModes,

          salaryHistory:
            emp.salaryHistory ||
            []

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


export const salaryService = {

  createSalary,

  getSalary,

  updateSalary,

  getAllEmployeesSalarySummary,

  getSalarySummary

};