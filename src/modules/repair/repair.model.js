import mongoose from "mongoose";

const repairPartSchema = new mongoose.Schema(
  {
    repairPart: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "RepairPart", // 
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
    },

    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
    },
    customerName: {  //customerName
      type: String,
      required: true,
      trim: true
    },
    customerPhone: {   //customephone
      type: String,
      required: true,
      trim: true
    },
    customerEmail: {  //customrEmail
      type: String,
      unique: true,
      required: true,
      trim: true
    },
    deviceModel: {
      type: String,
      required: true,
      trim: true
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
        "Assigned",
        "Waiting for Parts",
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