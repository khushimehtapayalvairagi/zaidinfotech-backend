import Joi from "joi";


export const createInventoryValidation = Joi.object({

    product: Joi.string()
        .required()
        .messages({

            "string.empty":"Product is required",

            "any.required":"Product is required"

        }),



    currentStock: Joi.number()
        .min(0)
        .default(0),



    reservedStock: Joi.number()
        .min(0)
        .default(0),



    minimumStock: Joi.number()
        .min(0)
        .default(0),



    maximumStock: Joi.number()
        .min(0)
        .default(0),



    unit: Joi.string()
        .default("piece"),



    location:Joi.string()
        .default("Main Store")


});





export const updateInventoryValidation = Joi.object({

    currentStock:Joi.number()
        .min(0),


    reservedStock:Joi.number()
        .min(0),


    minimumStock:Joi.number()
        .min(0),


    maximumStock:Joi.number()
        .min(0),


    unit:Joi.string(),


    location:Joi.string()


});