import mongoose from "mongoose";

import * as repairRepository from "./repair.repository.js";

import Repair, {
  CUSTOMER_SOURCE_VALUES,
} from "./repair.model.js";

import Branch from "../branches/branch.model.js";

import User from "../users/user.model.js";
import JobCounter from "./services/jobCounter.model.js";

import {
  notifyAdminsService,
  notifyUserService,
} from "../notification/notification.service.js";

// ======================================================
// HELPER: VALIDATE OBJECT ID
// ======================================================

const validateObjectId = (
  id,
  message = "Invalid ID."
) => {
  if (
    !id ||
    !mongoose.Types.ObjectId.isValid(id)
  ) {
    throw new Error(message);
  }
};

// ======================================================
// HELPER: VALIDATE ACTIVE BRANCH
// ======================================================

const validateActiveBranch = async (branchId) => {
  if (!branchId) {
    throw new Error("Please select a branch.");
  }

  if (!mongoose.Types.ObjectId.isValid(branchId)) {
    throw new Error("Invalid branch selected.");
  }

  const branch = await Branch.findOne({
    _id: branchId,
    status: "ACTIVE",
    isDeleted: false,
  });

  if (!branch) {
    throw new Error(
      "Selected branch does not exist or is inactive."
    );
  }

  return branch;
};

// ======================================================
// HELPER: NORMALIZE CUSTOMER EMAIL
// ======================================================

const normalizeEmail = (email) => {
  if (typeof email !== "string") {
    return "";
  }

  return email.trim().toLowerCase();
};

// ======================================================
// HELPER: NORMALIZE CUSTOMER SOURCE
// ======================================================

const normalizeCustomerSource = (
  customerSource,
  customerSourceOther
) => {
  const source =
    typeof customerSource === "string"
      ? customerSource.trim().toUpperCase()
      : "";

  if (
    source &&
    !CUSTOMER_SOURCE_VALUES.includes(source)
  ) {
    throw new Error("Invalid customer source.");
  }

  const sourceOther =
    source === "OTHER" &&
    typeof customerSourceOther === "string"
      ? customerSourceOther.trim()
      : "";

  return {
    customerSource: source,
    customerSourceOther: sourceOther,
  };
};

// ======================================================
// HELPER: VALIDATE NON-NEGATIVE COST
// ======================================================

const validateCost = (value, fieldName) => {
  const cost = Number(value);

  if (
    !Number.isFinite(cost) ||
    cost < 0
  ) {
    throw new Error(`Invalid ${fieldName}.`);
  }

  return cost;
};

// ======================================================
// JOB NUMBER (SEQUENTIAL)
//
// 001, 002, 003 ... 999, 1000, 1001 ...
// MongoDB atomic $inc se banta hai, isliye 2 log ek
// saath job banayein tab bhi duplicate nahi hoga.
// Prefix chahiye (jaise "JC-") to neeche badlo.
// ======================================================

const JOB_NUMBER_PREFIX = "";
const JOB_NUMBER_PADDING = 3;

const generateJobNumber = async () => {
  const counter = await JobCounter.findOneAndUpdate(
    { _id: "repairJob" },
    { $inc: { seq: 1 } },
    {
      new: true,
      upsert: true,
      setDefaultsOnInsert: true,
    }
  );

  return {
    jobSerial: counter.seq,
    repairNumber: `${JOB_NUMBER_PREFIX}${String(
      counter.seq
    ).padStart(JOB_NUMBER_PADDING, "0")}`,
  };
};

// ======================================================
// WARRANTY / SALESPERSON / TECHNICIAN NOTES HELPERS
// ======================================================

const WARRANTY_STATUSES = [
  "IN_WARRANTY",
  "OUT_OF_WARRANTY",
  "NOT_SPECIFIED",
];

const TRANSFER_REASONS = [
  "HALF_DAY",
  "LEAVE",
  "PERSONAL",
  "OTHER",
];

// Sirf wahi keys return hoti hain jo input me di gayi hain
const normalizeWarrantyFields = (input = {}) => {
  const result = {};

  if (input.warrantyStatus !== undefined) {
    const status =
      String(input.warrantyStatus || "")
        .trim()
        .toUpperCase() || "NOT_SPECIFIED";

    if (!WARRANTY_STATUSES.includes(status)) {
      throw new Error("Invalid warranty status.");
    }

    result.warrantyStatus = status;
  }

  if (input.warrantyProvider !== undefined) {
    result.warrantyProvider = String(
      input.warrantyProvider || ""
    )
      .trim()
      .slice(0, 100);
  }

  if (input.warrantyDetails !== undefined) {
    result.warrantyDetails = String(
      input.warrantyDetails || ""
    )
      .trim()
      .slice(0, 500);
  }

  if (input.warrantyExpiryDate !== undefined) {
    if (
      input.warrantyExpiryDate === null ||
      input.warrantyExpiryDate === ""
    ) {
      result.warrantyExpiryDate = null;
    } else {
      const expiry = new Date(input.warrantyExpiryDate);

      if (Number.isNaN(expiry.getTime())) {
        throw new Error("Invalid warranty expiry date.");
      }

      result.warrantyExpiryDate = expiry;
    }
  }

  return result;
};

const normalizeSalesperson = (value) =>
  String(value || "")
    .trim()
    .slice(0, 100);

const normalizeTechnicianNotes = (value) =>
  String(value || "")
    .trim()
    .slice(0, 3000);

// ======================================================
// ADD SPARE PART TO REPAIR
// ======================================================
//
// IMPORTANT:
// Current Repair schema uses RepairPart references.
// This legacy Product-based method must not deduct
// inventory stock and then throw an error.
//
// Use the dedicated RepairPart attach endpoint.
// ======================================================

export const addRepairPart = async (
  repairId,
  repairPartId,
  quantity,
  userId
) => {
  validateObjectId(
    repairId,
    "Invalid Job Card ID."
  );

  validateObjectId(
    repairPartId,
    "Invalid Repair Part ID."
  );

  const parsedQuantity = Number(quantity);

  if (
    !Number.isInteger(parsedQuantity) ||
    parsedQuantity <= 0
  ) {
    throw new Error(
      "Quantity must be a positive whole number."
    );
  }

  const repair =
    await repairRepository.getRepairById(
      repairId
    );

  if (!repair) {
    throw new Error(
      "Repair request not found."
    );
  }

  if (
    [
      "Completed",
      "Cancelled",
      "Delivered",
    ].includes(repair.status)
  ) {
    throw new Error(
      "Cannot add parts to this repair."
    );
  }

  // No stock deduction here.
  // Use the dedicated RepairPart attach endpoint.
  throw new Error(
    "Repair Part attachment is not configured in this service. Please use the dedicated RepairPart attach endpoint."
  );
};

// ======================================================
// CREATE REPAIR REQUEST / JOB CARD
// ======================================================

export const createRepair = async (repairData) => {
  const {
    user,
    product,
    branchId,
    customerName,
    customerPhone,
    customerEmail,
    customerSource,
    customerSourceOther,
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
  // BRANCH VALIDATION
  // Mandatory for every new Job Card
  // ==================================================

  const selectedBranch =
    await validateActiveBranch(branchId);

  // ==================================================
  // NORMALIZE VALUES
  // ==================================================

  const normalizedCustomerName =
    String(customerName || "").trim();

  const normalizedPhone =
    String(customerPhone || "").trim();

  const normalizedDeviceType =
    String(deviceType || "").trim();

  const normalizedDeviceModel =
    String(deviceModel || "").trim();

  const normalizedIssue =
    String(issueDescription || "").trim();

  const normalizedEmail =
    normalizeEmail(customerEmail);

  const normalizedJobDate = jobDate
    ? new Date(jobDate)
    : new Date();

  // ==================================================
  // DATE VALIDATION
  // ==================================================

  if (
    Number.isNaN(normalizedJobDate.getTime())
  ) {
    throw new Error("Invalid job date.");
  }

  let normalizedCompletionDate = null;

  if (estimatedCompletionDate) {
    normalizedCompletionDate =
      new Date(estimatedCompletionDate);

    if (
      Number.isNaN(
        normalizedCompletionDate.getTime()
      )
    ) {
      throw new Error(
        "Invalid estimated completion date."
      );
    }
  }

  // ==================================================
  // CUSTOMER SOURCE
  // ==================================================

  const normalizedSource =
    normalizeCustomerSource(
      customerSource,
      customerSourceOther
    );

  // ==================================================
  // REQUIRED FIELD VALIDATION
  // ==================================================

  if (normalizedCustomerName.length < 2) {
    throw new Error(
      "Customer name must contain at least 2 characters."
    );
  }

  if (!normalizedPhone) {
    throw new Error(
      "Customer phone is required."
    );
  }

  // Customer email is optional.

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
  // OPTIONAL OBJECT ID VALIDATION
  // ==================================================

  if (user) {
    validateObjectId(
      user,
      "Invalid customer user ID."
    );
  }

  if (product) {
    validateObjectId(
      product,
      "Invalid product ID."
    );
  }

  if (assignedTechnician) {
    validateObjectId(
      assignedTechnician,
      "Invalid assigned technician ID."
    );
  }

  // ==================================================
  // COST VALIDATION
  // ==================================================

  const finalRepairCost = validateCost(
    repairCost ?? 0,
    "repair cost"
  );

  const finalEstimatedCost = validateCost(
    estimatedCost ?? 0,
    "estimated cost"
  );

  // ==================================================
  // CREATE REPAIR / JOB CARD
  // ==================================================
  // ==================================================
  // SEQUENTIAL JOB NUMBER + NEW FIELDS
  // Saari validation upar ho chuki hai, isliye number
  // yahin generate hota hai (gaps kam se kam).
  // ==================================================

  const jobNumber = await generateJobNumber();

  const warrantyFields =
    normalizeWarrantyFields(repairData);

  const repair =
    await repairRepository.createRepair({
      jobSerial: jobNumber.jobSerial,

      repairNumber: jobNumber.repairNumber,

      ...warrantyFields,

      salespersonName: normalizeSalesperson(
        repairData.salespersonName
      ),

      technicianNotes: normalizeTechnicianNotes(
        repairData.technicianNotes
      ),

      user: user || null,

      product: product || null,

      branchId: selectedBranch._id,

      customerName: normalizedCustomerName,

      customerPhone: normalizedPhone,

      customerEmail: normalizedEmail,

      customerSource:
        normalizedSource.customerSource,

      customerSourceOther:
        normalizedSource.customerSourceOther,

      jobDate: normalizedJobDate,

      deviceType: normalizedDeviceType,

      deviceModel: normalizedDeviceModel,

      issueDescription: normalizedIssue,

      estimatedCompletionDate:
        normalizedCompletionDate,

      repairCost: finalRepairCost,

      estimatedCost: finalEstimatedCost,

      paymentStatus:
        finalRepairCost === 0
          ? "PAID"
          : "PENDING",

      paidAmount: 0,

      balanceAmount: finalRepairCost,

      paymentMethod: "",

      paymentId: "",

      paidAt: null,

      technicianName: technicianName || "",

      assignedTechnician:
        assignedTechnician || null,

      remarks: remarks || "",

      serialNumber: serialNumber || "",

      priority: priority || "Medium",

      status: status || "Received",
    });

  // ==================================================
  // TECHNICIAN NOTIFICATION
  // Notification failure must not fail repair creation.
  // ==================================================

  try {
    if (assignedTechnician) {
      await notifyUserService({
        userId: assignedTechnician,

        type: "REPAIR_ASSIGNED",

        title: "New Repair Assigned",

        message:
          `Repair for ${normalizedCustomerName} (${normalizedDeviceModel}) has been assigned to you.`,

        relatedId: repair._id,

        relatedModel: "Repair",
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
  // ==================================================

  try {
    await notifyAdminsService({
      type: "GENERAL",

      title: "New Repair Request",

      message:
        `New repair request created for ${normalizedCustomerName}.`,

      relatedId: repair._id,

      relatedModel: "Repair",
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

export const getRepairById = async (id) => {
  validateObjectId(
    id,
    "Invalid Job Card ID."
  );

  const repair =
    await repairRepository.getRepairById(id);

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

export const getRepairsByUser = async (userId) => {
  validateObjectId(
    userId,
    "Invalid customer user ID."
  );

  return await Repair.find({
    user: userId,
    isDeleted: { $ne: true },
  })
    .populate("user")
    .populate("product")
    .populate("branchId")
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
  validateObjectId(
    productId,
    "Invalid product ID."
  );

  return await repairRepository.getRepairsByProduct(
    productId
  );
};

// ======================================================
// UPDATE REPAIR / EDIT JOB CARD
// ======================================================

export const updateRepair = async (
  id,
  data,
  actor = {}
) => {
  validateObjectId(
    id,
    "Invalid Job Card ID."
  );

  const existingRepair =
    await repairRepository.getRepairById(id);

  if (!existingRepair) {
    throw new Error(
      "Repair request not found."
    );
  }

  const updateData = {
    ...data,
  };

  // ==================================================
  // BRANCH VALIDATION ON EDIT
  // ==================================================

  if (
    Object.prototype.hasOwnProperty.call(
      updateData,
      "branchId"
    )
  ) {
    const selectedBranch =
      await validateActiveBranch(
        updateData.branchId
      );

    updateData.branchId = selectedBranch._id;
  }

  // ==================================================
  // CUSTOMER NAME
  // ==================================================

  if (updateData.customerName !== undefined) {
    updateData.customerName = String(
      updateData.customerName || ""
    ).trim();

    if (updateData.customerName.length < 2) {
      throw new Error(
        "Customer name must contain at least 2 characters."
      );
    }
  }

  // ==================================================
  // CUSTOMER PHONE
  // ==================================================

  if (updateData.customerPhone !== undefined) {
    updateData.customerPhone = String(
      updateData.customerPhone || ""
    ).trim();

    if (!updateData.customerPhone) {
      throw new Error(
        "Customer phone is required."
      );
    }
  }

  // ==================================================
  // CUSTOMER EMAIL
  // ==================================================

  if (updateData.customerEmail !== undefined) {
    updateData.customerEmail =
      normalizeEmail(updateData.customerEmail);
  }

  // ==================================================
  // CUSTOMER SOURCE
  // ==================================================

  if (
    updateData.customerSource !== undefined ||
    updateData.customerSourceOther !== undefined
  ) {
    const source =
      updateData.customerSource !== undefined
        ? updateData.customerSource
        : existingRepair.customerSource;

    const sourceOther =
      updateData.customerSourceOther !== undefined
        ? updateData.customerSourceOther
        : existingRepair.customerSourceOther;

    const normalizedSource =
      normalizeCustomerSource(
        source,
        sourceOther
      );

    updateData.customerSource =
      normalizedSource.customerSource;

    updateData.customerSourceOther =
      normalizedSource.customerSourceOther;
  }

  // ==================================================
  // DEVICE MODEL
  // ==================================================

  if (updateData.deviceModel !== undefined) {
    updateData.deviceModel = String(
      updateData.deviceModel || ""
    ).trim();

    if (!updateData.deviceModel) {
      throw new Error(
        "Device model is required."
      );
    }
  }

  // ==================================================
  // DEVICE TYPE
  // ==================================================

  if (updateData.deviceType !== undefined) {
    updateData.deviceType = String(
      updateData.deviceType || ""
    ).trim();
  }

  // ==================================================
  // ISSUE DESCRIPTION
  // ==================================================

  if (
    updateData.issueDescription !== undefined
  ) {
    updateData.issueDescription = String(
      updateData.issueDescription || ""
    ).trim();

    if (
      updateData.issueDescription.length < 5
    ) {
      throw new Error(
        "Issue description must be at least 5 characters."
      );
    }
  }

  // ==================================================
  // JOB DATE
  // ==================================================

  if (updateData.jobDate !== undefined) {
    const parsedJobDate =
      new Date(updateData.jobDate);

    if (
      Number.isNaN(parsedJobDate.getTime())
    ) {
      throw new Error("Invalid job date.");
    }

    updateData.jobDate = parsedJobDate;
  }

  // ==================================================
  // ESTIMATED COMPLETION DATE
  // ==================================================

  if (
    updateData.estimatedCompletionDate !== undefined
  ) {
    if (
      updateData.estimatedCompletionDate === null ||
      updateData.estimatedCompletionDate === ""
    ) {
      updateData.estimatedCompletionDate = null;
    } else {
      const parsedDate =
        new Date(
          updateData.estimatedCompletionDate
        );

      if (
        Number.isNaN(parsedDate.getTime())
      ) {
        throw new Error(
          "Invalid estimated completion date."
        );
      }

      updateData.estimatedCompletionDate =
        parsedDate;
    }
  }

  // ==================================================
  // OPTIONAL OBJECT ID VALIDATION
  // ==================================================

  if (updateData.user) {
    validateObjectId(
      updateData.user,
      "Invalid customer user ID."
    );
  }

  if (updateData.product) {
    validateObjectId(
      updateData.product,
      "Invalid product ID."
    );
  }

  if (updateData.assignedTechnician) {
    validateObjectId(
      updateData.assignedTechnician,
      "Invalid assigned technician ID."
    );
  }

  // ==================================================
  // COST VALIDATION
  // ==================================================

  if (updateData.repairCost !== undefined) {
    updateData.repairCost = validateCost(
      updateData.repairCost,
      "repair cost"
    );
  }

  if (updateData.estimatedCost !== undefined) {
    updateData.estimatedCost = validateCost(
      updateData.estimatedCost,
      "estimated cost"
    );
  }

  // ==================================================
  // UPDATE REPAIR
  // ==================================================

   // ==================================================
  // PROTECTED FIELDS (PUT se badle nahi ja sakte)
  // Job number aur transfer history sirf system badalta hai
  // ==================================================

  delete updateData.repairNumber;
  delete updateData.jobSerial;
  delete updateData.transferHistory;

  // ==================================================
  // WARRANTY
  // ==================================================

  Object.assign(
    updateData,
    normalizeWarrantyFields(updateData)
  );

  // ==================================================
  // SALESPERSON
  // ==================================================

  if (updateData.salespersonName !== undefined) {
    updateData.salespersonName = normalizeSalesperson(
      updateData.salespersonName
    );
  }

  // ==================================================
  // TECHNICIAN NOTES
  // ==================================================

  if (updateData.technicianNotes !== undefined) {
    updateData.technicianNotes =
      normalizeTechnicianNotes(
        updateData.technicianNotes
      );

    updateData.technicianNotesUpdatedAt = new Date();

    if (actor?.id) {
      updateData.technicianNotesUpdatedBy = actor.id;
    }
  }

  const repair =
    await repairRepository.updateRepair(
      id,
      updateData
    );
  if (!repair) {
    throw new Error(
      "Unable to update Job Card."
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
  validateObjectId(
    id,
    "Invalid Job Card ID."
  );

  const allowedStatuses = [
    "Received",
    "In Progress",
    "Assigned",
    "Waiting for Parts",
    "Completed",
    "Cancelled",
    "Delivered",
  ];

  if (!allowedStatuses.includes(status)) {
    throw new Error("Invalid repair status.");
  }

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
  // NOTIFICATIONS
  // ==================================================

  try {
    if (status === "Completed") {
      if (repair.user) {
        await notifyUserService({
          userId:
            repair.user._id || repair.user,

          type: "REPAIR_COMPLETED",

          title: "Repair Completed",

          message:
            "Your repair has been completed successfully.",

          relatedId: repair._id,

          relatedModel: "Repair",
        });
      }

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

      await notifyAdminsService({
        type: "REPAIR_COMPLETED",

        title: "Repair Completed",

        message:
          `Repair for ${repair.customerName || "customer"} has been completed.`,

        relatedId: repair._id,

        relatedModel: "Repair",
      });
    }

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

    if (
      [
        "In Progress",
        "Assigned",
        "Waiting for Parts",
      ].includes(status)
    ) {
      if (repair.user) {
        await notifyUserService({
          userId:
            repair.user._id || repair.user,

          type: "REPAIR_STATUS_CHANGED",

          title: "Repair Status Updated",

          message:
            `Your repair status is now "${status}".`,

          relatedId: repair._id,

          relatedModel: "Repair",
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

export const markDelivered = async (id) => {
  validateObjectId(
    id,
    "Invalid Job Card ID."
  );

  const repair =
    await repairRepository.markDelivered(id);

  if (!repair) {
    throw new Error(
      "Repair request not found."
    );
  }

  try {
    if (repair.user) {
      await notifyUserService({
        userId:
          repair.user._id || repair.user,

        type: "REPAIR_DELIVERED",

        title: "Repair Delivered",

        message:
          "Your repaired device has been marked as delivered.",

        relatedId: repair._id,

        relatedModel: "Repair",
      });
    }

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

    await notifyAdminsService({
      type: "REPAIR_DELIVERED",

      title: "Repair Delivered",

      message:
        `Repair for ${repair.customerName || "customer"} has been delivered.`,

      relatedId: repair._id,

      relatedModel: "Repair",
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
// DELETE REPAIR / SOFT DELETE JOB CARD
// ======================================================

export const deleteRepair = async (id) => {
  validateObjectId(
    id,
    "Invalid Job Card ID."
  );

  const existingRepair =
    await repairRepository.getRepairById(id);

  if (!existingRepair) {
    throw new Error(
      "Repair request not found."
    );
  }

  const deletedRepair =
    await repairRepository.deleteRepair(id);

  if (!deletedRepair) {
    throw new Error(
      "Unable to delete Job Card."
    );
  }

  return deletedRepair;
};

// ======================================================
// GET REPAIRS BY TECHNICIAN
// ======================================================

export const getRepairsByTechnician = async (
  technicianId
) => {
  validateObjectId(
    technicianId,
    "Invalid technician ID."
  );

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
  validateObjectId(
    id,
    "Invalid Job Card ID."
  );

  const repair = await Repair.findOne({
    _id: id,
    isDeleted: { $ne: true },
  });

  if (!repair) {
    throw new Error(
      "Repair request not found."
    );
  }

  const repairCost = Math.max(
    Number(repair.repairCost || 0),
    0
  );

  let paidAmount = Number(
    paymentData.paidAmount
  );

  if (
    !Number.isFinite(paidAmount) ||
    paidAmount < 0
  ) {
    throw new Error("Invalid paid amount.");
  }

  if (paidAmount > repairCost) {
    paidAmount = repairCost;
  }

  const balanceAmount = Math.max(
    repairCost - paidAmount,
    0
  );

  let paymentStatus = "PENDING";

  if (
    paymentData.paymentStatus === "FAILED"
  ) {
    paymentStatus = "FAILED";
  } else if (
    paymentData.paymentStatus === "REFUNDED"
  ) {
    paymentStatus = "REFUNDED";
  } else if (repairCost === 0) {
    paymentStatus = "PAID";
  } else if (paidAmount >= repairCost) {
    paymentStatus = "PAID";
  } else if (paidAmount > 0) {
    paymentStatus = "PARTIAL";
  }

  repair.paidAmount = paidAmount;

  repair.balanceAmount = balanceAmount;

  repair.paymentStatus = paymentStatus;

  if (
    paymentData.paymentMethod !== undefined
  ) {
    repair.paymentMethod =
      paymentData.paymentMethod;
  }

  if (
    paymentData.paymentId !== undefined
  ) {
    repair.paymentId =
      paymentData.paymentId;
  }

  if (paymentStatus === "PAID") {
    repair.paidAt = new Date();
  } else {
    repair.paidAt = null;
  }

  await repair.save();

  return repair;
};


// ======================================================
// TRANSFER / REASSIGN JOB TO ANOTHER TECHNICIAN
//
// Allowed roles (route me check hota hai):
// SUPER_ADMIN, ADMIN, IT_SUPPORT, TECHNICIAN
//
// TECHNICIAN sirf apne assigned jobs transfer kar sakta hai.
// Admin / IT Support kisi bhi job ko kisi bhi technician
// ko assign kar sakte hain.
// ======================================================

export const transferRepair = async (
  repairId,
  { toTechnicianId, reason, note } = {},
  actor = {}
) => {
  validateObjectId(
    repairId,
    "Invalid Job Card ID."
  );

  validateObjectId(
    toTechnicianId,
    "Invalid technician selected."
  );

  const cleanReason = String(reason || "")
    .trim()
    .toUpperCase();

  if (!TRANSFER_REASONS.includes(cleanReason)) {
    throw new Error("Invalid transfer reason.");
  }

  const cleanNote = String(note || "").trim();

  if (cleanNote.length < 3) {
    throw new Error(
      "Please write a transfer note (at least 3 characters)."
    );
  }

  const repair = await Repair.findOne({
    _id: repairId,
    isDeleted: { $ne: true },
  });

  if (!repair) {
    throw new Error("Repair request not found.");
  }

  if (
    ["Delivered", "Cancelled"].includes(repair.status)
  ) {
    throw new Error(
      `Cannot transfer a ${repair.status.toLowerCase()} job.`
    );
  }

  const actorId = String(actor?.id || "");
  const actorRole = String(
    actor?.role || ""
  ).toUpperCase();

  const currentTechId = repair.assignedTechnician
    ? String(repair.assignedTechnician)
    : "";

  if (
    actorRole === "TECHNICIAN" &&
    currentTechId !== actorId
  ) {
    throw new Error(
      "You can only transfer jobs that are assigned to you."
    );
  }

  if (currentTechId === String(toTechnicianId)) {
    throw new Error(
      "This job is already assigned to the selected technician."
    );
  }

  const newTechnician = await User.findOne({
    _id: toTechnicianId,
    role: "TECHNICIAN",
    isDeleted: { $ne: true },
  });

  if (!newTechnician) {
    throw new Error("Selected technician not found.");
  }

  if (
    String(newTechnician.status || "ACTIVE") !==
    "ACTIVE"
  ) {
    throw new Error(
      "Selected technician is not active."
    );
  }

  const newTechnicianName =
    `${newTechnician.firstName || ""} ${
      newTechnician.lastName || ""
    }`.trim() ||
    newTechnician.email ||
    "Technician";

  const update = {
    $set: {
      assignedTechnician: newTechnician._id,
      technicianName: newTechnicianName,
    },

    $push: {
      transferHistory: {
        fromTechnician:
          repair.assignedTechnician || null,
        toTechnician: newTechnician._id,
        reason: cleanReason,
        note: cleanNote,
        transferredBy: actorId || null,
        transferredAt: new Date(),
      },
    },
  };

  if (repair.status === "Received") {
    update.$set.status = "Assigned";
  }

  await Repair.updateOne(
    { _id: repair._id },
    update
  );

  // ==================================================
  // NOTIFICATIONS (fail hone par transfer fail nahi hoga)
  // ==================================================

  const jobLabel =
    repair.repairNumber ||
    String(repair._id).slice(-6).toUpperCase();

  try {
    await notifyUserService({
      userId: newTechnician._id,

      type: "REPAIR_ASSIGNED",

      title: "Repair Job Transferred To You",

      message:
        `Job ${jobLabel} (${repair.deviceModel || "device"}) has been transferred to you. Note: ${cleanNote}`,

      relatedId: repair._id,

      relatedModel: "Repair",
    });

    if (
      currentTechId &&
      currentTechId !== actorId
    ) {
      await notifyUserService({
        userId: currentTechId,

        type: "GENERAL",

        title: "Repair Job Transferred",

        message:
          `Job ${jobLabel} has been transferred to ${newTechnicianName}.`,

        relatedId: repair._id,

        relatedModel: "Repair",
      });
    }

    await notifyAdminsService({
      type: "GENERAL",

      title: "Repair Job Transferred",

      message:
        `Job ${jobLabel} transferred to ${newTechnicianName} (${cleanReason.replace("_", " ")}).`,

      relatedId: repair._id,

      relatedModel: "Repair",
    });
  } catch (notificationError) {
    console.error(
      "REPAIR TRANSFER NOTIFICATION ERROR:",
      notificationError
    );
  }

  return await repairRepository.getRepairById(
    repair._id
  );
};