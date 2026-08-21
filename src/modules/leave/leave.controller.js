import * as leaveService from "./leave.service.js";

// ======================================================
// APPLY LEAVE
// EMPLOYEE
// ======================================================

export const applyLeave = async (req, res) => {
  try {
    const {
      leaveType,
      fromDate,
      toDate,
      reason,
    } = req.body;

    if (
      !leaveType ||
      !fromDate ||
      !toDate ||
      !reason
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Leave type, dates and reason are required.",
      });
    }

    const leave =
      await leaveService.applyLeave({
        userId: req.user._id,
        employeeId: req.user.employeeId,
        leaveType,
        fromDate,
        toDate,
        reason,
      });

    return res.status(201).json({
      success: true,
      message:
        "Leave request submitted successfully.",
      leave,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// ======================================================
// MY LEAVES
// EMPLOYEE
// ======================================================

export const getMyLeaves = async (
  req,
  res
) => {
  try {
    const leaves =
      await leaveService.getMyLeaves(
        req.user._id
      );

    return res.status(200).json({
      success: true,
      leaves,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// ======================================================
// ALL LEAVES
// ADMIN
// ======================================================

export const getAllLeaves = async (
  req,
  res
) => {
  try {
    const leaves =
      await leaveService.getAllLeaves();

    return res.status(200).json({
      success: true,
      leaves,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// ======================================================
// SINGLE LEAVE
// ======================================================

export const getLeaveById = async (
  req,
  res
) => {
  try {
    const leave =
      await leaveService.getLeaveById(
        req.params.id
      );

    return res.status(200).json({
      success: true,
      leave,
    });
  } catch (error) {
    return res.status(404).json({
      success: false,
      message: error.message,
    });
  }
};

// ======================================================
// APPROVE
// ADMIN
// ======================================================

export const approveLeave = async (
  req,
  res
) => {
  try {
    const {
      adminRemark = "",
    } = req.body;

    const leave =
      await leaveService.approveLeave(
        req.params.id,
        req.user._id,
        adminRemark
      );

    return res.status(200).json({
      success: true,
      message:
        "Leave approved successfully.",
      leave,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// ======================================================
// REJECT
// ADMIN
// ======================================================

export const rejectLeave = async (
  req,
  res
) => {
  try {
    const {
      adminRemark,
    } = req.body;

    const leave =
      await leaveService.rejectLeave(
        req.params.id,
        req.user._id,
        adminRemark
      );

    return res.status(200).json({
      success: true,
      message:
        "Leave rejected successfully.",
      leave,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// ======================================================
// CANCEL
// EMPLOYEE
// ======================================================

export const cancelLeave = async (
  req,
  res
) => {
  try {
    const leave =
      await leaveService.cancelLeave(
        req.params.id,
        req.user._id
      );

    return res.status(200).json({
      success: true,
      message:
        "Leave cancelled successfully.",
      leave,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// ======================================================
// CREATE POLICY
// ADMIN
// ======================================================

export const createLeavePolicy = async (
  req,
  res
) => {
  try {
    const policy =
      await leaveService.createLeavePolicy({
        ...req.body,
        adminId: req.user._id,
      });

    return res.status(201).json({
      success: true,
      message:
        "Leave policy created successfully.",
      policy,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// ======================================================
// GET POLICIES
// ======================================================

export const getLeavePolicies = async (
  req,
  res
) => {
  try {
    const policies =
      await leaveService.getLeavePolicies();

    return res.status(200).json({
      success: true,
      policies,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// ======================================================
// UPDATE POLICY
// ADMIN
// ======================================================

export const updateLeavePolicy = async (
  req,
  res
) => {
  try {
    const policy =
      await leaveService.updateLeavePolicy(
        req.params.id,
        req.body,
        req.user._id
      );

    return res.status(200).json({
      success: true,
      message:
        "Leave policy updated successfully.",
      policy,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// ======================================================
// CREATE HOLIDAY
// ADMIN
// ======================================================

export const createHoliday = async (
  req,
  res
) => {
  try {
    const holiday =
      await leaveService.createHoliday({
        ...req.body,
        adminId: req.user._id,
      });

    return res.status(201).json({
      success: true,
      message:
        "Holiday created successfully.",
      holiday,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// ======================================================
// GET HOLIDAYS
// ALL AUTHENTICATED USERS
// ======================================================

export const getHolidays = async (
  req,
  res
) => {
  try {
    const {
      startDate,
      endDate,
    } = req.query;

    const holidays =
      await leaveService.getHolidays(
        startDate,
        endDate
      );

    return res.status(200).json({
      success: true,
      holidays,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// ======================================================
// GET HOLIDAY
// ======================================================

export const getHolidayById = async (
  req,
  res
) => {
  try {
    const holiday =
      await leaveService.getHolidayById(
        req.params.id
      );

    return res.status(200).json({
      success: true,
      holiday,
    });
  } catch (error) {
    return res.status(404).json({
      success: false,
      message: error.message,
    });
  }
};

// ======================================================
// UPDATE HOLIDAY
// ADMIN
// ======================================================

export const updateHoliday = async (
  req,
  res
) => {
  try {
    const holiday =
      await leaveService.updateHoliday(
        req.params.id,
        req.body
      );

    return res.status(200).json({
      success: true,
      message:
        "Holiday updated successfully.",
      holiday,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// ======================================================
// DELETE HOLIDAY
// ADMIN
// ======================================================

export const deleteHoliday = async (
  req,
  res
) => {
  try {
    await leaveService.deleteHoliday(
      req.params.id
    );

    return res.status(200).json({
      success: true,
      message:
        "Holiday deleted successfully.",
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};