import mongoose from "mongoose";


const offerSchema = new mongoose.Schema(

{

    // Offer Name

    title:{
        type:String,
        required:true,
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
        required:true
    },


    // Offer Apply On Products

    products:[

        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"Product"
        }

    ],



    // Offer Apply On Category (future)

    categories:[

        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"Category"
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



// Automatic check helper

offerSchema.methods.isOfferActive = function(){

    const today = new Date();


    return (

        this.status === "ACTIVE"

        &&

        today >= this.startDate

        &&

        today <= this.endDate

    );

};



const Offer = mongoose.model(
    "Offer",
    offerSchema
);


export default Offer;