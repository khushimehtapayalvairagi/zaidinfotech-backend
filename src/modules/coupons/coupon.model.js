import mongoose from "mongoose";


const couponSchema = new mongoose.Schema(

{

    // Coupon Code (user isko type karega)

    code:{
        type:String,
        required:true,
        unique:true,
        uppercase:true,
        trim:true
    },


    description:{
        type:String,
        default:""
    },


    // Discount Type

    discountType:{
        type:String,
        enum:[
            "PERCENTAGE",
            "FIXED"
        ],
        required:true
    },


    // Discount Value

    discountValue:{
        type:Number,
        required:true,
        min:0
    },


    // Percentage discount ko cap karne ke liye
    // e.g. 20% off but max ₹500 tak hi

    maxDiscountAmount:{
        type:Number,
        default:null
    },


    // Minimum cart value jispe coupon apply hoga

    minCartValue:{
        type:Number,
        default:0
    },


    // Total kitni baar use ho sakta hai (sab users milakar)

    usageLimit:{
        type:Number,
        default:null   // null = unlimited
    },


    // Ek user kitni baar use kar sakta hai

    usageLimitPerUser:{
        type:Number,
        default:1
    },


    // Kitni baar ab tak use ho chuka hai

    usedCount:{
        type:Number,
        default:0
    },


    // Kis kis user ne kitni baar use kiya

    usedBy:[

        {
            user:{
                type:mongoose.Schema.Types.ObjectId,
                ref:"User"
            },

            count:{
                type:Number,
                default:0
            }
        }

    ],


    // Validity

    startDate:{
        type:Date,
        required:true
    },


    endDate:{
        type:Date,
        required:true
    },


    // Manual Control

    status:{
        type:String,
        enum:[
            "ACTIVE",
            "INACTIVE",
            "EXPIRED"
        ],
        default:"ACTIVE"
    },


    createdBy:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    }


},

{
    timestamps:true
}

);


// ================================
// Helper: Coupon abhi valid hai ya nahi
// (date + status check, usage limit yahan check nahi)
// ================================

couponSchema.methods.isCouponValid = function(){

    const today = new Date();

    return (

        this.status === "ACTIVE"

        &&

        today >= this.startDate

        &&

        today <= this.endDate

    );

};


const Coupon = mongoose.model(
    "Coupon",
    couponSchema
);


export default Coupon;