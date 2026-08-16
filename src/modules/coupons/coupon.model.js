// import mongoose from "mongoose";


// const couponSchema = new mongoose.Schema(

// {

//     // Coupon Code (user isko type karega)

//     code:{
//         type:String,
//         required:true,
//         unique:true,
//         uppercase:true,
//         trim:true
//     },


//     description:{
//         type:String,
//         default:""
//     },


//     // Discount Type

//     discountType:{
//         type:String,
//         enum:[
//             "PERCENTAGE",
//             "FIXED"
//         ],
//         required:true
//     },


//     // Discount Value

//     discountValue:{
//         type:Number,
//         required:true,
//         min:0
//     },


//     // Percentage discount ko cap karne ke liye
//     // e.g. 20% off but max ₹500 tak hi

//     maxDiscountAmount:{
//         type:Number,
//         default:null
//     },


//     // Minimum cart value jispe coupon apply hoga

//     minCartValue:{
//         type:Number,
//         default:0
//     },


//     // Total kitni baar use ho sakta hai (sab users milakar)

//     usageLimit:{
//         type:Number,
//         default:null   // null = unlimited
//     },


//     // Ek user kitni baar use kar sakta hai

//     usageLimitPerUser:{
//         type:Number,
//         default:1
//     },


//     // Kitni baar ab tak use ho chuka hai

//     usedCount:{
//         type:Number,
//         default:0
//     },


//     // Kis kis user ne kitni baar use kiya

//     usedBy:[

//         {
//             user:{
//                 type:mongoose.Schema.Types.ObjectId,
//                 ref:"User"
//             },

//             count:{
//                 type:Number,
//                 default:0
//             }
//         }

//     ],


//     // Validity

//     startDate:{
//         type:Date,
//         required:true
//     },


//     endDate:{
//         type:Date,
//         required:true
//     },


//     // Manual Control

//     status:{
//         type:String,
//         enum:[
//             "ACTIVE",
//             "INACTIVE",
//             "EXPIRED"
//         ],
//         default:"ACTIVE"
//     },


//     createdBy:{
//         type:mongoose.Schema.Types.ObjectId,
//         ref:"User"
//     }


// },

// {
//     timestamps:true
// }

// );


// // ================================
// // Helper: Coupon abhi valid hai ya nahi
// // (date + status check, usage limit yahan check nahi)
// // ================================

// couponSchema.methods.isCouponValid = function(){

//     const today = new Date();

//     return (

//         this.status === "ACTIVE"

//         &&

//         today >= this.startDate

//         &&

//         today <= this.endDate

//     );

// };


// const Coupon = mongoose.model(
//     "Coupon",
//     couponSchema
// );


// export default Coupon;








import mongoose from "mongoose";


// ======================================================
// COUPON SCHEMA
// ======================================================

const couponSchema = new mongoose.Schema(
    {

        // ==================================================
        // COUPON CODE
        // ==================================================

        code: {
            type: String,
            required: true,
            unique: true,
            uppercase: true,
            trim: true
        },


        // ==================================================
        // DESCRIPTION
        // ==================================================

        description: {
            type: String,
            default: ""
        },


        // ==================================================
        // DISCOUNT TYPE
        // ==================================================

        discountType: {
            type: String,
            enum: [
                "PERCENTAGE",
                "FIXED"
            ],
            required: true
        },


        // ==================================================
        // DISCOUNT VALUE
        // ==================================================

        discountValue: {
            type: Number,
            required: true,
            min: 0
        },


        // ==================================================
        // MAX DISCOUNT
        // Only used for PERCENTAGE
        // ==================================================

        maxDiscountAmount: {
            type: Number,
            default: null,
            min: 0
        },


        // ==================================================
        // MINIMUM CART VALUE
        // ==================================================

        minCartValue: {
            type: Number,
            default: 0,
            min: 0
        },


        // ==================================================
        // TOTAL USAGE LIMIT
        // null = unlimited
        // ==================================================

        usageLimit: {
            type: Number,
            default: null,
            min: 1
        },


        // ==================================================
        // PER USER USAGE LIMIT
        // ==================================================

        usageLimitPerUser: {
            type: Number,
            default: 1,
            min: 1
        },


        // ==================================================
        // TOTAL USED COUNT
        // ==================================================

        usedCount: {
            type: Number,
            default: 0,
            min: 0
        },


        // ==================================================
        // USER USAGE
        // ==================================================

        usedBy: [
            {
                user: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "User"
                },

                count: {
                    type: Number,
                    default: 0,
                    min: 0
                }
            }
        ],


        // ==================================================
        // START DATE
        // ==================================================

        startDate: {
            type: Date,
            required: true
        },


        // ==================================================
        // END DATE
        // ==================================================

        endDate: {
            type: Date,
            required: true
        },


        // ==================================================
        // STATUS
        // ==================================================

        status: {
            type: String,
            enum: [
                "ACTIVE",
                "INACTIVE",
                "EXPIRED"
            ],
            default: "ACTIVE"
        },


        // ==================================================
        // CREATED BY
        // ==================================================

        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null
        }

    },

    {
        timestamps: true
    }
);


// ======================================================
// CHECK COUPON VALIDITY
// ======================================================

couponSchema.methods.isCouponValid = function () {

    const now = new Date();

    return (
        this.status === "ACTIVE" &&
        now >= this.startDate &&
        now <= this.endDate
    );

};


// ======================================================
// MODEL
// ======================================================

const Coupon = mongoose.model(
    "Coupon",
    couponSchema
);


export default Coupon;