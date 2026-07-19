import Joi from "joi";



// =======================================
// Add Wishlist Validation
// =======================================

export const addWishlistValidation = Joi.object({

    productId:Joi.string()
        .required()
        .messages({

            "string.empty":
            "Product Id is required",

            "any.required":
            "Product Id is required"

        })

});




// =======================================
// Remove Wishlist Validation
// =======================================

export const removeWishlistValidation = Joi.object({

    productId:Joi.string()
        .required()
        .messages({

            "string.empty":
            "Product Id is required",

            "any.required":
            "Product Id is required"

        })

});