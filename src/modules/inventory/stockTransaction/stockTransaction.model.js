import mongoose from "mongoose";


const stockTransactionSchema = new mongoose.Schema(

    {

        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            required: true
        },

        inventory: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Inventory"
        },

        repair: {
            type: mongoose.Schema.Types.ObjectId
        },

        type: {
            type: String,
            required: true
        },

        quantity: {
            type: Number,
            default: 0
        },

        previousStock: {
            type: Number,
            default: 0
        },

        updatedStock: {
            type: Number,
            default: 0
        },

        salePrice: {
            type: Number,
            default: 0
        },

        totalAmount: {
            type: Number,
            default: 0
        },

        orderSource: {
            type: String
        },

        description: {
            type: String,
            default: ""
        },

        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }

    },

    {
        timestamps: true,
        strict: false
    }

);


const StockTransaction =
    mongoose.models.StockTransaction ||
    mongoose.model("StockTransaction", stockTransactionSchema);

export default StockTransaction;