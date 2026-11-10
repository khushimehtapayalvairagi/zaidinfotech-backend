import Joi from "joi";

import {
  CUSTOMER_SOURCE_VALUES,
} from "./repair.model.js";

// ======================================================
// COMMON VALIDATION HELPERS
// ======================================================

const objectId = Joi.string()
  .hex()
  .length(24);

const repairStatuses = [
  "Received",
  "In Progress",
  "Assigned",
  "Waiting for Parts",
  "Completed",
  "Cancelled",
  "Delivered",
];

const priorities = [
  "Low",
  "Medium",
  "High",
  "Urgent",
];

// ======================================================
// CREATE REPAIR VALIDATION / NEW JOB CARD
// ======================================================

export const createRepairValidation = Joi.object({

  // ==================================================
  // CUSTOMER USER
  // ==================================================

  user: objectId
    .allow(null, "")
    .optional()
    .messages({
      "string.hex": "Invalid customer user ID.",
      "string.length": "Invalid customer user ID.",
    }),

  // ==================================================
  // PRODUCT
  // ==================================================

  product: objectId
    .allow(null, "")
    .optional()
    .messages({
      "string.hex": "Invalid product ID.",
      "string.length": "Invalid product ID.",
    }),

  // ==================================================
  // BRANCH
  // REQUIRED FOR EVERY NEW JOB CARD
  // ==================================================

  branchId: objectId
    .required()
    .messages({
      "string.empty": "Please select a branch.",
      "string.hex": "Invalid branch selected.",
      "string.length": "Invalid branch selected.",
      "any.required": "Branch selection is required for new Job Cards.",
    }),

  // ==================================================
  // CUSTOMER DETAILS
  // ==================================================

  customerName: Joi.string()
    .trim()
    .min(2)
    .max(100)
    .required()
    .messages({
      "string.empty": "Customer name is required.",
      "string.min": "Customer name must contain at least 2 characters.",
      "string.max": "Customer name cannot exceed 100 characters.",
      "any.required": "Customer name is required.",
    }),

  customerPhone: Joi.string()
    .trim()
    .min(7)
    .max(20)
    .required()
    .messages({
      "string.empty": "Customer phone is required.",
      "string.min": "Customer phone must contain at least 7 characters.",
      "string.max": "Customer phone cannot exceed 20 characters.",
      "any.required": "Customer phone is required.",
    }),

  customerEmail: Joi.string()
    .trim()
    .email()
    .max(150)
    .allow("")
    .optional()
    .messages({
      "string.email": "Please provide a valid customer email.",
      "string.max": "Customer email cannot exceed 150 characters.",
    }),

  // ==================================================
  // CUSTOMER SOURCE
  // How did customer come to know about ZAID Infotech?
  // ==================================================

  customerSource: Joi.string()
    .trim()
    .uppercase()
    .valid(...CUSTOMER_SOURCE_VALUES, "")
    .allow(null)
    .optional()
    .messages({
      "any.only": "Invalid customer source.",
    }),

  customerSourceOther: Joi.string()
    .trim()
    .allow("", null)
    .max(200)
    .optional()
    .messages({
      "string.max":
        "Customer source details cannot exceed 200 characters.",
    }),

  // ==================================================
  // JOB DATE
  // ==================================================

  jobDate: Joi.date()
    .allow(null, "")
    .optional()
    .messages({
      "date.base": "Please provide a valid job date.",
    }),

  // ==================================================
  // DEVICE DETAILS
  // ==================================================

  deviceType: Joi.string()
    .trim()
    .max(100)
    .allow("", null)
    .optional(),

  deviceModel: Joi.string()
    .trim()
    .min(1)
    .max(150)
    .required()
    .messages({
      "string.empty": "Device model is required.",
      "string.min": "Device model is required.",
      "string.max": "Device model cannot exceed 150 characters.",
      "any.required": "Device model is required.",
    }),

  serialNumber: Joi.string()
    .trim()
    .max(100)
    .allow("")
    .optional(),

  // ==================================================
  // ISSUE DETAILS
  // ==================================================

  issueDescription: Joi.string()
    .trim()
    .min(5)
    .max(500)
    .required()
    .messages({
      "string.empty": "Issue description is required.",
      "string.min": "Issue description must be at least 5 characters.",
      "string.max": "Issue description cannot exceed 500 characters.",
      "any.required": "Issue description is required.",
    }),

  // ==================================================
  // PRIORITY
  // ==================================================

  priority: Joi.string()
    .valid(...priorities)
    .default("Medium")
    .messages({
      "any.only": "Invalid repair priority.",
    }),

  // ==================================================
  // COST
  // ==================================================

  estimatedCost: Joi.number()
    .min(0)
    .default(0)
    .messages({
      "number.base": "Estimated cost must be a number.",
      "number.min": "Estimated cost cannot be negative.",
    }),

  repairCost: Joi.number()
    .min(0)
    .default(0)
    .messages({
      "number.base": "Repair cost must be a number.",
      "number.min": "Repair cost cannot be negative.",
    }),

  // ==================================================
  // ESTIMATED COMPLETION
  // ==================================================

  estimatedCompletionDate: Joi.date()
    .allow(null, "")
    .optional()
    .messages({
      "date.base": "Invalid estimated completion date.",
    }),

  // ==================================================
  // TECHNICIAN
  // ==================================================

  technicianName: Joi.string()
    .trim()
    .max(100)
    .allow("")
    .optional(),

  assignedTechnician: objectId
    .allow(null, "")
    .optional()
    .messages({
      "string.hex": "Invalid assigned technician ID.",
      "string.length": "Invalid assigned technician ID.",
    }),

  // ==================================================
  // REMARKS
  // ==================================================

  remarks: Joi.string()
    .trim()
    .max(500)
    .allow("")
    .optional(),

  // ==================================================
  // STATUS
  // ==================================================

  status: Joi.string()
    .valid(...repairStatuses)
    .default("Received")
    .messages({
      "any.only": "Invalid repair status.",
    }),

      // ==================================================
  // WARRANTY
  // ==================================================

  warrantyStatus: Joi.string()
    .valid("IN_WARRANTY", "OUT_OF_WARRANTY", "NOT_SPECIFIED")
    .allow("", null)
    .optional()
    .messages({
      "any.only": "Invalid warranty status.",
    }),

  warrantyProvider: Joi.string()
    .trim()
    .max(100)
    .allow("", null)
    .optional(),

  warrantyExpiryDate: Joi.date()
    .allow(null, "")
    .optional()
    .messages({
      "date.base": "Invalid warranty expiry date.",
    }),

  warrantyDetails: Joi.string()
    .trim()
    .max(500)
    .allow("", null)
    .optional(),

  // ==================================================
  // SALESPERSON + TECHNICIAN NOTES
  // ==================================================

  salespersonName: Joi.string()
    .trim()
    .max(100)
    .allow("", null)
    .optional(),
  technicianNotes: Joi.string()
    .trim()
    .max(3000)
    .allow("", null)
    .optional(),

  warrantyStatus: Joi.string()
    .valid("IN_WARRANTY", "OUT_OF_WARRANTY", "NOT_SPECIFIED")
    .allow("", null)
    .optional()
    .messages({
      "any.only": "Invalid warranty status.",
    }),

  warrantyProvider: Joi.string()
    .trim()
    .max(100)
    .allow("", null)
    .optional(),

  warrantyExpiryDate: Joi.date()
    .allow(null, "")
    .optional()
    .messages({
      "date.base": "Invalid warranty expiry date.",
    }),

  warrantyDetails: Joi.string()
    .trim()
    .max(500)
    .allow("", null)
    .optional(),

  salespersonName: Joi.string()
    .trim()
    .max(100)
    .allow("", null)
    .optional(),

});

// ======================================================
// UPDATE REPAIR VALIDATION / EDIT JOB CARD
// ======================================================

export const updateRepairValidation = Joi.object({

  // ==================================================
  // BRANCH
  // OPTIONAL ON UPDATE
  // ==================================================

  branchId: objectId
    .optional()
    .messages({
      "string.hex": "Invalid branch selected.",
      "string.length": "Invalid branch selected.",
    }),

  // ==================================================
  // CUSTOMER USER
  // ==================================================

  user: objectId
    .allow(null, "")
    .optional()
    .messages({
      "string.hex": "Invalid customer user ID.",
      "string.length": "Invalid customer user ID.",
    }),

  // ==================================================
  // PRODUCT
  // ==================================================

  product: objectId
    .allow(null, "")
    .optional()
    .messages({
      "string.hex": "Invalid product ID.",
      "string.length": "Invalid product ID.",
    }),

  // ==================================================
  // CUSTOMER DETAILS
  // ==================================================

  customerName: Joi.string()
    .trim()
    .min(2)
    .max(100)
    .optional()
    .messages({
      "string.empty": "Customer name cannot be empty.",
      "string.min": "Customer name must contain at least 2 characters.",
      "string.max": "Customer name cannot exceed 100 characters.",
    }),

  customerPhone: Joi.string()
    .trim()
    .min(7)
    .max(20)
    .optional()
    .messages({
      "string.empty": "Customer phone cannot be empty.",
      "string.min": "Customer phone must contain at least 7 characters.",
      "string.max": "Customer phone cannot exceed 20 characters.",
    }),

  customerEmail: Joi.string()
    .trim()
    .email()
    .max(150)
    .allow("")
    .optional()
    .messages({
      "string.email": "Please provide a valid customer email.",
      "string.max": "Customer email cannot exceed 150 characters.",
    }),

  // ==================================================
  // CUSTOMER SOURCE
  // ==================================================

  customerSource: Joi.string()
    .trim()
    .uppercase()
    .valid(...CUSTOMER_SOURCE_VALUES, "")
    .allow(null)
    .optional()
    .messages({
      "any.only": "Invalid customer source.",
    }),

  customerSourceOther: Joi.string()
    .trim()
    .allow("", null)
    .max(200)
    .optional()
    .messages({
      "string.max":
        "Customer source details cannot exceed 200 characters.",
    }),

  // ==================================================
  // JOB DATE
  // ==================================================

  jobDate: Joi.date()
    .allow(null, "")
    .optional()
    .messages({
      "date.base": "Please provide a valid job date.",
    }),

  // ==================================================
  // DEVICE DETAILS
  // ==================================================

  deviceType: Joi.string()
    .trim()
    .max(100)
    .allow("", null)
    .optional(),

  deviceModel: Joi.string()
    .trim()
    .min(1)
    .max(150)
    .optional()
    .messages({
      "string.empty": "Device model cannot be empty.",
      "string.min": "Device model cannot be empty.",
      "string.max": "Device model cannot exceed 150 characters.",
    }),

  serialNumber: Joi.string()
    .trim()
    .max(100)
    .allow("", null)
    .optional(),

  // ==================================================
  // ISSUE DETAILS
  // ==================================================

  issueDescription: Joi.string()
    .trim()
    .min(5)
    .max(500)
    .optional()
    .messages({
      "string.empty": "Issue description cannot be empty.",
      "string.min": "Issue description must be at least 5 characters.",
      "string.max": "Issue description cannot exceed 500 characters.",
    }),

  // ==================================================
  // TECHNICIAN NOTES
  // Existing frontend field preserved
  // ==================================================

  technicianNotes: Joi.string()
    .allow("", null)
    .optional(),

  // ==================================================
  // FINAL COST
  // Existing frontend field preserved
  // ==================================================

  finalCost: Joi.number()
    .min(0)
    .optional()
    .messages({
      "number.base": "Final cost must be a number.",
      "number.min": "Final cost cannot be negative.",
    }),

  // ==================================================
  // SERVICES
  // Existing frontend field preserved
  // ==================================================

  services: Joi.array()
    .items(
      Joi.object({
        serviceId: Joi.string()
          .allow(null, "")
          .optional(),

        serviceName: Joi.string()
          .trim()
          .required(),

        category: Joi.string()
          .trim()
          .required(),

        partCost: Joi.number()
          .min(0)
          .required(),

        laborCost: Joi.number()
          .min(0)
          .required(),

        totalCost: Joi.number()
          .min(0)
          .required(),

        isCustom: Joi.boolean()
          .optional(),
      })
    )
    .optional(),

  // ==================================================
  // COST
  // ==================================================

  repairCost: Joi.number()
    .min(0)
    .optional()
    .messages({
      "number.base": "Repair cost must be a number.",
      "number.min": "Repair cost cannot be negative.",
    }),

  estimatedCost: Joi.number()
    .min(0)
    .optional()
    .messages({
      "number.base": "Estimated cost must be a number.",
      "number.min": "Estimated cost cannot be negative.",
    }),

  // ==================================================
  // PRIORITY
  // ==================================================

  priority: Joi.string()
    .valid(...priorities)
    .optional()
    .messages({
      "any.only": "Invalid repair priority.",
    }),

  // ==================================================
  // STATUS
  // ==================================================

  status: Joi.string()
    .valid(...repairStatuses)
    .optional()
    .messages({
      "any.only": "Invalid repair status.",
    }),

  // ==================================================
  // REMARKS
  // ==================================================

  remarks: Joi.string()
    .trim()
    .max(500)
    .allow("")
    .optional(),

  // ==================================================
  // ESTIMATED COMPLETION DATE
  // ==================================================

  estimatedCompletionDate: Joi.date()
    .allow(null, "")
    .optional()
    .messages({
      "date.base": "Invalid estimated completion date.",
    }),

});

// ======================================================
// UPDATE REPAIR STATUS VALIDATION
// ======================================================

export const updateRepairStatusValidation = Joi.object({

  status: Joi.string()
    .valid(...repairStatuses)
    .required()
    .messages({
      "any.required": "Status is required.",
      "string.empty": "Status is required.",
      "any.only": "Invalid repair status.",
    }),

});

// ======================================================
// ADD REPAIR PART VALIDATION
// ======================================================

export const addRepairPartValidation = Joi.object({

  repairPartId: objectId
    .required()
    .messages({
      "string.hex": "Invalid Repair Part ID.",
      "string.length": "Invalid Repair Part ID.",
      "any.required": "Repair Part is required.",
    }),

  quantity: Joi.number()
    .integer()
    .min(1)
    .required()
    .messages({
      "number.base": "Quantity must be a number.",
      "number.integer": "Quantity must be a whole number.",
      "number.min": "Quantity must be at least 1.",
      "any.required": "Quantity is required.",
    }),

  remarks: Joi.string()
    .trim()
    .max(500)
    .allow("")
    .optional(),

});

// ======================================================
// TRANSFER JOB TO ANOTHER TECHNICIAN
// ======================================================

export const transferRepairValidation = Joi.object({

  toTechnicianId: objectId
    .required()
    .messages({
      "string.hex": "Invalid technician selected.",
      "string.length": "Invalid technician selected.",
      "any.required": "Please select a technician.",
    }),

  reason: Joi.string()
    .valid("HALF_DAY", "LEAVE", "PERSONAL", "OTHER")
    .required()
    .messages({
      "any.only": "Invalid transfer reason.",
      "any.required": "Transfer reason is required.",
    }),

  note: Joi.string()
    .trim()
    .min(3)
    .max(500)
    .required()
    .messages({
      "string.empty": "Transfer note is required.",
      "string.min": "Transfer note must be at least 3 characters.",
      "string.max": "Transfer note cannot exceed 500 characters.",
      "any.required": "Transfer note is required.",
    }),

});