import mongoose from "mongoose";

import { PAYMENT_STATUS } from "../../common/constants/paymentStatus.js";
import { PAYMENT_METHOD } from "../../common/constants/paymentMethod.js";
import { PAYMENT_FOR } from "../../common/constants/paymentFor.js";

const paymentSchema = new mongoose.Schema(

{

    // User who made payment

    user:{

        type:mongoose.Schema.Types.ObjectId,

        ref:"User",

        required:true

    },



    // ORDER / REPAIR / RENTAL

    paymentFor:{

        type:String,

        enum:Object.values(PAYMENT_FOR),

        required:true

    },



    // Reference Id

    referenceId:{

        type:mongoose.Schema.Types.ObjectId,

        required:true

    },



    // Amount

    amount:{

        type:Number,

        required:true,

        min:0

    },



    // Payment Method

    paymentMethod:{

        type:String,

        enum:Object.values(PAYMENT_METHOD),

        required:true

    },



    // Payment Status

    paymentStatus:{

        type:String,

        enum:Object.values(PAYMENT_STATUS),

        default:PAYMENT_STATUS.PENDING

    },



    // Gateway Transaction Id

    transactionId:{

        type:String,

        default:""

    },



    // Gateway Name

    gateway:{

        type:String,

        default:""

    },



    // Gateway Response

    gatewayResponse:{

        type:Object,

        default:{}

    },



    // Failure Reason

    failureReason:{

        type:String,

        default:""

    },



    // Paid Time

    paidAt:{

        type:Date

    },



    // Refund Time

    refundedAt:{

        type:Date

    }



},

{

    timestamps:true

}

);



const Payment = mongoose.model(

    "Payment",

    paymentSchema

);



export default Payment;