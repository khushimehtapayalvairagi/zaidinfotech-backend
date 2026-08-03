import mongoose from "mongoose";


const shiftSchema = new mongoose.Schema(
{
    name:{
        type:String,
        required:true,
        trim:true
    },


    startTime:{
        type:String,
        required:true
        // Example: 09:00
    },


    endTime:{
        type:String,
        required:true
        // Example: 18:00
    },


    breakDuration:{
        type:Number,
        default:60
        // minutes
    },


    lateAllowedMinutes:{
        type:Number,
        default:10
    },


    overtimeAllowed:{
        type:Boolean,
        default:true
    },


    description:{
        type:String,
        default:""
    },


    status:{
        type:String,
        enum:[
            "ACTIVE",
            "INACTIVE"
        ],
        default:"ACTIVE"
    },


    companyId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Company",
        default:null
    },


    branchId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Branch",
        default:null
    },


    createdBy:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    },


    updatedBy:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    }


},
{
    timestamps:true
}
);



export default mongoose.model(
    "Shift",
    shiftSchema
);