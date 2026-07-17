import Joi from "joi";



// =================================
// Add To Cart Validation
// =================================

export const addToCartValidation = Joi.object({

    product: Joi.string()
        .required()
        .messages({

            "any.required":
            "Product id is required"

        }),


    quantity: Joi.number()
        .integer()
        .min(1)
        .required()
        .messages({

            "number.base":
            "Quantity must be a number",

            "number.min":
            "Quantity must be at least 1",

            "any.required":
            "Quantity is required"

        })

});