import * as repairRepository from "./repair.repository.js"

import * as inventoryService
  from "../inventory/inventory.service.js";

import Product
  from "../products/product.model.js";

import {
  createNotificationService,
  notifyAdminsService,
  notifyUserService,
} from "../notification/notification.service.js";


import User from "../users/user.model.js";

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

  // ==========================================
  // FIND REPAIR
  // ==========================================

  const repair =
    await repairRepository.getRepairById(
      repairId
    );

  if (!repair) {

    throw new Error(
      "Repair request not found"
    );

  }

  // ==========================================
  // STATUS CHECK
  // ==========================================

  if (
    repair.status === "Completed"
  ) {

    throw new Error(
      "Cannot add parts to completed repair"
    );

  }

  if (
    repair.status === "Cancelled"
  ) {

    throw new Error(
      "Cannot add parts to cancelled repair"
    );

  }

  // ==========================================
  // FIND PRODUCT
  // ==========================================

  const product =
    await Product.findById(productId);

  if (!product) {

    throw new Error(
      "Product not found"
    );

  }

  // ==========================================
  // INVENTORY STOCK
  // ==========================================

  await inventoryService
    .useStockForRepairService(
      productId,
      quantity,
      userId,
      repairId
    );

  // ==========================================
  // PRODUCT COST
  // ==========================================

  const unitCost =
    Number(product.price || 0);

  const totalCost =
    unitCost * quantity;

  // ==========================================
  // ADD PART
  // ==========================================

  repair.partsUsed.push({

    product: productId,

    quantity,

    unitCost,

    totalCost,

  });

  // ==========================================
  // TOTAL PART COST
  // ==========================================

  repair.partsCost =
    repair.partsUsed.reduce(
      (total, part) => {

        return (
          total +
          Number(part.totalCost || 0)
        );

      },
      0
    );

  // ==========================================
  // RECEIVED → IN PROGRESS
  // ==========================================

  if (
    repair.status === "Received"
  ) {

    repair.status =
      "In Progress";

  }

  await repair.save();

  return repair;

};

// Create Repair Request
// export const createRepair = async (repairData) => {
//   const {
//     customerName,
//     customerPhone,
//     customerEmail,
//     deviceModel,
//     issueDescription,
//     estimatedCompletionDate,
//     repairCost,
//     technicianName,
//     assignedTechnician,
//     remarks,
//   } = repairData;

//   const repair = await repairRepository.createRepair({
//     customerName,
//     customerPhone,
//     customerEmail,
//     deviceModel,
//     issueDescription,
//     estimatedCompletionDate,
//     repairCost: repairCost || 0,
//     technicianName: technicianName || "",
//     remarks: remarks || "",
//     assignedTechnician: assignedTechnician || null,
//   });

//   return repair;
// };


export const createRepair = async (repairData) => {
  const {
    customerName,
    customerPhone,
    customerEmail,
    deviceModel,
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

  const repair = await repairRepository.createRepair({
    customerName,
    customerPhone,
    customerEmail,
    deviceModel,
    issueDescription,
    estimatedCompletionDate,
    repairCost: repairCost || 0,
    technicianName: technicianName || "",
    assignedTechnician: assignedTechnician || null,
    remarks: remarks || "",
    serialNumber: serialNumber || "",
    priority: priority || "Medium",
    estimatedCost: estimatedCost || 0,
    status: status || "Received",
  });

  // ==========================================
  // TECHNICIAN NOTIFICATION
  // ==========================================

  if (assignedTechnician) {
    await notifyUserService({
      userId: assignedTechnician,
      type: "REPAIR_ASSIGNED",
      title: "New Repair Assigned",
      message: `Repair for ${customerName} (${deviceModel || "Device"}) has been assigned to you.`,
      relatedId: repair._id,
      relatedModel: "Repair",
    });
  }

  // ==========================================
  // ADMIN NOTIFICATION
  // ==========================================

  await notifyAdminsService({
    type: "GENERAL",
    title: "New Repair Request",
    message: `New repair request created for ${customerName}.`,
    relatedId: repair._id,
    relatedModel: "Repair",
  });

  return repair;
};

// Get Repair By Id
export const getRepairById = async (id) => {
  const repair = await repairRepository.getRepairById(id);

  if (!repair) {
    throw new Error("Repair request not found.");
  }

  return repair;
};

// Get All Repairs
export const getAllRepairs = async () => {
  return await repairRepository.getAllRepairs();
};

// Get Repairs By User
// export const getRepairsByUser = async (userId) => {
//   return await repairRepository.getRepairsByUser(userId);
// };

export const getRepairsByUser = async (userId) => {
  return await Repair.find({
    user: userId,
  })
    .populate("user")
    .populate("product")
    .sort({ createdAt: -1 });
};


// Get Repairs By Product
export const getRepairsByProduct = async (productId) => {
  return await repairRepository.getRepairsByProduct(productId);
};

// Update Repair
export const updateRepair = async (id, data) => {
  const repair = await repairRepository.updateRepair(id, data);
  if (!repair) {
    throw new Error("Repair request not found."); // <--- Triggered here
  }

  return repair;
};

// Update Repair Status
// export const updateRepairStatus = async (id, status) => {

//   const repair =
//     await repairRepository.updateRepairStatus(
//       id,
//       status
//     );

//   if (!repair) {
//     throw new Error(
//       "Repair request not found."
//     );
//   }


//   // ==========================================
//   // REPAIR COMPLETED
//   // ==========================================

//   if (status === "Completed") {

//     // -----------------------------
//     // CUSTOMER NOTIFICATION
//     // -----------------------------

//     if (repair.user) {

//       await createNotificationService({

//         user: repair.user._id || repair.user,

//         type: "REPAIR_COMPLETED",

//         title: "Repair Completed",

//         message:
//           "Your repair has been completed successfully.",

//         relatedId: repair._id,

//         relatedModel: "Repair"

//       });

//     }


//     // -----------------------------
//     // RECEPTIONIST NOTIFICATION
//     // -----------------------------

//     // Agar repair mein receptionist saved hai
//     if (repair.receptionist) {

//       await createNotificationService({

//         user:
//           repair.receptionist._id ||
//           repair.receptionist,

//         type: "REPAIR_COMPLETED",

//         title: "Repair Completed",

//         message:
//           "The assigned repair has been completed by the technician.",

//         relatedId: repair._id,

//         relatedModel: "Repair"

//       });

//     }

//   }


//   return repair;

// };

export const updateRepairStatus = async (id, status) => {
  const repair =
    await repairRepository.updateRepairStatus(id, status);

  if (!repair) {
    throw new Error("Repair request not found.");
  }

  // ==========================================
  // COMPLETED
  // ==========================================

  if (status === "Completed") {
    // Customer
    if (repair.user) {
      await notifyUserService({
        userId: repair.user._id || repair.user,
        type: "REPAIR_COMPLETED",
        title: "Repair Completed",
        message:
          "Your repair has been completed successfully.",
        relatedId: repair._id,
        relatedModel: "Repair",
      });
    }

    // Assigned technician
    if (repair.assignedTechnician) {
      await notifyUserService({
        userId:
          repair.assignedTechnician._id ||
          repair.assignedTechnician,
        type: "REPAIR_COMPLETED",
        title: "Repair Completed",
        message:
          "The repair has been marked as completed.",
        relatedId: repair._id,
        relatedModel: "Repair",
      });
    }

    // Admin
    await notifyAdminsService({
      type: "REPAIR_COMPLETED",
      title: "Repair Completed",
      message:
        `Repair for ${repair.customerName || "customer"} has been completed.`,
      relatedId: repair._id,
      relatedModel: "Repair",
    });
  }

  // ==========================================
  // CANCELLED
  // ==========================================

  if (status === "Cancelled") {
    if (repair.assignedTechnician) {
      await notifyUserService({
        userId:
          repair.assignedTechnician._id ||
          repair.assignedTechnician,
        type: "REPAIR_CANCELLED",
        title: "Repair Cancelled",
        message:
          `Repair for ${repair.customerName || "customer"} has been cancelled.`,
        relatedId: repair._id,
        relatedModel: "Repair",
      });
    }

    await notifyAdminsService({
      type: "REPAIR_CANCELLED",
      title: "Repair Cancelled",
      message:
        `Repair for ${repair.customerName || "customer"} has been cancelled.`,
      relatedId: repair._id,
      relatedModel: "Repair",
    });
  }

  // ==========================================
  // OTHER STATUS
  // ==========================================

  if (
    status === "In Progress" ||
    status === "Assigned" ||
    status === "Waiting for Parts"
  ) {
    if (repair.user) {
      await notifyUserService({
        userId: repair.user._id || repair.user,
        type: "REPAIR_STATUS_CHANGED",
        title: "Repair Status Updated",
        message: `Your repair status is now "${status}".`,
        relatedId: repair._id,
        relatedModel: "Repair",
      });
    }
  }

  return repair;
};



// Mark Repair Delivered
// export const markDelivered = async (id) => {
//   const repair = await repairRepository.markDelivered(id);

//   if (!repair) {
//     throw new Error("Repair request not found.");
//   }

//   return repair;
// };


export const markDelivered = async (id) => {
  const repair =
    await repairRepository.markDelivered(id);

  if (!repair) {
    throw new Error("Repair request not found.");
  }

  // Customer notification
  if (repair.user) {
    await notifyUserService({
      userId: repair.user._id || repair.user,
      type: "REPAIR_DELIVERED",
      title: "Repair Delivered",
      message:
        "Your repaired device has been marked as delivered.",
      relatedId: repair._id,
      relatedModel: "Repair",
    });
  }

  // Technician notification
  if (repair.assignedTechnician) {
    await notifyUserService({
      userId:
        repair.assignedTechnician._id ||
        repair.assignedTechnician,
      type: "REPAIR_DELIVERED",
      title: "Repair Delivered",
      message:
        "The repair has been delivered to the customer.",
      relatedId: repair._id,
      relatedModel: "Repair",
    });
  }

  // Admin notification
  await notifyAdminsService({
    type: "REPAIR_DELIVERED",
    title: "Repair Delivered",
    message:
      `Repair for ${repair.customerName || "customer"} has been delivered.`,
    relatedId: repair._id,
    relatedModel: "Repair",
  });

  return repair;
};

// Delete Repair
export const deleteRepair = async (id) => {
  const repair = await repairRepository.deleteRepair(id);

  if (!repair) {
    throw new Error("Repair request not found.");
  }

  return repair;
};


export const getRepairsByTechnician = async (technicianId) => {
  return await repairRepository.findByTechnician(technicianId);
};


// export {
//   createRepair,
//   getRepairById,
//   getAllRepairs,
//   getRepairsByUser,
//   getRepairsByProduct,
//   updateRepair,
//   updateRepairStatus,
//   markDelivered,
//   deleteRepair,
// };