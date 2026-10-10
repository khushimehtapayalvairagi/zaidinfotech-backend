import * as repairRepository from "./repair.repository.js";

import * as inventoryService
  from "../inventory/inventory.service.js";

import Product
  from "../products/product.model.js";

import Repair
  from "./repair.model.js";

import {
  createNotificationService,
  notifyAdminsService,
  notifyUserService,
} from "../notification/notification.service.js";


// ======================================================
// ADD SPARE PART TO REPAIR
// ======================================================

export const addRepairPart = async (
  repairId,
  productId,
  quantity,
  userId
) => {
  quantity = Number(quantity);

  if (
    !Number.isInteger(quantity) ||
    quantity <= 0
  ) {
    throw new Error(
      "Quantity must be a positive number"
    );
  }

  const repair =
    await repairRepository.getRepairById(
      repairId
    );

  if (!repair) {
    throw new Error(
      "Repair request not found"
    );
  }

  if (
    repair.status === "Completed" ||
    repair.status === "Cancelled" ||
    repair.status === "Delivered"
  ) {
    throw new Error(
      "Cannot add parts to this repair"
    );
  }

  const product =
    await Product.findById(productId);

  if (!product) {
    throw new Error(
      "Product not found"
    );
  }

  await inventoryService.useStockForRepairService(
    productId,
    quantity,
    userId,
    repairId
  );

  const unitCost =
    Number(product.price || 0);

  const totalCost =
    unitCost * quantity;

  /*
   * IMPORTANT:
   *
   * Current Repair model uses repairPart,
   * while this old method uses Product.
   *
   * Do not use this old method with the new
   * RepairPart schema until Product/RepairPart
   * migration is completed.
   */

  throw new Error(
    "Legacy Product-based repair part flow detected. Use /api/inventory/parts/attach-to-repair with repairPartId."
  );
};


// ======================================================
// CREATE REPAIR REQUEST
// ======================================================

export const createRepair = async (repairData) => {
  const {
    user,
    product,
    customerName,
    customerPhone,
    customerEmail,
    deviceModel,
    jobDate,
    deviceType,
    issueDescription,
    estimatedCompletionDate,
    repairCost,
    technicianName,
    assignedTechnician,
    remarks,
    serialNumber,
    priority,
    estimatedCost,
    status,
  } = repairData;

  // ==================================================
  // NORMALIZE VALUES
  // ==================================================

  const normalizedCustomerName =
    String(customerName || "").trim();

  const normalizedPhone =
    String(customerPhone || "").trim();
const normalizedDeviceType =
  String(deviceType || "").trim();

const normalizedJobDate =
  jobDate
    ? new Date(jobDate)
    : new Date();

if (
  Number.isNaN(normalizedJobDate.getTime())
) {
  throw new Error("Invalid job date.");
}
  // ==================================================
  // CUSTOMER EMAIL IS OPTIONAL
  // ==================================================
  //
  // If email is provided:
  //     trim + lowercase
  //
  // If email is empty/missing:
  //     use empty string
  //
  // IMPORTANT:
  // There is NO required validation for email.
  // ==================================================

  const normalizedEmail =
    typeof customerEmail === "string"
      ? customerEmail.trim().toLowerCase()
      : "";

  const normalizedDeviceModel =
    String(deviceModel || "").trim();

  const normalizedIssue =
    String(issueDescription || "").trim();

  // ==================================================
  // REQUIRED VALIDATIONS
  // ==================================================

  if (!normalizedCustomerName) {
    throw new Error(
      "Customer name is required."
    );
  }

  if (!normalizedPhone) {
    throw new Error(
      "Customer phone is required."
    );
  }

  // ==================================================
  // IMPORTANT
  // CUSTOMER EMAIL VALIDATION REMOVED
  //
  // DO NOT ADD:
  //
  // if (!normalizedEmail) {
  //   throw new Error(
  //     "Customer email is required."
  //   );
  // }
  //
  // Email is optional now.
  // ==================================================

  if (!normalizedDeviceModel) {
    throw new Error(
      "Device model is required."
    );
  }

  if (normalizedIssue.length < 5) {
    throw new Error(
      "Issue description must be at least 5 characters."
    );
  }

  // ==================================================
  // COST
  // ==================================================

  const finalRepairCost =
    Math.max(
      Number(repairCost) || 0,
      0
    );

  const finalEstimatedCost =
    Math.max(
      Number(estimatedCost) || 0,
      0
    );

  // ==================================================
  // CREATE REPAIR
  // ==================================================

  const repair =
    await repairRepository.createRepair({
      user:
        user || null,

      product:
        product || null,

      customerName:
        normalizedCustomerName,

      customerPhone:
        normalizedPhone,

      // =================================================
      // OPTIONAL EMAIL
      // =================================================

      customerEmail:
        normalizedEmail,

      jobDate: normalizedJobDate,

      deviceType: normalizedDeviceType,  

      deviceModel:
        normalizedDeviceModel,

      issueDescription:
        normalizedIssue,

      estimatedCompletionDate:
        estimatedCompletionDate || null,

      repairCost:
        finalRepairCost,

      estimatedCost:
        finalEstimatedCost,

      paymentStatus:
        finalRepairCost === 0
          ? "PAID"
          : "PENDING",

      paidAmount:
        0,

      balanceAmount:
        finalRepairCost,

      paymentMethod:
        "",

      paymentId:
        "",

      paidAt:
        null,

      technicianName:
        technicianName || "",

      assignedTechnician:
        assignedTechnician || null,

      remarks:
        remarks || "",

      serialNumber:
        serialNumber || "",

      priority:
        priority || "Medium",

      status:
        status || "Received",
    });

  // ==================================================
  // TECHNICIAN NOTIFICATION
  //
  // Notification failure must NOT make
  // repair creation fail.
  // ==================================================

  try {
    if (assignedTechnician) {
      await notifyUserService({
        userId:
          assignedTechnician,

        type:
          "REPAIR_ASSIGNED",

        title:
          "New Repair Assigned",

        message:
          `Repair for ${normalizedCustomerName} (${normalizedDeviceModel}) has been assigned to you.`,

        relatedId:
          repair._id,

        relatedModel:
          "Repair",
      });
    }
  } catch (notificationError) {
    console.error(
      "REPAIR TECHNICIAN NOTIFICATION ERROR:",
      notificationError
    );
  }

  // ==================================================
  // ADMIN NOTIFICATION
  //
  // Notification failure must NOT make
  // repair creation fail.
  // ==================================================

  try {
    await notifyAdminsService({
      type:
        "GENERAL",

      title:
        "New Repair Request",

      message:
        `New repair request created for ${normalizedCustomerName}.`,

      relatedId:
        repair._id,

      relatedModel:
        "Repair",
    });
  } catch (notificationError) {
    console.error(
      "REPAIR ADMIN NOTIFICATION ERROR:",
      notificationError
    );
  }

  return repair;
};


// ======================================================
// GET REPAIR BY ID
// ======================================================

export const getRepairById = async (
  id
) => {
  const repair =
    await repairRepository.getRepairById(
      id
    );

  if (!repair) {
    throw new Error(
      "Repair request not found."
    );
  }

  return repair;
};


// ======================================================
// GET ALL REPAIRS
// ======================================================

export const getAllRepairs = async () => {
  return await repairRepository.getAllRepairs();
};


// ======================================================
// GET REPAIRS BY USER
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
// GET REPAIRS BY PRODUCT
// ======================================================

export const getRepairsByProduct = async (
  productId
) => {
  return await repairRepository.getRepairsByProduct(
    productId
  );
};


// ======================================================
// UPDATE REPAIR
// ======================================================

export const updateRepair = async (
  id,
  data
) => {
  const repair =
    await repairRepository.updateRepair(
      id,
      data
    );

  if (!repair) {
    throw new Error(
      "Repair request not found."
    );
  }

  return repair;
};


// ======================================================
// UPDATE REPAIR STATUS
// ======================================================

export const updateRepairStatus = async (
  id,
  status
) => {
  const repair =
    await repairRepository.updateRepairStatus(
      id,
      status
    );

  if (!repair) {
    throw new Error(
      "Repair request not found."
    );
  }

  // ==================================================
  // NOTIFICATIONS SHOULD NOT BREAK STATUS UPDATE
  // ==================================================

  try {
    if (status === "Completed") {
      if (repair.user) {
        await notifyUserService({
          userId:
            repair.user._id ||
            repair.user,

          type:
            "REPAIR_COMPLETED",

          title:
            "Repair Completed",

          message:
            "Your repair has been completed successfully.",

          relatedId:
            repair._id,

          relatedModel:
            "Repair",
        });
      }

      if (repair.assignedTechnician) {
        await notifyUserService({
          userId:
            repair.assignedTechnician._id ||
            repair.assignedTechnician,

          type:
            "REPAIR_COMPLETED",

          title:
            "Repair Completed",

          message:
            "The repair has been marked as completed.",

          relatedId:
            repair._id,

          relatedModel:
            "Repair",
        });
      }

      await notifyAdminsService({
        type:
          "REPAIR_COMPLETED",

        title:
          "Repair Completed",

        message:
          `Repair for ${repair.customerName || "customer"} has been completed.`,

        relatedId:
          repair._id,

        relatedModel:
          "Repair",
      });
    }

    if (status === "Cancelled") {
      if (repair.assignedTechnician) {
        await notifyUserService({
          userId:
            repair.assignedTechnician._id ||
            repair.assignedTechnician,

          type:
            "REPAIR_CANCELLED",

          title:
            "Repair Cancelled",

          message:
            `Repair for ${repair.customerName || "customer"} has been cancelled.`,

          relatedId:
            repair._id,

          relatedModel:
            "Repair",
        });
      }

      await notifyAdminsService({
        type:
          "REPAIR_CANCELLED",

        title:
          "Repair Cancelled",

        message:
          `Repair for ${repair.customerName || "customer"} has been cancelled.`,

        relatedId:
          repair._id,

        relatedModel:
          "Repair",
      });
    }

    if (
      status === "In Progress" ||
      status === "Assigned" ||
      status === "Waiting for Parts"
    ) {
      if (repair.user) {
        await notifyUserService({
          userId:
            repair.user._id ||
            repair.user,

          type:
            "REPAIR_STATUS_CHANGED",

          title:
            "Repair Status Updated",

          message:
            `Your repair status is now "${status}".`,

          relatedId:
            repair._id,

          relatedModel:
            "Repair",
        });
      }
    }
  } catch (notificationError) {
    console.error(
      "REPAIR STATUS NOTIFICATION ERROR:",
      notificationError
    );
  }

  return repair;
};


// ======================================================
// MARK DELIVERED
// ======================================================

export const markDelivered = async (
  id
) => {
  const repair =
    await repairRepository.markDelivered(
      id
    );

  if (!repair) {
    throw new Error(
      "Repair request not found."
    );
  }

  try {
    if (repair.user) {
      await notifyUserService({
        userId:
          repair.user._id ||
          repair.user,

        type:
          "REPAIR_DELIVERED",

        title:
          "Repair Delivered",

        message:
          "Your repaired device has been marked as delivered.",

        relatedId:
          repair._id,

        relatedModel:
          "Repair",
      });
    }

    if (repair.assignedTechnician) {
      await notifyUserService({
        userId:
          repair.assignedTechnician._id ||
          repair.assignedTechnician,

        type:
          "REPAIR_DELIVERED",

        title:
          "Repair Delivered",

        message:
          "The repair has been delivered to the customer.",

        relatedId:
          repair._id,

        relatedModel:
          "Repair",
      });
    }

    await notifyAdminsService({
      type:
        "REPAIR_DELIVERED",

      title:
        "Repair Delivered",

      message:
        `Repair for ${repair.customerName || "customer"} has been delivered.`,

      relatedId:
        repair._id,

      relatedModel:
        "Repair",
    });
  } catch (notificationError) {
    console.error(
      "REPAIR DELIVERY NOTIFICATION ERROR:",
      notificationError
    );
  }

  return repair;
};


// ======================================================
// DELETE REPAIR
// ======================================================

export const deleteRepair = async (
  id
) => {
  const repair =
    await repairRepository.deleteRepair(
      id
    );

  if (!repair) {
    throw new Error(
      "Repair request not found."
    );
  }

  return repair;
};


// ======================================================
// GET REPAIRS BY TECHNICIAN
// ======================================================

export const getRepairsByTechnician = async (
  technicianId
) => {
  return await repairRepository.findByTechnician(
    technicianId
  );
};


// ======================================================
// UPDATE REPAIR PAYMENT
// ======================================================

export const updateRepairPayment = async (
  id,
  paymentData
) => {
  const repair =
    await Repair.findById(id);

  if (!repair) {
    throw new Error(
      "Repair request not found."
    );
  }

  const repairCost =
    Math.max(
      Number(repair.repairCost || 0),
      0
    );

  let paidAmount =
    Number(paymentData.paidAmount);

  if (
    !Number.isFinite(paidAmount) ||
    paidAmount < 0
  ) {
    throw new Error(
      "Invalid paid amount."
    );
  }

  if (paidAmount > repairCost) {
    paidAmount = repairCost;
  }

  const balanceAmount =
    Math.max(
      repairCost - paidAmount,
      0
    );

  let paymentStatus =
    "PENDING";

  if (
    paymentData.paymentStatus ===
    "FAILED"
  ) {
    paymentStatus =
      "FAILED";

  } else if (
    paymentData.paymentStatus ===
    "REFUNDED"
  ) {
    paymentStatus =
      "REFUNDED";

  } else if (
    repairCost === 0
  ) {
    paymentStatus =
      "PAID";

  } else if (
    paidAmount >= repairCost
  ) {
    paymentStatus =
      "PAID";

  } else if (
    paidAmount > 0
  ) {
    paymentStatus =
      "PARTIAL";
  }

  repair.paidAmount =
    paidAmount;

  repair.balanceAmount =
    balanceAmount;

  repair.paymentStatus =
    paymentStatus;

  if (
    paymentData.paymentMethod !==
    undefined
  ) {
    repair.paymentMethod =
      paymentData.paymentMethod;
  }

  if (
    paymentData.paymentId !==
    undefined
  ) {
    repair.paymentId =
      paymentData.paymentId;
  }

  if (
    paymentStatus === "PAID"
  ) {
    repair.paidAt =
      new Date();
  } else {
    repair.paidAt =
      null;
  }

  await repair.save();

  return repair;
};