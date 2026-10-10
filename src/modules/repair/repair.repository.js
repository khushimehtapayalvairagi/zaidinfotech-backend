import Repair from "./repair.model.js";

// ======================================================
// CREATE
// ======================================================

export const createRepair = async (data) => {
  return await Repair.create(data);
};


// ======================================================
// GET BY ID
// ======================================================

export const getRepairById = async (id) => {
  return await Repair.findById(id)
    .populate(
      "user",
      "firstName lastName name email phone"
    )
    .populate(
      "product",
      "name sku"
    )
    .populate(
      "assignedTechnician",
      "firstName lastName name email phone"
    )
    .populate(
      "partsUsed.repairPart",
      "partName partSku category sellingPrice locationBin"
    );
};


// ======================================================
// GET ALL
// ======================================================

export const getAllRepairs = async () => {
  return await Repair.find()
    .populate(
      "user",
      "firstName lastName name email phone"
    )
    .populate(
      "product",
      "name sku"
    )
    .populate(
      "assignedTechnician",
      "firstName lastName name email phone"
    )
    .populate(
      "partsUsed.repairPart",
      "partName partSku category sellingPrice locationBin"
    )
    .sort({
      createdAt: -1,
    });
};


// ======================================================
// GET BY USER
// ======================================================

export const getRepairsByUser = async (
  userId
) => {
  return await Repair.find({
    user: userId,
  })
    .populate("user")
    .populate("product")
    .populate(
      "partsUsed.repairPart",
      "partName partSku category sellingPrice locationBin"
    )
    .sort({
      createdAt: -1,
    });
};


// ======================================================
// GET BY PRODUCT
// ======================================================

export const getRepairsByProduct = async (
  productId
) => {
  return await Repair.find({
    product: productId,
  })
    .populate("user")
    .populate("product")
    .sort({
      createdAt: -1,
    });
};


// ======================================================
// UPDATE
// ======================================================

export const updateRepair = async (
  id,
  updateData
) => {
  return await Repair.findByIdAndUpdate(
    id,
    {
      $set: updateData,
    },
    {
      new: true,
      runValidators: true,
    }
  );
};


// ======================================================
// UPDATE STATUS
// ======================================================

export const updateRepairStatus = async (
  id,
  status
) => {
  return await Repair.findByIdAndUpdate(
    id,
    {
      $set: {
        status,
      },
    },
    {
      new: true,
      runValidators: true,
    }
  );
};


// ======================================================
// DELETE
// ======================================================

export const deleteRepair = async (
  id
) => {
  return await Repair.findByIdAndDelete(id);
};


// ======================================================
// FIND BY TECHNICIAN
// ======================================================

export const findByTechnician = async (
  technicianId
) => {
  return await Repair.find({
    assignedTechnician: technicianId,
  })
    .populate(
      "assignedTechnician",
      "firstName lastName name email phone"
    )
    .populate(
      "user",
      "firstName lastName name email phone"
    )
    .populate(
      "product",
      "name sku"
    )
    .populate(
      "partsUsed.repairPart",
      "partName partSku category sellingPrice locationBin"
    )
    .sort({
      createdAt: -1,
    });
};


// ======================================================
// MARK DELIVERED
// ======================================================

export const markDelivered = async (
  id
) => {
  return await Repair.findByIdAndUpdate(
    id,
    {
      $set: {
        status: "Delivered",
        isDelivered: true,
        deliveredAt: new Date(),
      },
    },
    {
      new: true,
      runValidators: true,
    }
  );
};