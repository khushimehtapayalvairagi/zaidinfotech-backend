import mongoose from "mongoose";



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


        name:{

            type:String,

            required:true

        },


        mobile:{

            type:String,

            required:true

        },


        streetAddress:{

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

        default:"PENDING"

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