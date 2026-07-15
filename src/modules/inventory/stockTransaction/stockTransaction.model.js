import mongoose from "mongoose";


const stockTransactionSchema =
new mongoose.Schema(
{

    // Product

    product:{

        type:mongoose.Schema.Types.ObjectId,

        ref:"Product",

        required:true

    },


    // Inventory Reference

    inventory:{

        type:mongoose.Schema.Types.ObjectId,

        ref:"Inventory",

        required:true

    },



    // Transaction Type


    type:{

        type:String,

        enum:[

            "STOCK_IN",

            "STOCK_OUT",

            "ORDER",

            "REPAIR_USAGE",

            "RENTAL_OUT",

            "RETURN"

        ],

        required:true

    },




    // Quantity Changed

    quantity:{

        type:Number,

        required:true

    },




    // Before Stock

    previousStock:{

        type:Number,

        default:0

    },




    // After Stock

    updatedStock:{

        type:Number,

        default:0

    },




    // Reason

    description:{

        type:String,

        default:""

    },




    // Who Updated

    createdBy:{

        type:mongoose.Schema.Types.ObjectId,

        ref:"User"

    }


},
{
    timestamps:true
}

);



const StockTransaction =
mongoose.model(
"StockTransaction",
stockTransactionSchema
);



export default StockTransaction;