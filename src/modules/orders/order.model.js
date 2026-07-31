// import mongoose from "mongoose";
// import { ORDER_STATUS } from "../../common/constants/orderStatus.js";



// const orderSchema = new mongoose.Schema(

// {

//     // Customer who placed order

//     user:{

//         type:mongoose.Schema.Types.ObjectId,

//         ref:"User",

        
//         required:true

//     },



//     // Products purchased

//   orderItems:[

// {

//     product:{

//         type:mongoose.Schema.Types.ObjectId,

//         ref:"Product",

//         required:true

//     },


//     title:{

//         type:String,

//         required:true

//     },


//     quantity:{

//         type:Number,

//         required:true,

//         min:1

//     },


//     // Product original price
//     originalPrice:{

//         type:Number,

//         required:true

//     },


//     // Offer discount amount
//     discountAmount:{

//         type:Number,

//         default:0

//     },


//     // Final price after offer
//     price:{

//         type:Number,

//         required:true

//     },


//     // Applied offer reference
//     offer:{

//         type:mongoose.Schema.Types.ObjectId,

//         ref:"Offer",

//         default:null

//     },


//     imageUrl:{

//         type:String

//     }

// }

// ],



//     // Delivery Address Snapshot

//    shippingAddress:{

//     fullName:{
//         type:String,
//         required:true
//     },

//     phone:{
//         type:String,
//         required:true
//     },

//     addressLine:{
//         type:String,
//         required:true
//     },

//     city:{
//         type:String,
//         required:true
//     },

//     state:{
//         type:String,
//         required:true
//     },

//     pincode:{
//         type:String,
//         required:true
//     },

//     country:{
//         type:String,
//         default:"India"
//     },

//     landmark:{
//         type:String,
//         default:""
//     }

// },



//     // Total Amount

//     totalAmount:{

//         type:Number,

//         required:true

//     },

//   coupon: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "Coupon",
//     default: null
// },

// // Coupon Code Snapshot
// couponCode: {
//     type: String,
//     default: ""
// },

// // Coupon Discount
// couponDiscount: {
//     type: Number,
//     default: 0
// },

//     // Order Status

// // Final Amount After Coupon
// finalAmount: {

//     type: Number,

//     required: true

// },


// orderStatus:{
//     type:String,
//     enum:Object.values(ORDER_STATUS),
//     default:ORDER_STATUS.PENDING
// },



//     // Payment Status

//     paymentStatus:{

//         type:String,

//         default:"PENDING"

//     },


//     // Payment Reference (future gateway)

//     paymentId:{

//         type:String

//     },
    
//     orderSource: {
//     type: String,
//     enum: [
//         "ONLINE",
//         "WALK_IN"
//     ],
//     default: "ONLINE"
// },
            


//     // Delivery information

//     deliveryDate:{

//         type:Date

//     }


// },

// {

//     timestamps:true

// }


// );



// const Order = mongoose.model(

//     "Order",

//     orderSchema

// );


// export default Order;


import mongoose from "mongoose";

import {
  ORDER_STATUS
} from "../../common/constants/orderStatus.js";


// ======================================================
// ORDER SCHEMA
// ======================================================

const orderSchema = new mongoose.Schema(

  {

    // ====================================================
    // CUSTOMER
    // ====================================================

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },


    // ====================================================
    // WALK-IN SALE PERSON
    // ====================================================

    soldBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },


    // ====================================================
    // ORDER ITEMS
    // ====================================================

    orderItems: [

      {

        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },


        title: {
          type: String,
          required: true,
          trim: true,
        },


        quantity: {
          type: Number,
          required: true,
          min: 1,
        },


        // Original product price
        originalPrice: {
          type: Number,
          required: true,
          min: 0,
        },


        // Discount
        discountAmount: {
          type: Number,
          default: 0,
          min: 0,
        },


        // Final selling price
        price: {
          type: Number,
          required: true,
          min: 0,
        },


        // Offer
        offer: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Offer",
          default: null,
        },


        // Product image
        imageUrl: {
          type: String,
          default: "",
        },

      },

    ],


    // ====================================================
    // SHIPPING ADDRESS
    // ====================================================

    shippingAddress: {

      fullName: {
        type: String,
        required: true,
        trim: true,
      },


      phone: {
        type: String,
        required: true,
        trim: true,
      },


      addressLine: {
        type: String,
        required: true,
        trim: true,
      },


      city: {
        type: String,
        required: true,
        trim: true,
      },


      state: {
        type: String,
        required: true,
        trim: true,
      },


      pincode: {
        type: String,
        required: true,
        trim: true,
      },


      country: {
        type: String,
        default: "India",
      },


      landmark: {
        type: String,
        default: "",
      },

    },


    // ====================================================
    // TOTAL
    // ====================================================

    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },


    // ====================================================
    // ORDER STATUS
    // ====================================================

    orderStatus: {
      type: String,

      enum: Object.values(
        ORDER_STATUS
      ),

      default:
        ORDER_STATUS.PENDING,
    },


    // ====================================================
    // PAYMENT STATUS
    // ====================================================

    paymentStatus: {

      type: String,

      enum: [
        "PENDING",
        "PAID",
        "FAILED",
        "REFUNDED",
      ],

      default: "PENDING",

    },

//new

    paidAmount: {
    type: Number,
    default: 0,
    min: 0,
},



    // Razorpay payment ID
    paymentId: {
      type: String,
      default: "",
      trim: true,
    },


    // ====================================================
    // ORDER SOURCE
    // ====================================================

    orderSource: {

      type: String,

      enum: [
        "ONLINE",
        "WALK_IN",
      ],

      default: "ONLINE",

    },


    // ====================================================
    // DELIVERY
    // ====================================================

    deliveryDate: {
      type: Date,
      default: null,
    },

  },

  {
    timestamps: true,
  }

);


// ======================================================
// MODEL
// ======================================================

const Order = mongoose.model(
  "Order",
  orderSchema
);


export default Order;