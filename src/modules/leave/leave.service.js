import * as leaveRepository from "./leave.repository.js";

// ======================================================
// DATE HELPERS
// ======================================================

const normalizeDate = (date) => {
  const d = new Date(date);

  d.setHours(0, 0, 0, 0);

  return d;
};

const calculateDays = (
  fromDate,
  toDate,
  holidays = []
) => {
  const start = normalizeDate(fromDate);
  const end = normalizeDate(toDate);

  if (start > end) {
    throw new Error(
      "From date cannot be greater than To date."
    );
  }

  let totalDays = 0;

  const current = new Date(start);

  while (current <= end) {
    const day = current.getDay();

    // Sunday exclude
    if (day !== 0) {
      const isHoliday = holidays.some(
        (holiday) => {
          const holidayDate =
            normalizeDate(holiday.date);

          return (
            holidayDate.getTime() ===
            current.getTime()
          );
        }
      );

      if (!isHoliday) {
        totalDays++;
      }
    }

    current.setDate(
      current.getDate() + 1
    );
  }

  return totalDays;
};

// ======================================================
// APPLY LEAVE
// ======================================================

export const applyLeave = async ({
  userId,
  employeeId,
  leaveType,
  fromDate,
  toDate,
  reason,
}) => {
  const start = normalizeDate(fromDate);
  const end = normalizeDate(toDate);

  if (start > end) {
    throw new Error(
      "From date cannot be greater than To date."
    );
  }

  // --------------------------------------------------
  // Check overlapping request
  // --------------------------------------------------

  const existingLeave =
    await leaveRepository.findOverlappingLeave(
      userId,
      start,
      end
    );

  if (existingLeave) {
    throw new Error(
      "You already have a leave request for these dates."
    );
  }

  // --------------------------------------------------
  // Get holidays
  // --------------------------------------------------

  const holidays =
    await leaveRepository.getHolidays(
      start,
      end
    );

  // --------------------------------------------------
  // Calculate actual leave days
  // Sunday + holiday excluded
  // --------------------------------------------------

  const totalDays = calculateDays(
    start,
    end,
    holidays
  );

  if (totalDays <= 0) {
    throw new Error(
      "Selected dates do not contain any working day."
    );
  }

  // --------------------------------------------------
  // Check Leave Policy
  // --------------------------------------------------

  if (leaveType !== "UNPAID") {
    const policy =
      await leaveRepository.getLeavePolicyByType(
        leaveType
      );

    if (!policy) {
      throw new Error(
        `Leave policy not configured for ${leaveType}.`
      );
    }

    // Current month's request total
    const monthStart = new Date(
      start.getFullYear(),
      start.getMonth(),
      1
    );

    const monthEnd = new Date(
      start.getFullYear(),
      start.getMonth() + 1,
      0,
      23,
      59,
      59,
      999
    );

    const existingLeaves =
      await leaveRepository.findLeavesByUser(
        userId
      );

    const usedDays =
      existingLeaves
        .filter((leave) => {
          const leaveDate =
            normalizeDate(leave.fromDate);

          return (
            leave.leaveType === leaveType &&
            ["PENDING", "APPROVED"].includes(
              leave.status
            ) &&
            leaveDate >= monthStart &&
            leaveDate <= monthEnd
          );
        })
        .reduce(
          (sum, leave) =>
            sum + leave.totalDays,
          0
        );

    const available =
      policy.monthlyLimit - usedDays;

    if (totalDays > available) {
      throw new Error(
        `You can only apply for ${Math.max(
          0,
          available
        )} ${leaveType} Leave days.`
      );
    }
  }

  // --------------------------------------------------
  // Create Leave
  // --------------------------------------------------

  return await leaveRepository.createLeave({
    user: userId,
    employeeId,
    leaveType,
    fromDate: start,
    toDate: end,
    totalDays,
    reason,
    status: "PENDING",
  });
};

// ======================================================
// GET MY LEAVES
// ======================================================

export const getMyLeaves = async (userId) => {
  return await leaveRepository.findLeavesByUser(
    userId
  );
};

// ======================================================
// GET ALL LEAVES
// ADMIN
// ======================================================

export const getAllLeaves = async () => {
  return await leaveRepository.findAllLeaves();
};

// ======================================================
// GET SINGLE LEAVE
// ======================================================

export const getLeaveById = async (id) => {
  const leave =
    await leaveRepository.findLeaveById(id);

  if (!leave) {
    throw new Error("Leave request not found.");
  }

  return leave;
};

// ======================================================
// APPROVE
// ======================================================

export const approveLeave = async (
  leaveId,
  adminId,
  adminRemark = ""
) => {
  const leave =
    await leaveRepository.findLeaveById(
      leaveId
    );

  if (!leave) {
    throw new Error(
      "Leave request not found."
    );
  }

  if (leave.status !== "PENDING") {
    throw new Error(
      "Only pending leave can be approved."
    );
  }

  return await leaveRepository.updateLeaveStatus(
    leaveId,
    "APPROVED",
    adminId,
    adminRemark
  );
};

// ======================================================
// REJECT
// ======================================================

export const rejectLeave = async (
  leaveId,
  adminId,
  adminRemark = ""
) => {
  const leave =
    await leaveRepository.findLeaveById(
      leaveId
    );

  if (!leave) {
    throw new Error(
      "Leave request not found."
    );
  }

  if (leave.status !== "PENDING") {
    throw new Error(
      "Only pending leave can be rejected."
    );
  }

  if (!adminRemark) {
    throw new Error(
      "Rejection remark is required."
    );
  }

  return await leaveRepository.updateLeaveStatus(
    leaveId,
    "REJECTED",
    adminId,
    adminRemark
  );
};

// ======================================================
// CANCEL
// ======================================================

export const cancelLeave = async (
  leaveId,
  userId
) => {
  const leave =
    await leaveRepository.findLeaveById(
      leaveId
    );

  if (!leave) {
    throw new Error(
      "Leave request not found."
    );
  }

  if (
    leave.user._id.toString() !==
    userId.toString()
  ) {
    throw new Error(
      "You can only cancel your own leave."
    );
  }

  if (leave.status !== "PENDING") {
    throw new Error(
      "Only pending leave can be cancelled."
    );
  }

  return await leaveRepository.updateLeaveStatus(
    leaveId,
    "CANCELLED",
    userId,
    "Cancelled by employee"
  );
};

// ======================================================
// LEAVE POLICY
// ======================================================

export const createLeavePolicy = async ({
  leaveType,
  monthlyLimit,
  yearlyLimit,
  carryForward,
  adminId,
}) => {
  return await leaveRepository.createLeavePolicy({
    leaveType,
    monthlyLimit,
    yearlyLimit,
    carryForward,
    createdBy: adminId,
  });
};

export const getLeavePolicies = async () => {
  return await leaveRepository.getLeavePolicies();
};

export const updateLeavePolicy = async (
  id,
  data,
  adminId
) => {
  return await leaveRepository.updateLeavePolicy(
    id,
    {
      ...data,
      updatedBy: adminId,
    }
  );
};

// ======================================================
// HOLIDAY
// ======================================================

export const createHoliday = async ({
  title,
  date,
  holidayType,
  description,
  adminId,
}) => {
  return await leaveRepository.createHoliday({
    title,
    date: normalizeDate(date),
    holidayType,
    description,
    createdBy: adminId,
  });
};

export const getHolidays = async (
  startDate,
  endDate
) => {
  return await leaveRepository.getHolidays(
    startDate
      ? normalizeDate(startDate)
      : null,
    endDate
      ? normalizeDate(endDate)
      : null
  );
};

export const getHolidayById = async (id) => {
  const holiday =
    await leaveRepository.getHolidayById(id);

  if (!holiday) {
    throw new Error("Holiday not found.");
  }

  return holiday;
};

export const updateHoliday = async (
  id,
  data
) => {
  const holiday =
    await leaveRepository.getHolidayById(id);

  if (!holiday) {
    throw new Error("Holiday not found.");
  }

  if (data.date) {
    data.date = normalizeDate(data.date);
  }

  return await leaveRepository.updateHoliday(
    id,
    data
  );
};

export const deleteHoliday = async (id) => {
  const holiday =
    await leaveRepository.getHolidayById(id);

  if (!holiday) {
    throw new Error("Holiday not found.");
  }

  return await leaveRepository.deleteHoliday(
    id
  );
};