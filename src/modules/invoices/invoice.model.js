import mongoose from "mongoose";

const invoiceSchema = new mongoose.Schema(
  {
    // =========================================
    // INVOICE NUMBER
    // =========================================

    invoiceNumber: {
      type: String,
      unique: true,
      required: true,
      trim: true,
    },

    // =========================================
    // ORDER
    // =========================================

    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
      unique: true,
      index: true,
    },

    // =========================================
    // CUSTOMER
    // =========================================

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // =========================================
    // ORDER SOURCE
    // ONLINE / WALK_IN
    // =========================================

    orderSource: {
      type: String,
      enum: ["ONLINE", "WALK_IN"],
      required: true,
    },

    // =========================================
    // SOLD BY
    // Mainly for WALK-IN
    // =========================================

    soldBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    // =========================================
    // ITEMS
    // =========================================

    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          default: null,
        },

        title: {
          type: String,
          required: true,
        },

        quantity: {
          type: Number,
          required: true,
          min: 1,
        },

        originalPrice: {
          type: Number,
          required: true,
          min: 0,
        },

        discountAmount: {
          type: Number,
          default: 0,
          min: 0,
        },

        price: {
          type: Number,
          required: true,
          min: 0,
        },

        total: {
          type: Number,
          required: true,
          min: 0,
        },

        imageUrl: {
          type: String,
          default: "",
        },
      },
    ],

    // =========================================
    // AMOUNTS
    // =========================================

    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },

    discount: {
      type: Number,
      default: 0,
      min: 0,
    },

    totalAmount: {
      type: Number,
      required: true,
      min: 0,
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

    // =========================================
    // PAYMENT
    // =========================================

    paymentStatus: {
      type: String,
      enum: [
        "PENDING",
        "PAID",
        "PARTIAL",
        "FAILED",
        "REFUNDED",
      ],
      default: "PENDING",
    },

    paymentMethod: {
      type: String,
      default: "",
    },

    payment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Payment",
      default: null,
    },

    // =========================================
    // BILLING / SHIPPING ADDRESS
    // =========================================

    billingAddress: {
      fullName: {
        type: String,
        default: "",
      },

      phone: {
        type: String,
        default: "",
      },

      addressLine: {
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

      country: {
        type: String,
        default: "India",
      },

      landmark: {
        type: String,
        default: "",
      },
    },

    // =========================================
    // DATE
    // =========================================

    invoiceDate: {
      type: Date,
      default: Date.now,
    },

    notes: {
      type: String,
      default: "",
    },

    // =========================================
    // DELETE
    // =========================================

    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const Invoice = mongoose.model(
  "Invoice",
  invoiceSchema
);

export default Invoice;