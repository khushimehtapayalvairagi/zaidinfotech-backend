import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    // Kisko notification jaani hai
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Notification type
    type: {
      type: String,
      enum: [
        // =========================
        // E-commerce Notifications
        // =========================
        "ORDER_PLACED",
        "PAYMENT",
        "ORDER_STATUS",
        "STOCK_LOW",
        "STOCK_OUT",
        "PRODUCT_RESTOCKED",

        // =========================
        // Repair Notifications
        // =========================
        "REPAIR_ASSIGNED",
        "PART_REQUIRED",
        "PART_ISSUED",
        "REPAIR_COMPLETED",
        "REPAIR_CANCELLED",
        "REPAIR_DELIVERED",

        // =========================
        // Common
        // =========================
        "GENERAL",
      ],
      required: true,
    },

    // Notification title
    title: {
      type: String,
      required: true,
      trim: true,
    },

    // Notification message
    message: {
      type: String,
      required: true,
      trim: true,
    },

    // Related record ID
    // Example:
    // Order ID
    // Product ID
    // Repair ID
    // Inventory ID
    relatedId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },

    // Related record ka model
    relatedModel: {
      type: String,
      enum: [
        "Order",
        "Product",
        "Repair",
        "Inventory",
        null,
      ],
      default: null,
    },

    // Read / Unread
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Fast notification query
notificationSchema.index({
  user: 1,
  createdAt: -1,
});

// Prevent OverwriteModelError
const Notification =
  mongoose.models.Notification ||
  mongoose.model("Notification", notificationSchema);

export default Notification;