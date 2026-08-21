import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    // Kisko notification jaani hai
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // Notification type
    type: {
      type: String,
      enum: [
        "ORDER_PLACED",
        "PAYMENT",
        "ORDER_STATUS",
        "STOCK_LOW",
        "STOCK_OUT",
        "PRODUCT_RESTOCKED",

        // =====================================
        // LEAVE MANAGEMENT
        // =====================================
        "LEAVE_REQUEST",
        "LEAVE_APPROVED",
        "LEAVE_REJECTED",

        // =====================================
        // HOLIDAY
        // =====================================
        "HOLIDAY_CREATED",

        "GENERAL",
      ],
      required: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    message: {
      type: String,
      required: true,
      trim: true,
    },

    // Related record
    relatedId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },

    relatedModel: {
      type: String,
      enum: [
        "Order",
        "Product",
        "Leave",
        "Holiday",
        null,
      ],
      default: null,
    },

    isRead: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

notificationSchema.index({
  user: 1,
  createdAt: -1,
});

const Notification = mongoose.model(
  "Notification",
  notificationSchema
);

export default Notification;