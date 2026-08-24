import mongoose from "mongoose";

const repairPartSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
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

const repairSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },

    issueDescription: {
      type: String,
      required: true,
      trim: true,
    },

    status: {
      type: String,
      enum: [
        "Received",
        "In Progress",
        "Completed",
        "Cancelled",
      ],
      default: "Received",
    },

    estimatedCompletionDate: {
      type: Date,
    },

    repairCost: {
      type: Number,
      default: 0,
      min: 0,
    },

    technicianName: {
      type: String,
      trim: true,
      default: "",
    },

    remarks: {
      type: String,
      trim: true,
      default: "",
    },

    // ==========================================
    // SPARE PARTS USED
    // ==========================================

    partsUsed: [
      repairPartSchema
    ],

    // ==========================================
    // TOTAL PARTS COST
    // ==========================================

    partsCost: {
      type: Number,
      default: 0,
      min: 0,
    },

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

const Repair =
  mongoose.model("Repair", repairSchema);

export default Repair;