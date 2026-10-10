import mongoose from "mongoose";

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

    // ==================================================
    // CUSTOMER EMAIL - OPTIONAL
    // ==================================================
    //
    // Email can be provided OR left empty.
    // Do NOT add required:true here.
    // Do NOT add unique:true here.
    //
    // Same customer can have multiple repair tickets.
    // ==================================================

    customerEmail: {
      type: String,
      trim: true,
      lowercase: true,
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

    // deviceModel: {
    //   type: String,
    //   required: [true, "Device model is required"],
    //   trim: true,
    // },


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
// Existing deviceModel field is preserved
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
  },
  {
    timestamps: true,
  }
);

// ======================================================
// MODEL
// ======================================================

const Repair = mongoose.model("Repair", repairSchema);

export default Repair;