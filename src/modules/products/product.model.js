
import mongoose from "mongoose";

import {
    PRODUCT_STATUS
} from "../../common/constants/productStatus.js";


const productSchema =
    new mongoose.Schema(

        {

            // =================================================
            // BASIC INFORMATION
            // =================================================

            name: {

                type: String,

                required: true,

                trim: true

            },


            slug: {

                type: String,

                unique: true,

                lowercase: true,

                trim: true

            },


            sku: {

                type: String,

                unique: true,

                trim: true

            },


            barcode: {

                type: String,

                unique: true,

                sparse: true

            },


            // =================================================
            // CATEGORY
            // =================================================

            category: {

                type:
                    mongoose.Schema.Types.ObjectId,

                ref: "Category",

                required: true

            },
           subcategory: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    default: null
},  
//          productType: {
//     type: String,
//     enum: ["NEW", "REFURBISHED"],
//     default: "NEW"
// },

productType: {
    type: String,

    enum: [
        "NEW",
        "REFURBISHED",
        "RENTAL"
    ],

    default: "NEW"
},

      refurbishedDetails: {
    grade: {
        type: String,
        enum: ["A+", "A", "B", "C"],
        default: null
    },

    batteryHealth: {
        type: Number,
        min: 0,
        max: 100,
        default: null
    },

    warrantyMonths: {
        type: Number,
        min: 0,
        default: null
    },

    testingStatus: {
        type: String,
        enum: ["TESTED", "NOT_TESTED"],
        default: null
    }
},

            // =================================================
            // BRAND
            // =================================================

            brand: {

                type:
                    mongoose.Schema.Types.ObjectId,

                ref: "Brand",

                required: true

            },


            // =================================================
            // DESCRIPTION
            // =================================================

            description: {

                type: String,

                default: ""

            },


            shortDescription: {

                type: String,

                default: ""

            },


            // =================================================
            // IMAGES
            // =================================================

            images: [

                {

                    url: {

                        type: String,

                        required: true

                    },

                    alt: {

                        type: String,

                        default: ""

                    }

                }

            ],


            // =================================================
            // PRICING
            // =================================================

            pricing: {

                purchasePrice: {

                    type: Number,

                    default: 0

                },

                sellingPrice: {

                    type: Number,

                    required: true

                },

                mrp: {

                    type: Number,

                    default: 0

                },

                discount: {

                    type: Number,

                    default: 0

                },

                gst: {

                    type: Number,

                    default: 0

                }

            },


            // =================================================
            // SPECIFICATIONS
            // =================================================

            specifications: {

                type: Object,

                default: {}

            },
          rental: {
    isAvailableForRent: {
        type: Boolean,
        default: false
    },

 
},

            // =================================================
            // SEO
            // =================================================

            metaTitle: {

                type: String,

                default: ""

            },


            metaDescription: {

                type: String,

                default: ""

            },


            // =================================================
            // STATUS
            // =================================================

            status: {

                type: String,

                enum: [

                    PRODUCT_STATUS.ACTIVE,

                    PRODUCT_STATUS.INACTIVE,

                    PRODUCT_STATUS.OUT_OF_STOCK,

                    PRODUCT_STATUS.DISCONTINUED

                ],

                default:
                    PRODUCT_STATUS.ACTIVE

            },


            // =================================================
            // SOFT DELETE
            // =================================================

            isDeleted: {

                type: Boolean,

                default: false

            },


            // =================================================
            // CREATED BY
            // =================================================

            createdBy: {

                type:
                    mongoose.Schema.Types.ObjectId,

                ref: "User"

            }

        },

        {

            timestamps: true

        }

    );


const Product =
    mongoose.model(
        "Product",
        productSchema
    );


export default Product;