import { 
  findEmployeeById,
  updateSalaryDetails,
  pushSalaryHistory,
  saveEmployee ,
  findAllEmployeesSalaryData,
  findEmployeeSalarySummary ,
  // getAllEmployeesSalaryDB 
} from "./salary.repository.js";
import ExcelJS from "exceljs";

// export const exportSalaryExcelService = async () => {

//     const salaries =
//         await getAllEmployeesSalaryDB();

//     const workbook =
//         new ExcelJS.Workbook();

//     const worksheet =
//         workbook.addWorksheet("Employee Salary");

//     worksheet.columns = [

//         {
//             header: "Employee ID",
//             key: "employeeId",
//             width: 20
//         },

//         {
//             header: "Employee Name",
//             key: "employeeName",
//             width: 30
//         },

//         {
//             header: "Email",
//             key: "email",
//             width: 30
//         },

//         {
//             header: "Department",
//             key: "department",
//             width: 25
//         },

//         {
//             header: "Salary",
//             key: "salary",
//             width: 15
//         },

//         {
//             header: "Salary Type",
//             key: "salaryType",
//             width: 20
//         },

//         {
//             header: "Status",
//             key: "status",
//             width: 15
//         }

//     ];

//     salaries.forEach(item => {

//         worksheet.addRow({

//             employeeId:
//                 item.employee?.employeeId || "",

//             employeeName:
//                 `${item.employee?.firstName || ""} ${item.employee?.lastName || ""}`,

//             email:
//                 item.employee?.email || "",

//             department:
//                 item.department?.name || "",

//             salary:
//                 item.baseSalary,

//             salaryType:
//                 item.salaryType,

//             status:
//                 item.status

//         });

//     });

//     return workbook;

// };

export const exportSalaryExcelService = async () => {
  const employees = await findAllEmployeesSalaryData();

  const workbook = new ExcelJS.Workbook();

  const worksheet = workbook.addWorksheet(
    "Employee Salary"
  );

  worksheet.columns = [
    {
      header: "Employee ID",
      key: "employeeId",
      width: 20,
    },
    {
      header: "Employee Name",
      key: "employeeName",
      width: 30,
    },
    {
      header: "Email",
      key: "email",
      width: 30,
    },
    {
      header: "Department",
      key: "department",
      width: 25,
    },
    {
      header: "Designation",
      key: "designation",
      width: 25,
    },
    {
      header: "Salary",
      key: "salary",
      width: 15,
    },
    {
      header: "Salary Type",
      key: "salaryType",
      width: 20,
    },
    {
      header: "Status",
      key: "status",
      width: 15,
    },
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

      email: employee.email || "",

      department:
        employee.department || "",

      designation:
        employee.designation || "",

      salary:
        employee.salaryDetails?.amount || 0,

      salaryType:
        employee.salaryDetails?.salaryType ||
        "MONTHLY",

      status:
        employee.status || "",
    });
  });

  return workbook;
};

const createSalary = async (employeeId, payload) => {
  const { salaryType, amount, joiningDate } = payload;
  const employee = await findEmployeeById(employeeId);

  if (!employee) {
    throw new Error("Employee not found");
  }

  const salaryDetails = {
    salaryType: salaryType || "MONTHLY",
    amount: amount || 0,
    joiningDate: joiningDate || employee.salaryDetails?.joiningDate || new Date()
  };

  return await updateSalaryDetails(employeeId, salaryDetails);
};

const getSalary = async (employeeId) => {
  const employee = await findEmployeeById(employeeId);

  if (!employee) {
    throw new Error("Employee not found");
  }

  const totalPaid = (employee.salaryHistory || [])
    .filter((entry) => entry.status === "PAID")
    .reduce((acc, entry) => acc + (entry.amount || 0), 0);

  return {
    employeeId: employee._id,
    name: employee.firstName ? `${employee.firstName} ${employee.lastName || ''}`.trim() : employee.name,
    email: employee.email,
    salaryDetails: employee.salaryDetails,
    totalPaidAmount: totalPaid,
    salaryHistory: employee.salaryHistory
  };
};

const updateSalary = async (employeeId, payload) => {
  const { recordId, month, amount, paymentDate, paymentMode, status, remark } = payload;
  const employee = await findEmployeeById(employeeId);

  if (!employee) {
    throw new Error("Employee not found");
  }

  // Update existing history entry if recordId exists
  if (recordId) {
    const record = employee.salaryHistory.id(recordId);
    if (!record) {
      throw new Error("Salary record not found");
    }

    if (month !== undefined) record.month = month;
    if (amount !== undefined) record.amount = amount;
    if (paymentDate !== undefined) record.paymentDate = paymentDate;
    if (paymentMode !== undefined) record.paymentMode = paymentMode;
    if (status !== undefined) record.status = status;
    if (remark !== undefined) record.remark = remark;

    return await saveEmployee(employee);
  }

  // Push new payment entry into salaryHistory
  const newHistoryItem = {
    month: month || new Date().toLocaleString("default", { month: "long", year: "numeric" }),
    amount: amount !== undefined ? amount : employee.salaryDetails?.amount || 0,
    paymentDate: paymentDate || new Date(),
    paymentMode: paymentMode || "CASH",
    status: status || "PAID",
    remark: remark || ""
  };

  return await pushSalaryHistory(employeeId, newHistoryItem);
};



 const getAllEmployeesSalarySummary = async () => {
  const employees = await findAllEmployeesSalaryData();

  const summaryList = employees.map((emp) => {
    // Filter only PAID records
    const paidRecords = (emp.salaryHistory || []).filter((record) => record.status === "PAID");

    // Total Paid Amount
    const totalPaidAmount = paidRecords.reduce((acc, record) => acc + (record.amount || 0), 0);

    // Count of Paid Months
    const paidMonthsCount = paidRecords.length;

    // Latest Paid Date
    const lastPayment = paidRecords[paidRecords.length - 1];
    const lastPaidDate = lastPayment?.paymentDate
      ? new Date(lastPayment.paymentDate).toLocaleDateString()
      : "-";

    // Payment Modes used
    const paymentModes = [...new Set(paidRecords.map((r) => r.paymentMode))].join(", ") || "-";

    return {
      _id: emp._id,
      employeeName: `${emp.firstName || ""} ${emp.lastName || ""}`.trim() || "N/A",
      email: emp.email,
      designation: emp.designation || "N/A",
      department: emp.department || "N/A",
      salaryType: emp.salaryDetails?.salaryType || "MONTHLY",
      baseSalary: emp.salaryDetails?.amount || 0,
      totalPaidAmount,
      paidMonthsCount,
      paidMonthsLabel: `${paidMonthsCount} Month${paidMonthsCount === 1 ? "" : "s"}`,
      lastPaidDate,
      paymentModes,
      salaryHistory: emp.salaryHistory || []
    };
  });

  return summaryList;
};


 const getSalarySummary = async (employeeId) => {
  const employee = await findEmployeeSalarySummary(employeeId);

  if (!employee) {
    throw new Error("Employee not found");
  }

  // Filter only PAID status records from history
  const paidRecords = (employee.salaryHistory || []).filter(
    (record) => record.status === "PAID"
  );

  // 1. Calculate total paid salary amount
  const totalPaidSalary = paidRecords.reduce(
    (sum, record) => sum + (record.amount || 0),
    0
  );

  // 2. Count distinct/total months paid
  const totalMonthsPaid = paidRecords.length;

  // 3. Extract payout details (Name, Designation, Dates, Modes)
  const paymentBreakdown = paidRecords.map((record) => ({
    recordId: record._id,
    month: record.month,
    amountPaid: record.amount,
    paymentDate: record.paymentDate
      ? new Date(record.paymentDate).toLocaleDateString()
      : "N/A",
    paymentMode: record.paymentMode || "CASH",
    remark: record.remark || ""
  }));

  // Construct response object
  return {
    employeeId: employee._id,
    employeeName: `${employee.firstName || ''} ${employee.lastName || ''}`.trim() || "N/A",
    designation: employee.designation || "N/A",
    email: employee.email,
    salaryDetails: {
      salaryType: employee.salaryDetails?.salaryType || "MONTHLY",
      baseAmount: employee.salaryDetails?.amount || 0,
      joiningDate: employee.salaryDetails?.joiningDate
    },
    summary: {
      totalPaidSalary,
      totalMonthsPaid,
      paymentModesUsed: [...new Set(paidRecords.map((r) => r.paymentMode))] // Unique modes used
    },
    paymentHistory: paymentBreakdown
  };
};


export const salaryService = {
  createSalary,
  getSalary,
  updateSalary,
  getAllEmployeesSalarySummary,
  getSalarySummary
};