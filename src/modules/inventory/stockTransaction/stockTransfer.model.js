import mongoose from "mongoose";


const stockTransferSchema = new mongoose.Schema(

    {

        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            required: true,
            index: true
        },

        inventory: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Inventory",
            required: true
        },

        // TRANSFER = Store <-> Warehouse
        // WAREHOUSE_IN = naya stock seedha warehouse me aaya
        movementType: {
            type: String,
            enum: ["TRANSFER", "WAREHOUSE_IN"],
            required: true
        },

        fromLocation: {
            type: String,
            enum: ["STORE", "WAREHOUSE", "SUPPLIER"],
            required: true
        },

        toLocation: {
            type: String,
            enum: ["STORE", "WAREHOUSE"],
            required: true
        },

        quantity: {
            type: Number,
            required: true,
            min: 1
        },

        storeStockBefore: { type: Number, default: 0 },
        storeStockAfter: { type: Number, default: 0 },
        warehouseStockBefore: { type: Number, default: 0 },
        warehouseStockAfter: { type: Number, default: 0 },

        note: {
            type: String,
            default: ""
        },

        transferredBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }

    },

    {
        timestamps: true
    }

);


const StockTransfer =
    mongoose.models.StockTransfer ||
    mongoose.model("StockTransfer", stockTransferSchema);

export default StockTransfer;