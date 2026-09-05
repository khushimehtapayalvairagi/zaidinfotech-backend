import mongoose from "mongoose";

const rentalProductSchema = new mongoose.Schema(
    {
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            required: true,
            unique: true,
            index: true
        },

        isAvailableForRent: {
            type: Boolean,
            default: false,
            index: true
        },

        monthlyRent: {
            type: Number,
            required: function () {
                return this.isAvailableForRent;
            },
            min: 0
        },

        securityDeposit: {
            type: Number,
            required: function () {
                return this.isAvailableForRent;
            },
            min: 0
        },

        minimumRentalMonths: {
            type: Number,
            default: 3,
            min: 3
        },

        gst: {
            type: Number,
            default: 0,
            min: 0
        },

        availableQuantity: {
            type: Number,
            default: 0,
            min: 0
        },

        basicSoftwareInstalled: {
            type: Boolean,
            default: true
        },

        includedItems: {
            type: [String],
            default: [
                "LAPTOP",
                "CHARGING_ADAPTER",
                "BACKPACK"
            ]
        },

        status: {
            type: String,
            enum: ["ACTIVE", "INACTIVE"],
            default: "ACTIVE"
        },

        notes: {
            type: String,
            default: ""
        },

        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },

        updatedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
    },
    {
        timestamps: true
    }
);

rentalProductSchema.index({
    isAvailableForRent: 1,
    status: 1,
    availableQuantity: 1
});

const RentalProduct = mongoose.model(
    "RentalProduct",
    rentalProductSchema
);

export default RentalProduct;