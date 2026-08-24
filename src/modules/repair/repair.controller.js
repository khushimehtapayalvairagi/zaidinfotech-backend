import * as repairService from "./repair.service.js"

// Create Repair Request
export const createRepair = async (req, res, next) => {
  try {
    const repair = await repairService.createRepair(req.body);

    return res.status(201).json({
      success: true,
      message: "Repair request created successfully.",
      data: repair,
    });
  } catch (error) {
    next(error);
  }
};

// Get All Repair Requests
export const getAllRepairs = async (req, res, next) => {
  try {
    const repairs = await repairService.getAllRepairs();

    return res.status(200).json({
      success: true,
      count: repairs.length,
      data: repairs,
    });
  } catch (error) {
    next(error);
  }
};

// Get Repair By Id
export const getRepairById = async (req, res, next) => {
  try {
    const repair = await repairService.getRepairById(req.params.id);

    return res.status(200).json({
      success: true,
      data: repair,
    });
  } catch (error) {
    next(error);
  }
};

// Get Repairs By User
export const getRepairsByUser = async (req, res, next) => {
  try {
    const repairs = await repairService.getRepairsByUser(req.params.userId);

    return res.status(200).json({
      success: true,
      count: repairs.length,
      data: repairs,
    });
  } catch (error) {
    next(error);
  }
};

// Get Repairs By Product
export const getRepairsByProduct = async (req, res, next) => {
  try {
    const repairs = await repairService.getRepairsByProduct(
      req.params.productId
    );

    return res.status(200).json({
      success: true,
      count: repairs.length,
      data: repairs,
    });
  } catch (error) {
    next(error);
  }
};

// Update Repair Details
export const updateRepair = async (req, res, next) => {
  try {
    const repair = await repairService.updateRepair(
      req.params.id,
      req.body
    );

    return res.status(200).json({
      success: true,
      message: "Repair updated successfully.",
      data: repair,
    });
  } catch (error) {
    next(error);
  }
};

// Update Repair Status
export const updateRepairStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    const repair = await repairService.updateRepairStatus(
      req.params.id,
      status
    );

    return res.status(200).json({
      success: true,
      message: "Repair status updated successfully.",
      data: repair,
    });
  } catch (error) {
    next(error);
  }
};

// Mark Repair Delivered
export const markDelivered = async (req, res, next) => {
  try {
    const repair = await repairService.markDelivered(req.params.id);

    return res.status(200).json({
      success: true,
      message: "Repair marked as delivered successfully.",
      data: repair,
    });
  } catch (error) {
    next(error);
  }
};

// Delete Repair Request
export const deleteRepair = async (req, res, next) => {
  try {
    await repairService.deleteRepair(req.params.id);

    return res.status(200).json({
      success: true,
      message: "Repair request deleted successfully.",
    });
  } catch (error) {
    next(error);
  }
};


// ======================================================
// ADD REPAIR PART
// ======================================================

export const addRepairPart = async (
  req,
  res,
  next
) => {

  try {

    const {
      productId,
      quantity
    } = req.body;

    const repair =
      await repairService.addRepairPart(
        req.params.id,
        productId,
        quantity,
        req.user.id
      );

    return res.status(200).json({

      success: true,

      message:
        "Spare part added successfully and inventory updated",

      data: repair,

    });

  }
  catch (error) {

    next(error);

  }

};

// export {
//   createRepair,
//   getAllRepairs,
//   getRepairById,
//   getRepairsByUser,
//   getRepairsByProduct,
//   updateRepair,
//   updateRepairStatus,
//   markDelivered,
//   deleteRepair,
// };