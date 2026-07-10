import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
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
    },

    password: {
      type: String,
      required: true,
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

branchId: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "Branch",
  default: null,
},

companyId: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "Company",
  default: null,
},

lastLogin: {
  type: Date,
  default: null,
},

   status: {
  type: String,
  enum: ["ACTIVE", "INACTIVE", "BLOCKED", "DELETED"],
  default: "ACTIVE",
},

    profileImage: {
      type: String,
      default: "",
    },

    isVerified: {
      type: Boolean,
      default: false,
    },
    employeeCode: {
  type: String,
  unique: true,
},

isDeleted: {
  type: Boolean,
  default: false,
},
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);

export default User;