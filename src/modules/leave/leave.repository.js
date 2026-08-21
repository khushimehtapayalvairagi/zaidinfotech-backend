import Leave from "./leave.model.js";
import LeavePolicy from "./leavePolicy.model.js";
import Holiday from "./holiday.model.js";

// ======================================================
// LEAVE
// ======================================================

export const createLeave = async (data) => {
  return await Leave.create(data);
};

export const findLeaveById = async (id) => {
  return await Leave.findById(id)
    .populate(
      "user",
      "firstName lastName employeeId email phone"
    )
    .populate(
      "actionBy",
      "firstName lastName role"
    );
};

export const findLeavesByUser = async (userId) => {
  return await Leave.find({
    user: userId,
  }).sort({
    createdAt: -1,
  });
};

export const findAllLeaves = async () => {
  return await Leave.find()
    .populate(
      "user",
      "firstName lastName employeeId email phone"
    )
    .populate(
      "actionBy",
      "firstName lastName role"
    )
    .sort({
      createdAt: -1,
    });
};

export const updateLeaveStatus = async (
  leaveId,
  status,
  actionBy,
  adminRemark = ""
) => {
  return await Leave.findByIdAndUpdate(
    leaveId,
    {
      status,
      actionBy,
      adminRemark,
      actionAt: new Date(),
    },
    {
      new: true,
      runValidators: true,
    }
  );
};

// ======================================================
// CHECK OVERLAPPING LEAVE
// ======================================================

export const findOverlappingLeave = async (
  userId,
  fromDate,
  toDate
) => {
  return await Leave.findOne({
    user: userId,

    status: {
      $in: [
        "PENDING",
        "APPROVED",
      ],
    },

    fromDate: {
      $lte: toDate,
    },

    toDate: {
      $gte: fromDate,
    },
  });
};

// ======================================================
// LEAVE POLICY
// ======================================================

export const createLeavePolicy = async (data) => {
  return await LeavePolicy.create(data);
};

export const getLeavePolicies = async () => {
  return await LeavePolicy.find({
    isActive: true,
  }).sort({
    leaveType: 1,
  });
};

export const getLeavePolicyByType = async (
  leaveType
) => {
  return await LeavePolicy.findOne({
    leaveType,
    isActive: true,
  });
};

export const updateLeavePolicy = async (
  id,
  data
) => {
  return await LeavePolicy.findByIdAndUpdate(
    id,
    data,
    {
      new: true,
      runValidators: true,
    }
  );
};

// ======================================================
// HOLIDAY
// ======================================================

export const createHoliday = async (data) => {
  return await Holiday.create(data);
};

export const getHolidays = async (
  startDate = null,
  endDate = null
) => {
  const query = {
    isActive: true,
  };

  if (startDate && endDate) {
    query.date = {
      $gte: startDate,
      $lte: endDate,
    };
  }

  return await Holiday.find(query)
    .populate(
      "createdBy",
      "firstName lastName role"
    )
    .sort({
      date: 1,
    });
};

export const getHolidayById = async (id) => {
  return await Holiday.findById(id);
};

export const updateHoliday = async (
  id,
  data
) => {
  return await Holiday.findByIdAndUpdate(
    id,
    data,
    {
      new: true,
      runValidators: true,
    }
  );
};

export const deleteHoliday = async (id) => {
  return await Holiday.findByIdAndUpdate(
    id,
    {
      isActive: false,
    },
    {
      new: true,
    }
  );
};