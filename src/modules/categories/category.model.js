import mongoose from "mongoose";


const categorySchema = new mongoose.Schema(
{
    name:{
        type:String,
        required:true,
        unique:true,
        trim:true
    },


    slug:{
        type:String,
        unique:true,
        lowercase:true,
        trim:true
    },


    image:{
        type:String,
        default:""
    },


    description:{
        type:String,
        default:""
    },


    parentCategory:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Category",
        default:null
    },


    status:{
        type:String,
        enum:["ACTIVE","INACTIVE"],
        default:"ACTIVE"
    },


    sortOrder:{
        type:Number,
        default:0
    },


    isDeleted:{
        type:Boolean,
        default:false
    },


    createdBy:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        default:null
    }


},
{
    timestamps:true
}
);



const Category = mongoose.model(
    "Category",
    categorySchema
);


export default Category;