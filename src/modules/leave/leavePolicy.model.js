import mongoose from "mongoose";

const leavePolicySchema = new mongoose.Schema(
  {
    // ==========================================
    // LEAVE TYPE
    // ==========================================

    leaveType: {
      type: String,
      enum: [
        "CASUAL",
        "SICK",
        "EARNED",
        "UNPAID",
        "OTHER",
      ],
      required: true,
      unique: true,
    },

    // ==========================================
    // MONTHLY ALLOWED DAYS
    // ==========================================

    monthlyLimit: {
      type: Number,
      default: 0,
      min: 0,
    },

    // ==========================================
    // YEARLY ALLOWED DAYS
    // Optional
    // ==========================================

    yearlyLimit: {
      type: Number,
      default: 0,
      min: 0,
    },

    // ==========================================
    // CAN CARRY FORWARD?
    // ==========================================

    carryForward: {
      type: Boolean,
      default: false,
    },

    // ==========================================
    // ACTIVE
    // ==========================================

    isActive: {
      type: Boolean,
      default: true,
    },

    // ==========================================
    // CREATED BY
    // ==========================================

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const LeavePolicy = mongoose.model(
  "LeavePolicy",
  leavePolicySchema
);

export default LeavePolicy;