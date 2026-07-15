import mongoose from "mongoose";


const addressSchema = new mongoose.Schema(
{

    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },


    type:{
        type:String,

        enum:[
            "HOME",
            "OFFICE",
            "OTHER"
        ],

        default:"HOME"
    },


    fullName:{
        type:String,
        required:true,
        trim:true
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
    },


    isDefault:{
        type:Boolean,
        default:false
    },


    isDeleted:{
        type:Boolean,
        default:false
    }


},
{
    timestamps:true
}

);



const Address = mongoose.model(
    "Address",
    addressSchema
);


export default Address;