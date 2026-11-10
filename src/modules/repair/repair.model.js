import mongoose from "mongoose";

// ======================================================
// CUSTOMER SOURCE KEYS
// ======================================================

export const CUSTOMER_SOURCE_VALUES = [
  "GOOGLE",
  "INSTAGRAM_FACEBOOK",
  "YOUTUBE",
  "REFERRAL",
  "EXISTING_CUSTOMER",
  "SHOP_BOARD",
  "ONLINE_AD",
  "INFLUENCER",
  "WHATSAPP",
  "OTHER",
];

// ======================================================
// REPAIR PART USED SUB-DOCUMENT
// ======================================================

const repairPartSchema = new mongoose.Schema(
  {
    repairPart: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "RepairPart",
      required: true,
    },

    quantity: {
      type: Number,
      required: true,
      min: 1,
    },

    unitCost: {
      type: Number,
      default: 0,
      min: 0,
    },

    totalCost: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    _id: true,
  }
);

// ======================================================
// TECHNICIAN TRANSFER HISTORY SUB-DOCUMENT
// ======================================================

const transferHistorySchema = new mongoose.Schema(
  {
    fromTechnician: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    toTechnician: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    reason: {
      type: String,
      enum: ["HALF_DAY", "LEAVE", "PERSONAL", "OTHER"],
      required: true,
    },

    note: {
      type: String,
      trim: true,
      maxlength: 500,
      default: "",
    },

    transferredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    transferredAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    _id: true,
  }
);

// ======================================================
// SERVICES SUB-DOCUMENT (Technician billing breakdown)
// ======================================================

const repairServiceSchema = new mongoose.Schema(
  {
    serviceId: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    serviceName: { type: String, trim: true, default: "" },
    category: { type: String, trim: true, default: "" },
    partCost: { type: Number, default: 0, min: 0 },
    laborCost: { type: Number, default: 0, min: 0 },
    totalCost: { type: Number, default: 0, min: 0 },
    isCustom: { type: Boolean, default: false },
  },
  {
    _id: false,
  }
);

// ======================================================
// REPAIR SCHEMA
// ======================================================

const repairSchema = new mongoose.Schema(
  {
    // ==================================================
    // CUSTOMER / USER
    // ==================================================

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    customerName: {
      type: String,
      required: [true, "Customer name is required"],
      trim: true,
    },

    customerPhone: {
      type: String,
      required: [true, "Customer phone is required"],
      trim: true,
    },

    customerEmail: {
      type: String,
      trim: true,
      lowercase: true,
      default: "",
    },

    // ==================================================
    // BRANCH MANAGEMENT
    // New Job Cards require a branch.
    // Old Job Cards without branch remain compatible.
    // ==================================================

    branchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Branch",

      required: [
        function () {
          return this.isNew;
        },
        "Branch selection is required for new Job Cards",
      ],

      default: null,
      index: true,
    },

    // ==================================================
    // CUSTOMER SOURCE
    // ==================================================

    customerSource: {
      type: String,
      enum: [...CUSTOMER_SOURCE_VALUES, ""],
      trim: true,
      default: "",
    },

    customerSourceOther: {
      type: String,
      trim: true,
      maxlength: 200,
      default: "",
    },

    // ==================================================
    // DEVICE
    // ==================================================

    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      default: null,
    },

    // ==================================================
    // JOB DATE
    // ==================================================

    jobDate: {
      type: Date,
      default: Date.now,
    },

    // ==================================================
    // DEVICE TYPE
    // ==================================================

    deviceType: {
      type: String,
      trim: true,
      default: "",
    },

    // ==================================================
    // HARDWARE MODEL
    // ==================================================

    deviceModel: {
      type: String,
      required: [true, "Hardware model is required"],
      trim: true,
    },

    serialNumber: {
      type: String,
      trim: true,
      default: "",
    },

    // ==================================================
    // ISSUE
    // ==================================================

    issueDescription: {
      type: String,
      required: [true, "Issue description is required"],
      trim: true,
    },

    // ==================================================
    // STATUS
    // ==================================================

    status: {
      type: String,
      enum: [
        "Received",
        "In Progress",
        "Assigned",
        "Waiting for Parts",
        "Completed",
        "Cancelled",
        "Delivered",
      ],
      default: "Received",
    },

    priority: {
      type: String,
      enum: [
        "Low",
        "Medium",
        "High",
        "Urgent",
      ],
      default: "Medium",
    },

    // ==================================================
    // COST
    // ==================================================

    estimatedCost: {
      type: Number,
      default: 0,
      min: 0,
    },

    repairCost: {
      type: Number,
      default: 0,
      min: 0,
    },

    // ==================================================
    // ESTIMATED COMPLETION
    // ==================================================

    estimatedCompletionDate: {
      type: Date,
      default: null,
    },

    // ==================================================
    // TECHNICIAN
    // ==================================================

    technicianName: {
      type: String,
      trim: true,
      default: "",
    },

    assignedTechnician: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    remarks: {
      type: String,
      trim: true,
      default: "",
    },

    // ==================================================
    // PAYMENT
    // ==================================================

    paymentStatus: {
      type: String,
      enum: [
        "PENDING",
        "PARTIAL",
        "PAID",
        "FAILED",
        "REFUNDED",
      ],
      default: "PENDING",
    },

    paidAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    balanceAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    paymentMethod: {
      type: String,
      enum: [
        "CASH",
        "UPI",
        "CARD",
        "BANK_TRANSFER",
        "RAZORPAY",
        "OTHER",
        "",
      ],
      default: "",
    },

    paymentId: {
      type: String,
      default: "",
      trim: true,
    },

    paidAt: {
      type: Date,
      default: null,
    },
    // ==================================================
    // SEQUENTIAL JOB NUMBER
    // 001, 002, 003 ... (mobile number se nahi banta)
    // ==================================================

    jobSerial: {
      type: Number,
      default: undefined,
      index: true,
    },

    repairNumber: {
      type: String,
      trim: true,
      unique: true,
      sparse: true,
      default: undefined,
    },

    // ==================================================
    // DEVICE WARRANTY TRACKING
    // ==================================================

    warrantyStatus: {
      type: String,
      enum: [
        "IN_WARRANTY",
        "OUT_OF_WARRANTY",
        "NOT_SPECIFIED",
      ],
      default: "NOT_SPECIFIED",
    },

    warrantyProvider: {
      type: String,
      trim: true,
      maxlength: 100,
      default: "",
    },

    warrantyExpiryDate: {
      type: Date,
      default: null,
    },

    warrantyDetails: {
      type: String,
      trim: true,
      maxlength: 500,
      default: "",
    },

    // ==================================================
    // SALESPERSON
    // ==================================================

    salespersonName: {
      type: String,
      trim: true,
      maxlength: 100,
      default: "",
    },

    // ==================================================
    // TECHNICIAN NOTES
    // (observations, diagnosis, repair actions)
    // ==================================================

    technicianNotes: {
      type: String,
      trim: true,
      maxlength: 3000,
      default: "",
    },

    technicianNotesUpdatedAt: {
      type: Date,
      default: null,
    },

    technicianNotesUpdatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    // ==================================================
    // TECHNICIAN TRANSFER HISTORY
    // ==================================================

    transferHistory: {
      type: [transferHistorySchema],
      default: [],
    },

    // ==================================================
    // SERVICES (billing breakdown from technician)
    // ==================================================

    services: {
      type: [repairServiceSchema],
      default: [],
    },
    // ==================================================
    // SPARE PARTS
    // ==================================================

    partsUsed: {
      type: [repairPartSchema],
      default: [],
    },

    partsCost: {
      type: Number,
      default: 0,
      min: 0,
    },

    // ==================================================
    // DELIVERY
    // ==================================================

    isDelivered: {
      type: Boolean,
      default: false,
    },

    deliveredAt: {
      type: Date,
      default: null,
    },

    // ==================================================
    // SOFT DELETE
    // Historical Job Cards remain in database.
    // ==================================================

    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },

    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// ======================================================
// INDEXES
// ======================================================

// Branch-wise Job Card filtering
repairSchema.index({
  branchId: 1,
  createdAt: -1,
});

// Status-wise filtering
repairSchema.index({
  status: 1,
});

// Customer search
repairSchema.index({
  customerPhone: 1,
});

// Soft-delete filtering
repairSchema.index({
  isDeleted: 1,
  createdAt: -1,
});

// Customer source reporting
repairSchema.index({
  customerSource: 1,
  createdAt: -1,
});

// Technician-wise filtering
repairSchema.index({
  assignedTechnician: 1,
  status: 1,
});

// ======================================================
// MODEL
// ======================================================

// Prevent OverwriteModelError during hot reload
const Repair =
  mongoose.models.Repair ||
  mongoose.model("Repair", repairSchema);

export default Repair;