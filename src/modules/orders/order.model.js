import mongoose from "mongoose";
import { ORDER_STATUS } from "../../common/constants/orderStatus.js";



const orderSchema = new mongoose.Schema(

{

    // Customer who placed order

    user:{

        type:mongoose.Schema.Types.ObjectId,

        ref:"User",

        required:true

    },



    // Products purchased

    orderItems:[

        {

            product:{

                type:mongoose.Schema.Types.ObjectId,

                ref:"Product",

                required:true

            },


            title:{

                type:String,

                required:true

            },


            quantity:{

                type:Number,

                required:true,

                min:1

            },


            price:{

                type:Number,

                required:true

            },


            imageUrl:{

                type:String

            }

        }

    ],



    // Delivery Address Snapshot

   shippingAddress:{

    fullName:{
        type:String,
        required:true
    },

    phone:{
        type:String,
        required:true
    },

    addressLine:{
        type:String,
        required:true
    },

    city:{
        type:String,
        required:true
    },

    state:{
        type:String,
        required:true
    },

    pincode:{
        type:String,
        required:true
    },

    country:{
        type:String,
        default:"India"
    },

    landmark:{
        type:String,
        default:""
    }

},



    // Total Amount

    totalAmount:{

        type:Number,

        required:true

    },



    // Order Status




orderStatus:{
    type:String,
    enum:Object.values(ORDER_STATUS),
    default:ORDER_STATUS.PENDING
},



    // Payment Status

    paymentStatus:{

        type:String,

        default:"PENDING"

    },


    // Payment Reference (future gateway)

    paymentId:{

        type:String

    },
    
    orderSource: {
    type: String,
    enum: [
        "ONLINE",
        "WALK_IN"
    ],
    default: "ONLINE"
},
            


    // Delivery information

    deliveryDate:{

        type:Date

    }


},

{

    timestamps:true

}


);



const Order = mongoose.model(

    "Order",

    orderSchema

);


export default Order;