import mongoose from "mongoose";

const expenseSchema = new mongoose.Schema(
    {
        expenseNumber: {
            type: String,
            unique: true,
            required: true,
            trim: true
        },

        category: {
            type: String,
            enum: [
                "OFFICE_RENT",
                "ELECTRICITY",
                "INTERNET",
                "TRAVEL",
                "OFFICE_SUPPLIES",
                "MAINTENANCE",
                "PURCHASE",
                "SALARY",
                "MARKETING",
                "OTHER"
            ],
            required: true
        },

        title: {
            type: String,
            required: true,
            trim: true
        },

        description: {
            type: String,
            default: ""
        },

        amount: {
            type: Number,
            required: true,
            min: 0
        },

        paymentMethod: {
            type: String,
            enum: [
                "CASH",
                "BANK",
                "UPI"
            ],
            required: true
        },

        expenseDate: {
            type: Date,
            required: true,
            default: Date.now
        },

        receiptNumber: {
            type: String,
            default: "",
            trim: true
        },

        vendorName: {
            type: String,
            default: "",
            trim: true
        },

        status: {
            type: String,
            enum: [
                "PENDING",
                "PAID",
                "CANCELLED"
            ],
            default: "PAID"
        },

        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        approvedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null
        },

        approvedAt: {
            type: Date,
            default: null
        },

        remark: {
            type: String,
            default: ""
        },

        isDeleted: {
            type: Boolean,
            default: false
        }
    },
    {
        timestamps: true
    }
);


expenseSchema.index({
    category: 1,
    expenseDate: 1
});

expenseSchema.index({
    status: 1
});

expenseSchema.index({
    expenseDate: 1
});


export default mongoose.model(
    "Expense",
    expenseSchema
);