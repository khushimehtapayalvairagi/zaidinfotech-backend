// import mongoose from "mongoose";

// const notificationSchema = new mongoose.Schema(
//   {
//     // Kisko notification jaani hai
//     user: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User",
//       required: true,
//     },

//     // Notification type
//     type: {
//       type: String,
//       enum: [
//         // =========================
//         // E-commerce Notifications
//         // =========================
//         "ORDER_PLACED",
//         "PAYMENT",
//         "ORDER_STATUS",
//         "STOCK_LOW",
//         "STOCK_OUT",
//         "PRODUCT_RESTOCKED",

//         // =========================
//         // Repair Notifications
//         // =========================
//         "REPAIR_ASSIGNED",
//         "PART_REQUIRED",
//         "PART_ISSUED",
//         "REPAIR_COMPLETED",
//         "REPAIR_CANCELLED",
//         "REPAIR_DELIVERED",
//          "REPAIR_STATUS_CHANGED",

//         // =========================
//         // Common
//         // =========================
//         "GENERAL",
//       ],
//       required: true,
//     },

//     // Notification title
//     title: {
//       type: String,
//       required: true,
//       trim: true,
//     },

//     // Notification message
//     message: {
//       type: String,
//       required: true,
//       trim: true,
//     },

//     // Related record ID
//     // Example:
//     // Order ID
//     // Product ID
//     // Repair ID
//     // Inventory ID
//     relatedId: {
//       type: mongoose.Schema.Types.ObjectId,
//       default: null,
//     },

//     // Related record ka model
//     relatedModel: {
//       type: String,
//       enum: [
//         "Order",
//         "Product",
//         "Repair",
//         "Inventory",
//         null,
//       ],
//       default: null,
//     },

//     // Read / Unread
//     isRead: {
//       type: Boolean,
//       default: false,
//        index: true,
//     },
//   },
//   {
//     timestamps: true,
//   }
// );

// // Fast notification query
// notificationSchema.index({
//   user: 1,
//   createdAt: -1,
// });

// // Prevent OverwriteModelError
// const Notification =
//   mongoose.models.Notification ||
//   mongoose.model("Notification", notificationSchema);

// export default Notification;


import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    // ==========================================
    // USER
    // ==========================================

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // ==========================================
    // NOTIFICATION TYPE
    // ==========================================

    type: {
      type: String,

      enum: [
        // ======================================
        // E-COMMERCE
        // ======================================

        "ORDER_PLACED",
        "PAYMENT",
        "ORDER_STATUS",

        // ======================================
        // INVENTORY
        // ======================================

        "STOCK_LOW",
        "STOCK_OUT",
        "PRODUCT_RESTOCKED",

        // ======================================
        // AVAILABILITY
        // ======================================

        "AVAILABILITY_REQUEST",
        "AVAILABILITY_STATUS_CHANGED",

        // ======================================
        // REPAIR
        // ======================================

        "REPAIR_ASSIGNED",
        "PART_REQUIRED",
        "PART_ISSUED",
        "REPAIR_COMPLETED",
        "REPAIR_CANCELLED",
        "REPAIR_DELIVERED",
        "REPAIR_STATUS_CHANGED",

            // ======================================
// RENTAL
// ======================================

"RENTAL_CREATED",
"RENTAL_APPROVED",
"RENTAL_REJECTED",
"RENTAL_RETURN_REQUESTED",
"RENTAL_RETURNED",
"RENTAL_OVERDUE",
        // ======================================
        // COMMON
        // ======================================

        "GENERAL",
      ],

      required: true,
    },

    // ==========================================
    // TITLE
    // ==========================================

    title: {
      type: String,
      required: true,
      trim: true,
    },

    // ==========================================
    // MESSAGE
    // ==========================================

    message: {
      type: String,
      required: true,
      trim: true,
    },

    // ==========================================
    // RELATED ID
    // ==========================================

    relatedId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },

    // ==========================================
    // RELATED MODEL
    // ==========================================

 relatedModel: {
    type: String,

    enum: [
        "Order",
        "Product",
        "Repair",
        "Inventory",
        "AvailabilityRequest",
        "Rental",
        null,
    ],

    default: null,
},

    // ==========================================
    // READ STATUS
    // ==========================================

    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
  },

  {
    timestamps: true,
  }
);

// ==========================================
// FAST USER NOTIFICATION QUERY
// ==========================================

notificationSchema.index({
  user: 1,
  createdAt: -1,
});

// ==========================================
// PREVENT OVERWRITE MODEL ERROR
// ==========================================

const Notification =
  mongoose.models.Notification ||
  mongoose.model(
    "Notification",
    notificationSchema
  );

export default Notification;