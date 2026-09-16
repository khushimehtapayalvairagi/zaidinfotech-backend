
import mongoose from "mongoose";

const purchaseItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true
    },

    productName: {
      type: String,
      required: true,
      trim: true
    },

    quantity: {
      type: Number,
      required: true,
      min: 1
    },

    purchasePrice: {
      type: Number,
      required: true,
      min: 0
    },

    gst: {
      type: Number,
      default: 0,
      min: 0
    },

    totalAmount: {
      type: Number,
      required: true,
      min: 0
    }
  },
  { _id: true }
);


const purchaseSchema = new mongoose.Schema(
  {
    purchaseNumber: {
      type: String,
      unique: true,
      index: true
    },

    vendorName: {
      type: String,
      required: true,
      trim: true
    },

    vendorPhone: {
      type: String,
      trim: true,
      default: ""
    },

    vendorEmail: {
      type: String,
      trim: true,
      default: ""
    },

    vendorInvoiceNumber: {
      type: String,
      trim: true,
      default: ""
    },

    invoiceDate: {
      type: Date,
      default: Date.now
    },

    items: {
      type: [purchaseItemSchema],
      required: true
    },

    subtotal: {
      type: Number,
      required: true,
      min: 0
    },

    gstAmount: {
      type: Number,
      default: 0,
      min: 0
    },

    totalAmount: {
      type: Number,
      required: true,
      min: 0
    },

    paidAmount: {
      type: Number,
      default: 0,
      min: 0
    },

    pendingAmount: {
      type: Number,
      default: 0,
      min: 0
    },

    paymentStatus: {
      type: String,
      enum: [
        "PENDING",
        "PARTIAL",
        "PAID"
      ],
      default: "PENDING"
    },

    verified: {
      type: Boolean,
      default: false
    },

    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
    },

    verifiedAt: {
      type: Date,
      default: null
    },

    notes: {
      type: String,
      default: "",
      trim: true
    },

    isDeleted: {
      type: Boolean,
      default: false
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    }
  },
  {
    timestamps: true
  }
);


purchaseSchema.pre("save", async function (next) {
  if (!this.purchaseNumber) {
    const count = await mongoose.model("Purchase").countDocuments();

    this.purchaseNumber =
      `PUR${String(count + 1).padStart(6, "0")}`;
  }

  next();
});


export default mongoose.model(
  "Purchase",
  purchaseSchema
);

