import mongoose from "mongoose";

const repairPartSchema = new mongoose.Schema(
    {
        partName: {
            type: String,
            required: [true, "Part name is required"],
            trim: true,
        },
        partSku: {
            type: String,
            required: [true, "SKU/Part code is required"],
            unique: true,
            uppercase: true,
            trim: true,
        },
        category: {
            type: String,
            enum: ["Display / Screen", "Battery", "Motherboard / IC", "Storage / RAM", "Keyboard / Touchpad", "Cables / Ports", "Other"],
            default: "Other",
        },
        compatibleModels: {
            type: [String],
            default: [],
        },
        purchaseCost: {
            type: Number,
            required: true,
            min: 0,
        },
        sellingPrice: {
            type: Number,
            required: true,
            min: 0,
        },
        stockQuantity: {
            type: Number,
            required: true,
            min: [0, "Stock cannot be negative"],
            default: 0,
        },
        minThreshold: {
            type: Number,
            default: 3,
            min: 1,
        },
        locationBin: {
            type: String,
            default: "RACK-A1",
            trim: true,
        },
    },
    { timestamps: true }
);

const RepairPart = new mongoose.model("RepairPart", repairPartSchema);
export default RepairPart;