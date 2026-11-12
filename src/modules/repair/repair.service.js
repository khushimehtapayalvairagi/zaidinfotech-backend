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

// CHANGE: imports for saving repair payments in the Payment collection
import Payment from "../payments/payment.model.js";
import { createPayment } from "../payments/payment.service.js";
import { PAYMENT_STATUS } from "../../common/constants/paymentStatus.js";

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
// CHANGE: REPAIR PAYMENT METHOD -> PAYMENT COLLECTION METHOD
//
// Repair model allows: CASH, UPI, CARD, BANK_TRANSFER,
// RAZORPAY, OTHER.
// Payment model allows: COD, UPI, CARD, NET_BANKING,
// WALLET, CASH.
//
// OTHER (and empty) have no equivalent, so they return
// null and no Payment record is created for them.
// ======================================================

const REPAIR_TO_PAYMENT_METHOD = {
  CASH: "CASH",
  UPI: "UPI",
  CARD: "CARD",
  BANK_TRANSFER: "NET_BANKING",
  RAZORPAY: "UPI",
};

const toAccountingMethod = (value) => {
  const key = String(value || "")
    .trim()
    .toUpperCase()
    .replace(/[\s-]+/g, "_");

  return REPAIR_TO_PAYMENT_METHOD[key] || null;
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
// INVOICE TYPE / GST HELPERS (Prem's version)
//
// NOTE: This helper is kept as-is so no code is lost, but it
// is NOT called anywhere now. The lead's normalizeRepairGst()
// below does the same job (and also defaults empty type to
// NON_GST), and it is the one used by createRepair and
// updateRepair so that GST totals are calculated correctly.
// Calling both would process invoiceType / gstPercentage twice.
// ======================================================

const INVOICE_TYPES = ["GST", "NON_GST"];

const normalizeInvoiceFields = (input = {}) => {
  const result = {};

  if (input.invoiceType !== undefined) {
    const type = String(input.invoiceType || "")
      .trim()
      .toUpperCase();

    if (type && !INVOICE_TYPES.includes(type)) {
      throw new Error("Invalid invoice type.");
    }

    result.invoiceType = type;
  }

  if (input.gstPercentage !== undefined) {
    const gst = Number(input.gstPercentage ?? 0);

    if (
      !Number.isFinite(gst) ||
      gst < 0 ||
      gst > 100
    ) {
      throw new Error("Invalid GST percentage.");
    }

    result.gstPercentage = gst;
  }

  return result;
};

    // ======================================================
// GST / NON-GST HELPERS
// repairCost = base amount. GST invoice me GST upar se judta hai.
// ======================================================

const REPAIR_INVOICE_TYPES = ["GST", "NON_GST"];

const round2 = (value) =>
  Math.round((Number(value || 0) + Number.EPSILON) * 100) /
  100;

const normalizeRepairGst = (input = {}) => {
  const result = {};

  if (input.invoiceType !== undefined) {
    const type =
      String(input.invoiceType || "")
        .trim()
        .toUpperCase()
        .replace(/[\s-]+/g, "_") || "NON_GST";

    if (!REPAIR_INVOICE_TYPES.includes(type)) {
      throw new Error(
        "Invalid invoice type. Use GST or NON_GST."
      );
    }

    result.invoiceType = type;
  }

  if (
    input.gstPercentage !== undefined &&
    input.gstPercentage !== null &&
    input.gstPercentage !== ""
  ) {
    const percentage = Number(input.gstPercentage);

    if (
      !Number.isFinite(percentage) ||
      percentage < 0 ||
      percentage > 100
    ) {
      throw new Error(
        "GST percentage must be between 0 and 100."
      );
    }

    result.gstPercentage = percentage;
  }

  return result;
};

const calcRepairTotals = (cost, type, percentage) => {
  const baseAmount = Math.max(Number(cost) || 0, 0);

  const isGst = String(type || "").toUpperCase() === "GST";

  const hasPercentage =
    percentage !== undefined &&
    percentage !== null &&
    percentage !== "" &&
    Number.isFinite(Number(percentage));

  const rate = isGst
    ? hasPercentage
      ? Number(percentage)
      : 18
    : 0;

  const gstAmount = round2((baseAmount * rate) / 100);

  return {
    baseAmount,
    gstRate: rate,
    gstAmount,
    totalAmount: round2(baseAmount + gstAmount),
  };
};

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

    
  const gstFields = normalizeRepairGst(repairData);

  const gstTotals = calcRepairTotals(
    finalRepairCost,
    gstFields.invoiceType,
    gstFields.gstPercentage
  );

  const repair =
    await repairRepository.createRepair({
      jobSerial: jobNumber.jobSerial,

      repairNumber: jobNumber.repairNumber,

      ...warrantyFields,

      
      ...gstFields,

      gstAmount: gstTotals.gstAmount,

      totalAmount: gstTotals.totalAmount,

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
        gstTotals.totalAmount === 0
          ? "PAID"
          : "PENDING",

      paidAmount: 0,

      balanceAmount: gstTotals.totalAmount,

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

  // ==================================================
  // GST / NON-GST + TOTALS RECALCULATION
  // repairCost, invoiceType ya gstPercentage badle to
  // gst amount, total aur balance dobara nikalte hain.
  // ==================================================

  const gstInput = normalizeRepairGst(updateData);

  delete updateData.invoiceType;
  delete updateData.gstPercentage;

  Object.assign(updateData, gstInput);

  if (
    updateData.repairCost !== undefined ||
    updateData.invoiceType !== undefined ||
    updateData.gstPercentage !== undefined
  ) {
    const totals = calcRepairTotals(
      updateData.repairCost !== undefined
        ? updateData.repairCost
        : existingRepair.repairCost,
      updateData.invoiceType !== undefined
        ? updateData.invoiceType
        : existingRepair.invoiceType,
      updateData.gstPercentage !== undefined
        ? updateData.gstPercentage
        : existingRepair.gstPercentage
    );

    const alreadyPaid = Number(
      existingRepair.paidAmount || 0
    );

    updateData.gstAmount = totals.gstAmount;

    updateData.totalAmount = totals.totalAmount;

    updateData.balanceAmount = Math.max(
      round2(totals.totalAmount - alreadyPaid),
      0
    );

    if (
      ["PENDING", "PARTIAL", "PAID"].includes(
        existingRepair.paymentStatus
      )
    ) {
      if (
        totals.totalAmount <= 0 ||
        alreadyPaid >= totals.totalAmount
      ) {
        updateData.paymentStatus = "PAID";
      } else if (alreadyPaid > 0) {
        updateData.paymentStatus = "PARTIAL";
      } else {
        updateData.paymentStatus = "PENDING";
      }
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


// ======================================================
// UPDATE REPAIR STATUS
// Tracks the authenticated user who marks a repair
// as Completed.
// ======================================================

export const updateRepairStatus = async (
  id,
  status,
  actor = {}
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

  // Find existing repair first
  const existingRepair =
    await repairRepository.getRepairById(id);

  if (!existingRepair) {
    throw new Error("Repair request not found.");
  }

  const updateData = {};

  // Record the authenticated user when transitioning
  // into Completed status.
  if (
    status === "Completed" &&
    existingRepair.status !== "Completed"
  ) {
    if (!actor.id) {
      throw new Error(
        "Authenticated user is required to complete a repair."
      );
    }

    validateObjectId(
      actor.id,
      "Invalid completing user ID."
    );

    updateData.completedBy = actor.id;
    updateData.completedAt = new Date();
  }

  // Use repository method so common population is preserved
  const repair =
    await repairRepository.updateRepairStatus(
      id,
      status,
      updateData
    );

  if (!repair) {
    throw new Error("Unable to update repair status.");
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
//
// CHANGE: now also creates a record in the central
// Payment collection (same as the rental module does),
// for the money received in THIS request.
//
// - The 3rd argument "actor" is optional, so any existing
//   caller that passes only 2 arguments keeps working.
// - If the Payment record cannot be created, the repair
//   update still succeeds (error is only logged).
// - Total payable = base repair cost + GST (lead's logic).
// ======================================================

export const updateRepairPayment = async (
  id,
  paymentData,
  actor = {}
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

  // CHANGE: remember what was already paid before this request
  const previousPaid = Number(
    repair.paidAmount || 0
  );

  // Total payable = base + GST (GST invoice ho to)
  const repairCost = calcRepairTotals(
    repair.repairCost,
    repair.invoiceType,
    repair.gstPercentage
  ).totalAmount;

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

  // ==================================================
  // CHANGE: MONEY RECEIVED IN THIS REQUEST
  // paidAmount is a running total, so the new Payment
  // record stores only the difference.
  // ==================================================

  const paidNow =
    Math.round(
      (paidAmount - previousPaid) * 100
    ) / 100;

  const shouldRecordPayment =
    paidNow > 0 &&
    !["FAILED", "REFUNDED"].includes(
      paymentStatus
    );

  const accountingMethod = toAccountingMethod(
    paymentData.paymentMethod !== undefined
      ? paymentData.paymentMethod
      : repair.paymentMethod
  );

  repair.paidAmount = paidAmount;

  repair.balanceAmount = balanceAmount;

  const savedTotals = calcRepairTotals(
    repair.repairCost,
    repair.invoiceType,
    repair.gstPercentage
  );

  repair.gstAmount = savedTotals.gstAmount;

  repair.totalAmount = savedTotals.totalAmount;
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

  // ==================================================
  // CHANGE: ACCOUNTING PAYMENT RECORD
  // Same pattern as the rental module. A failure here
  // does not undo the repair payment update.
  // ==================================================

  if (shouldRecordPayment && !accountingMethod) {
    console.warn(
      "REPAIR PAYMENT RECORD SKIPPED: unsupported payment method:",
      repair.paymentMethod
    );
  } else if (shouldRecordPayment) {
    try {
      await createPayment({
        user: repair.user || actor?.id,

        paymentFor: "REPAIR",

        referenceId: repair._id,

        amount: paidNow,

        currency: "INR",

        paymentMethod: accountingMethod,

        paymentStatus:
          PAYMENT_STATUS.SUCCESS,

        invoiceType: repair.invoiceType,

        gateway: "OFFLINE",

        transactionId:
          repair.paymentId || "",

        gatewayPaymentId: "",

        gatewayResponse: {},

        paymentDate: new Date(),

        paidAt: new Date(),
      });
    } catch (paymentError) {
      console.error(
        "REPAIR PAYMENT RECORD (Payment collection) FAILED:",
        paymentError?.message
      );
    }
  }

  return repair;
};

// ======================================================
// CHANGE: NEW
// GET PAYMENT RECORDS OF A REPAIR / JOB CARD
// ======================================================

export const getPaymentsByRepair = async (
  repairId
) => {
  validateObjectId(
    repairId,
    "Invalid Job Card ID."
  );

  return await Payment.find({
    paymentFor: "REPAIR",
    referenceId: repairId,
    isDeleted: { $ne: true },
  }).sort({
    createdAt: -1,
  });
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