import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    // ==================================================
    // Basic Information
    // ==================================================

    firstName: {
      type: String,
      required: true,
      trim: true,
    },

    lastName: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    phone: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
    },

    profileImage: {
      type: String,
      default: "",
    },

    // ==================================================
    // Customer Information
    // ==================================================

    gender: {
      type: String,
      enum: ["MALE", "FEMALE", "OTHER"],
      default: null,
    },

    dob: {
      type: Date,
      default: null,
    },

    address: {
      type: String,
      default: "",
    },

    city: {
      type: String,
      default: "",
    },

    state: {
      type: String,
      default: "",
    },

    pincode: {
      type: String,
      default: "",
    },

    // ==================================================
    // Employee Information
    // ==================================================

    employeeId: {
      type: String,
      unique: true,
      sparse: true,
    },

    role: {
      type: String,
      enum: [
        "SUPER_ADMIN",
        "ADMIN",
        "RECEPTIONIST",
        "TECHNICIAN",
        "INVENTORY",
        "ACCOUNTANT",
        "CUSTOMER",
      ],
      default: "CUSTOMER",
    },

    department: {
      type: String,
      enum: [
        "ADMINISTRATION",
        "FRONT_DESK",
        "REPAIR",
        "INVENTORY",
        "ACCOUNTS",
        "CUSTOMER",
      ],
      default: "CUSTOMER",
    },

    designation: {
      type: String,
      default: "",
    },

    joiningDate: {
      type: Date,
      default: null,
    },

    // ==================================================
    // Account Status
    // ==================================================

    status: {
      type: String,
      enum: ["ACTIVE", "INACTIVE", "BLOCKED", "DELETED"],
      default: "ACTIVE",
    },

    isVerified: {
      type: Boolean,
      default: false,
    },

    isDeleted: {
      type: Boolean,
      default: false,
    },

    lastLogin: {
      type: Date,
      default: null,
    },

    // ==================================================
    // Audit Information
    // ==================================================

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

    // ==================================================
    // Company Information (Future Multi Branch Support)
    // ==================================================

    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      default: null,
    },

    branchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Branch",
      default: null,
    },

    // ==================================================
    // Employee Availability
    // ==================================================

    isOnline: {
      type: Boolean,
      default: false,
    },

    lastSeen: {
      type: Date,
      default: null,
    },

    isOnLeave: {
      type: Boolean,
      default: false,
    },

    shiftStatus: {
      type: String,
      enum: ["ON_SHIFT", "OFF_SHIFT"],
      default: "OFF_SHIFT",
    },

    currentJobCount: {
      type: Number,
      default: 0,
    },

    maxJobCapacity: {
      type: Number,
      default: 10,
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);

export default User;