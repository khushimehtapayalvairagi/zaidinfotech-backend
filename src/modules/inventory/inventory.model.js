import mongoose from "mongoose";

import {
    INVENTORY_STATUS
} from "../../common/constants/inventoryStatus.js";



const inventorySchema = new mongoose.Schema(
{

    // Product Relation

    product:{

        type:mongoose.Schema.Types.ObjectId,

        ref:"Product",

        required:true,

        unique:true

    },



    // Current Available Stock

    currentStock:{

        type:Number,

        default:0,

        min:0

    },



    // Order / Rental ke liye Reserved Stock

    reservedStock:{

        type:Number,

        default:0,

        min:0

    },



    // Minimum Stock Alert

    minimumStock:{

        type:Number,

        default:0,

        min:0

    },



    // Maximum Stock Limit

    maximumStock:{

        type:Number,

        default:0,

        min:0

    },



    // Product Unit

    unit:{

        type:String,

        default:"piece",

        trim:true

    },



    // Store Location (future warehouse ke liye)

    location:{

        type:String,

        default:"Main Store"

    },



    // Inventory Status

    status:{

        type:String,

        enum:[

            INVENTORY_STATUS.IN_STOCK,

            INVENTORY_STATUS.LOW_STOCK,

            INVENTORY_STATUS.OUT_OF_STOCK

        ],

        default:INVENTORY_STATUS.OUT_OF_STOCK

    },



    // Last Updated By Admin

    lastUpdatedBy:{

        type:mongoose.Schema.Types.ObjectId,

        ref:"User"

    },



    // Soft Delete

    isDeleted:{

        type:Boolean,

        default:false

    }


},
{
    timestamps:true
}

);



const Inventory = mongoose.model(
    "Inventory",
    inventorySchema
);



export default Inventory;