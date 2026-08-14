import User from '../users/user.model.js';


export const findEmployeeById = async (employeeId) => {
    return await User.findById(employeeId);
};

export const updateSalaryDetails = async (employeeId, salaryDetails) => {
    return await User.findByIdAndUpdate(
        employeeId,
        { $set: { salaryDetails } },
        { new: true, runValidators: true }
    );
};

export const pushSalaryHistory = async (employeeId, historyItem) => {
    return await User.findByIdAndUpdate(
        employeeId,
        { $push: { salaryHistory: historyItem } },
        { new: true, runValidators: true }
    );
};

export const saveEmployee = async (userDoc) => {
    return await userDoc.save();
};


// export const findAllEmployeesSalaryData = async () => {
//   return await User.find({ isDeleted: false, role: { $ne: "SUPER_ADMIN" } })
//     .select("firstName lastName designation email department salaryDetails salaryHistory status")
//     .sort({ createdAt: -1 });
// };

export const findAllEmployeesSalaryData = async () => {
  return await User.find({
    isDeleted: false,
  })
    .select(
      "firstName lastName employeeId email department designation salaryDetails salaryHistory status"
    )
    .sort({ createdAt: -1 });
};


export const findEmployeeSalarySummary = async (employeeId) => {
  return await User.findById(employeeId).select(
    "firstName lastName designation email salaryDetails salaryHistory"
  );
};


export const getAllEmployeesSalaryDB = async () => {

    return await Salary.find({
        isDeleted: false
    })
    .populate("employee", "firstName lastName employeeId email")
    .populate("department", "name")
    .sort({ createdAt: -1 });

};