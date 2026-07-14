import mongoose from "mongoose";
import {
PRODUCT_STATUS
} from "../../common/constants/productStatus.js";

const productSchema = new mongoose.Schema(
{

    // Basic Information

    name:{
        type:String,
        required:true,
        trim:true
    },


    slug:{
        type:String,
        unique:true,
        lowercase:true,
        trim:true
    },


    sku:{
        type:String,
        unique:true,
        trim:true
    },


    barcode:{
        type:String,
        unique:true,
        sparse:true
    },



    // Category Relation

    category:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Category",
        required:true
    },



    // Brand Relation

    brand:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Brand",
        required:true
    },



    // Product Description

    description:{
        type:String,
        default:""
    },


    shortDescription:{
        type:String,
        default:""
    },



    // Product Images

    images:[
        {
            url:{
                type:String,
                required:true
            },

            alt:{
                type:String,
                default:""
            }
        }
    ],



    // Pricing Details

    pricing:{


        // Admin/Owner ke liye
        purchasePrice:{
            type:Number,
            default:0
        },


        // Customer ko ye price dikhega
        sellingPrice:{
            type:Number,
            required:true
        },


        mrp:{
            type:Number,
            default:0
        },


        discount:{
            type:Number,
            default:0
        },


        gst:{
            type:Number,
            default:0
        }

    },



    // Basic Stock (Temporary)
    // Later Inventory Module me shift hoga

    stock:{
        type:Number,
        default:0
    },


    minimumStock:{
        type:Number,
        default:0
    },



    // Product Specifications

    specifications:{
        type:Object,
        default:{}
    },



    // SEO

    metaTitle:{
        type:String,
        default:""
    },


    metaDescription:{
        type:String,
        default:""
    },



    // Product Status

  status:{
    type:String,

    enum:[
        PRODUCT_STATUS.ACTIVE,
        PRODUCT_STATUS.INACTIVE,
        PRODUCT_STATUS.OUT_OF_STOCK,
        PRODUCT_STATUS.DISCONTINUED
    ],

    default: PRODUCT_STATUS.ACTIVE
},



    // Soft Delete

    isDeleted:{
        type:Boolean,
        default:false
    },



    // Kis Admin ne banaya

    createdBy:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    }


},
{
    timestamps:true
}

);



const Product = mongoose.model(
    "Product",
    productSchema
);



export default Product;