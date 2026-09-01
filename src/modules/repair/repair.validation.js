import Joi from "joi";

// ==========================================
// Create Repair Validation
// ==========================================

export const createRepairValidation = Joi.object({
  // user: Joi.string().messages({
  //   "string.empty": "User is required.",
  //   "any.required": "User is required.",
  // }).optional(),

  // product: Joi.string().messages({
  //   "string.empty": "Product is required.",
  //   "any.required": "Product is required.",
  // }).optional(),

  customerName: Joi.string().trim().required(),
  customerPhone: Joi.string().required(), // <-- Add this
  customerEmail: Joi.string().email().required(), // <-- Add this
  deviceModel: Joi.string()
    .trim()
    .optional()
  ,
  issueDescription: Joi.string().trim().min(5).max(500).required().messages({
    "string.empty": "Issue description is required.",
    "string.min": "Issue description must be at least 5 characters.",
    "string.max": "Issue description cannot exceed 500 characters.",
    "any.required": "Issue description is required.",
  }),

  repairCost: Joi.number()
    .min(0)
    .default(0),

  // assignedTechnician: Joi.string().hex().length(24).allow(null, "").optional(),
  // technicianName: Joi.string().allow("").optional(),


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


  technicianName: Joi.string()
    .trim()
    .allow("")
    .max(100),
  assignedTechnician: Joi.string().hex().length(24).allow(null, "").optional(),
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

  // repairCost: Joi.number().required(),
  // services: Joi.array().items(
  //   Joi.object({
  //     serviceId: Joi.string().hex().length(24).required(),
  //     serviceName: Joi.string().required(),
  //     category: Joi.string().required(),
  //     partCost: Joi.number().min(0).required(),
  //     laborCost: Joi.number().min(0).required(),
  //     totalCost: Joi.number().min(0).required()
  //   })
  // ).required(),
  services: Joi.array().items(
    Joi.object({
      serviceId: Joi.string().allow(null, "").optional(),
      serviceName: Joi.string().trim().required(),
      category: Joi.string().trim().required(),
      partCost: Joi.number().min(0).required(),
      laborCost: Joi.number().min(0).required(),
      totalCost: Joi.number().min(0).required(),
      isCustom: Joi.boolean().optional()
    })
  ).optional(),
  repairCost: Joi.number().min(0).required(),

  priority: Joi.string()
    .valid("Low", "Medium", "High", "Urgent")
    .optional(),

  status: Joi.string()
    .valid(
      "Received",
      "In Progress",
      "Assigned",
      "Waiting for Parts",
      "Completed",
      "Cancelled",
      "Delivered"
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
      "Assigned",
      "Waiting for Parts",
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