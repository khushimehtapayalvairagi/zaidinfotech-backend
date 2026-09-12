

import mongoose from "mongoose";

import {
    INVENTORY_STATUS
} from "../../common/constants/inventoryStatus.js";


const inventorySchema = new mongoose.Schema(

    {

        product: {

            type:
                mongoose.Schema.Types.ObjectId,

            ref:
                "Product",

            required:
                true,

            unique:
                true

        },


        currentStock: {

            type:
                Number,

            default:
                0,

            min:
                0

        },


        reservedStock: {

            type:
                Number,

            default:
                0,

            min:
                0

        },


        minimumStock: {

            type:
                Number,

            default:
                5,

            min:
                0

        },


        maximumStock: {

            type:
                Number,

            default:
                0,

            min:
                0

        },


        unit: {

            type:
                String,

            default:
                "piece"

        },


        location: {

            type:
                String,

            default:
                "Main Store"

        },


        status: {

            type:
                String,

            enum: [

                INVENTORY_STATUS.IN_STOCK,

                INVENTORY_STATUS.LOW_STOCK,

                INVENTORY_STATUS.OUT_OF_STOCK

            ],

            default:
                INVENTORY_STATUS.OUT_OF_STOCK

        },


        lastUpdatedBy: {

            type:
                mongoose.Schema.Types.ObjectId,

            ref:
                "User"

        },


        isDeleted: {

            type:
                Boolean,

            default:
                false

        }

    },

    {

        timestamps:
            true

    }

);


// ======================================================
// AVAILABLE STOCK
// ======================================================

inventorySchema.virtual(
    "availableStock"
)
.get(function () {

    return Math.max(

        Number(this.currentStock || 0) -
        Number(this.reservedStock || 0),

        0

    );

});


inventorySchema.set(
    "toJSON",
    {
        virtuals: true
    }
);


const Inventory =
    mongoose.model(
        "Inventory",
        inventorySchema
    );


export default Inventory;