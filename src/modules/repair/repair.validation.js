import Joi from "joi";

// ==========================================
// Create Repair Validation
// ==========================================

export const createRepairValidation = Joi.object({
  user: Joi.string().required().messages({
    "string.empty": "User is required.",
    "any.required": "User is required.",
  }),

  product: Joi.string().required().messages({
    "string.empty": "Product is required.",
    "any.required": "Product is required.",
  }),

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

  deviceModel: Joi.string()
    .trim()
    .optional()
    .allow(""),

  serialNumber: Joi.string()
    .trim()
    .optional()
    .allow(""),

  priority: Joi.string()
    .valid("Low", "Medium", "High", "Urgent")
    .default("Medium"),

  estimatedCost: Joi.number()
    .min(0)
    .optional(),

  estimatedCompletionDate: Joi.date()
    .optional(),

  repairCost: Joi.number()
    .min(0)
    .default(0),

  technicianName: Joi.string()
    .trim()
    .allow("")
    .max(100),

  remarks: Joi.string()
    .trim()
    .allow("")
    .max(500),

  status: Joi.string()
    .valid(
      "Received",
      "In Progress",
      "Completed",
      "Cancelled"
    )
    .optional(),
});


// ==========================================
// Update Repair Validation
// ==========================================

export const updateRepairValidation = Joi.object({
  user: Joi.string()
    .hex()
    .length(24)
    .optional(),

  product: Joi.string()
    .hex()
    .length(24)
    .optional(),

  issueDescription: Joi.string()
    .trim()
    .min(5)
    .max(500)
    .optional(),

  deviceModel: Joi.string()
    .allow("", null)
    .optional(),

  serialNumber: Joi.string()
    .allow("", null)
    .optional(),

  technicianNotes: Joi.string()
    .allow("", null)
    .optional(),

  finalCost: Joi.number()
    .min(0)
    .optional(),

  priority: Joi.string()
    .valid("Low", "Medium", "High", "Urgent")
    .optional(),

  status: Joi.string()
    .valid(
      "Received",
      "In Progress",
      "Completed",
      "Cancelled"
    )
    .optional(),
});


// ==========================================
// Update Status Validation
// ==========================================

export const updateRepairStatusValidation = Joi.object({
  status: Joi.string()
    .valid(
      "Received",
      "In Progress",
      "Completed",
      "Cancelled"
    )
    .required()
    .messages({
      "any.required": "Status is required.",
      "any.only": "Invalid repair status.",
    }),
});


// ==========================================
// Add Repair Part Validation
// ==========================================

export const addRepairPart = Joi.object({
  productId: Joi.string()
    .hex()
    .length(24)
    .required()
    .messages({
      "string.empty": "Product ID is required.",
      "any.required": "Product ID is required.",
      "string.length": "Invalid Product ID.",
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
    .allow("")
    .max(500)
    .optional(),
});