import Joi from "joi";



export const createProductValidation = Joi.object({

    name:{
        type:String
    },


});


export const productValidation = Joi.object({

    name: Joi.string()
        .trim()
        .min(2)
        .required()
        .messages({

            "string.empty":
            "Product name is required",

            "any.required":
            "Product name is required"

        }),



    category: Joi.string()
        .required()
        .messages({

            "any.required":
            "Category is required"

        }),



    brand: Joi.string()
        .required()
        .messages({

            "any.required":
            "Brand is required"

        }),



    description:Joi.string()
        .allow("")
        .optional(),



    shortDescription:Joi.string()
        .allow("")
        .optional(),



    images:Joi.array()
        .items(
            Joi.object({

                url:Joi.string()
                    .required(),

                alt:Joi.string()
                    .allow("")

            })
        )
        .optional(),




    pricing:Joi.object({


        purchasePrice:Joi.number()
            .min(0)
            .default(0),



        sellingPrice:Joi.number()
            .positive()
            .required()
            .messages({

                "number.base":
                "Selling price must be number",

                "any.required":
                "Selling price is required"

            }),



        mrp:Joi.number()
            .min(0)
            .optional(),



        discount:Joi.number()
            .min(0)
            .max(100)
            .optional(),



        gst:Joi.number()
            .min(0)
            .max(100)
            .optional()


    })
    .required(),




    stock:Joi.number()
        .min(0)
        .default(0),




    minimumStock:Joi.number()
        .min(0)
        .default(0),




    specifications:Joi.object()
        .optional(),




    metaTitle:Joi.string()
        .allow("")
        .optional(),



    metaDescription:Joi.string()
        .allow("")
        .optional(),




    status:Joi.string()
        .valid(
            "ACTIVE",
            "INACTIVE",
            "OUT_OF_STOCK",
            "DISCONTINUED"
        )
        .optional()


});