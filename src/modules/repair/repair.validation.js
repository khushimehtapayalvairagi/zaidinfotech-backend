import Joi from "joi";

// ======================================================
// CREATE REPAIR VALIDATION
// ======================================================

export const createRepairValidation = Joi.object({
  user: Joi.string()
    .hex()
    .length(24)
    .allow(null, "")
    .optional(),

  product: Joi.string()
    .hex()
    .length(24)
    .allow(null, "")
    .optional(),

  customerName: Joi.string()
    .trim()
    .min(2)
    .max(100)
    .required()
    .messages({
      "string.empty": "Customer name is required.",
      "any.required": "Customer name is required.",
    }),

  customerPhone: Joi.string()
    .trim()
    .min(7)
    .max(20)
    .required()
    .messages({
      "string.empty": "Customer phone is required.",
      "any.required": "Customer phone is required.",
    }),

customerEmail: Joi.string()
  .trim()
  .email()
  .allow("")
  .optional()
  .messages({
    "string.email": "Please provide a valid customer email.",
  }),

  jobDate: Joi.date()
  .allow(null, "")
  .optional(),

deviceType: Joi.string()
  .trim()
  .max(100)
  .allow("", null)
  .optional(),
  // IMPORTANT:
  // Repair model says required, so Joi must also say required.
  deviceModel: Joi.string()
    .trim()
    .min(1)
    .max(150)
    .required()
    .messages({
      "string.empty": "Device model is required.",
      "any.required": "Device model is required.",
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

  serialNumber: Joi.string()
    .trim()
    .allow("")
    .max(100)
    .optional(),

  priority: Joi.string()
    .valid(
      "Low",
      "Medium",
      "High",
      "Urgent"
    )
    .default("Medium"),

  estimatedCost: Joi.number()
    .min(0)
    .default(0),

  repairCost: Joi.number()
    .min(0)
    .default(0),

  estimatedCompletionDate: Joi.date()
    .allow(null, "")
    .optional(),

  technicianName: Joi.string()
    .trim()
    .allow("")
    .max(100)
    .optional(),

  assignedTechnician: Joi.string()
    .hex()
    .length(24)
    .allow(null, "")
    .optional(),

  remarks: Joi.string()
    .trim()
    .allow("")
    .max(500)
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
    .default("Received"),
});

// ======================================================
// UPDATE REPAIR VALIDATION
// ======================================================

export const updateRepairValidation = Joi.object({
  user: Joi.string()
    .hex()
    .length(24)
    .allow(null)
    .optional(),

  product: Joi.string()
    .hex()
    .length(24)
    .allow(null)
    .optional(),

  issueDescription: Joi.string()
    .trim()
    .min(5)
    .max(500)
    .optional(),

  deviceModel: Joi.string()
    .trim()
    .allow("", null)
    .optional(),

  serialNumber: Joi.string()
    .trim()
    .allow("", null)
    .optional(),

  technicianNotes: Joi.string()
    .allow("", null)
    .optional(),

  finalCost: Joi.number()
    .min(0)
    .optional(),

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

  repairCost: Joi.number()
    .min(0)
    .optional(),

  priority: Joi.string()
    .valid(
      "Low",
      "Medium",
      "High",
      "Urgent"
    )
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

  customerName: Joi.string()
    .trim()
    .optional(),

  customerPhone: Joi.string()
    .trim()
    .optional(),

  customerEmail: Joi.string()
    .trim()
    .email()
    .optional(),

  remarks: Joi.string()
    .trim()
    .allow("")
    .optional(),

  estimatedCompletionDate: Joi.date()
    .allow(null, "")
    .optional(),
});

// ======================================================
// UPDATE STATUS
// ======================================================

export const updateRepairStatusValidation = Joi.object({
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
    .required()
    .messages({
      "any.required": "Status is required.",
      "any.only": "Invalid repair status.",
    }),
});

// ======================================================
// ADD REPAIR PART
// ======================================================

export const addRepairPartValidation = Joi.object({
  repairPartId: Joi.string()
    .hex()
    .length(24)
    .required(),

  quantity: Joi.number()
    .integer()
    .min(1)
    .required(),

  remarks: Joi.string()
    .trim()
    .allow("")
    .max(500)
    .optional(),
});