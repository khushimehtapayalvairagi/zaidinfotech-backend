import mongoose from "mongoose";

const returnSchema = new mongoose.Schema(
    {
        // ======================================================
        // RETURN NUMBER
        // ======================================================

        returnNumber: {
            type: String,
            unique: true,
            required: true,
            trim: true,
            index: true
        },

        // ======================================================
        // ORDER
        // ======================================================

        order: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Order",
            required: true,
            index: true
        },

        // ======================================================
        // CUSTOMER
        // ======================================================

        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true
        },

        // ======================================================
        // RETURN ITEMS
        // ======================================================

        items: [
            {
                product: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Product",
                    required: true
                },

                title: {
                    type: String,
                    required: true,
                    trim: true
                },

                quantity: {
                    type: Number,
                    required: true,
                    min: 1
                },

                // Price at the time of order
                price: {
                    type: Number,
                    required: true,
                    min: 0
                },

                // ==================================================
                // RETURN REASON
                // ==================================================

                reason: {
                    type: String,
                    enum: [
                        "WRONG_PRODUCT",
                        "DAMAGED",
                        "DEFECTIVE",
                        "NOT_AS_EXPECTED",
                        "SIZE_ISSUE",
                        "CHANGE_OF_MIND",
                        "OTHER"
                    ],
                    required: true
                },

                reasonNote: {
                    type: String,
                    default: "",
                    trim: true
                },

                // ==================================================
                // INSPECTION CONDITION
                // ==================================================

                condition: {
                    type: String,
                    enum: [
                        "PENDING",
                        "GOOD",
                        "DAMAGED",
                        "DEFECTIVE",
                        "MISSING_PARTS"
                    ],
                    default: "PENDING"
                },

                inspectionNote: {
                    type: String,
                    default: "",
                    trim: true
                },

                // ==================================================
                // INVENTORY
                // ==================================================

                restocked: {
                    type: Boolean,
                    default: false
                }
            }
        ],

        // ======================================================
        // RETURN STATUS
        // ======================================================

        status: {
            type: String,
            enum: [
                "REQUESTED",
                "APPROVED",
                "REJECTED",
                "PICKUP_REQUESTED",
                "PICKED_UP",
                "RECEIVED",
                "INSPECTED",
                "COMPLETED",
                "CANCELLED"
            ],
            default: "REQUESTED",
            index: true
        },

        // ======================================================
        // PICKUP
        // ======================================================

        pickupRequired: {
            type: Boolean,
            default: false
        },

        pickupAddress: {
            fullName: {
                type: String,
                default: ""
            },

            phone: {
                type: String,
                default: ""
            },

            addressLine: {
                type: String,
                default: ""
            },

            city: {
                type: String,
                default: ""
            },

            state: {
                type: String,
                default: ""
            },

            pincode: {
                type: String,
                default: ""
            },

            country: {
                type: String,
                default: "India"
            },

            landmark: {
                type: String,
                default: ""
            }
        },

        // ======================================================
        // BLUE DART / COURIER DETAILS
        // ======================================================
        // Abhi manually/store kar sakte hain.
        // Later Blue Dart API se fill honge.

        courierName: {
            type: String,
            default: ""
        },

        trackingNumber: {
            type: String,
            default: "",
            trim: true
        },

        trackingUrl: {
            type: String,
            default: ""
        },

        // ======================================================
        // REQUEST / APPROVAL USERS
        // ======================================================

        requestedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        approvedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null
        },

        receivedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null
        },

        inspectedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null
        },

        completedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null
        },

        // ======================================================
        // DATES
        // ======================================================

        approvedAt: {
            type: Date,
            default: null
        },

        pickedUpAt: {
            type: Date,
            default: null
        },

        receivedAt: {
            type: Date,
            default: null
        },

        inspectedAt: {
            type: Date,
            default: null
        },

        completedAt: {
            type: Date,
            default: null
        },

        // ======================================================
        // NOTES
        // ======================================================

        customerNote: {
            type: String,
            default: "",
            trim: true
        },

        adminNote: {
            type: String,
            default: "",
            trim: true
        },

        rejectionReason: {
            type: String,
            default: "",
            trim: true
        },

        isDeleted: {
            type: Boolean,
            default: false,
            index: true
        }
    },
    {
        timestamps: true
    }
);


// ======================================================
// INDEXES
// ======================================================

returnSchema.index({
    order: 1,
    user: 1
});

returnSchema.index({
    status: 1,
    createdAt: -1
});


const Return = mongoose.model(
    "Return",
    returnSchema
);

export default Return;