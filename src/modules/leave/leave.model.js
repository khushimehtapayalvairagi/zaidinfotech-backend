import mongoose from "mongoose";

const leaveSchema = new mongoose.Schema(
  {
    // ==========================================
    // EMPLOYEE
    // ==========================================

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    employeeId: {
      type: String,
      required: true,
      trim: true,
    },

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
    },

    // ==========================================
    // DATES
    // ==========================================

    fromDate: {
      type: Date,
      required: true,
    },

    toDate: {
      type: Date,
      required: true,
    },

    totalDays: {
      type: Number,
      required: true,
      min: 1,
    },

    // ==========================================
    // REASON
    // ==========================================

    reason: {
      type: String,
      required: true,
      trim: true,
    },

    // ==========================================
    // STATUS
    // ==========================================

    status: {
      type: String,
      enum: [
        "PENDING",
        "APPROVED",
        "REJECTED",
        "CANCELLED",
      ],
      default: "PENDING",
      index: true,
    },

    // ==========================================
    // ADMIN REMARK
    // ==========================================

    adminRemark: {
      type: String,
      default: "",
      trim: true,
    },

    // ==========================================
    // ADMIN ACTION
    // ==========================================

    actionBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    actionAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

leaveSchema.index({
  user: 1,
  fromDate: 1,
  toDate: 1,
});

const Leave = mongoose.model("Leave", leaveSchema);

export default Leave;