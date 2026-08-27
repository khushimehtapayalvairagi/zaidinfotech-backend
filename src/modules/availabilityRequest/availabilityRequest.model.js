import mongoose from "mongoose";

const availabilityRequestSchema = new mongoose.Schema(
    {
        // ==========================================
        // Product
        // ==========================================
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            required: true
        },

        // ==========================================
        // Customer Name
        // ==========================================
        name: {
            type: String,
            required: true,
            trim: true
        },

        // ==========================================
        // Customer Mobile
        // ==========================================
        mobile: {
            type: String,
            required: true,
            trim: true
        },

        // ==========================================
        // Customer Email
        // ==========================================
        email: {
            type: String,
            default: "",
            trim: true,
            lowercase: true
        },

        // ==========================================
        // Customer Message
        // ==========================================
        message: {
            type: String,
            default: "",
            trim: true
        },

        // ==========================================
        // Request Status
        // ==========================================
        status: {
            type: String,
            enum: [
                "PENDING",
                "CONTACTED",
                "RESOLVED"
            ],
            default: "PENDING"
        },

        // ==========================================
        // Soft Delete
        // ==========================================
        isDeleted: {
            type: Boolean,
            default: false
        }
    },
    {
        timestamps: true
    }
);

const AvailabilityRequest =
    mongoose.model(
        "AvailabilityRequest",
        availabilityRequestSchema
    );

export default AvailabilityRequest;