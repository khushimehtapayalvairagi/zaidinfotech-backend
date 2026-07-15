import Joi from "joi";


// =================================
// Create Address Validation
// =================================

export const createAddressValidation = Joi.object({

    type:Joi.string()
        .valid(
            "HOME",
            "OFFICE",
            "OTHER"
        )
        .default("HOME"),



    fullName:Joi.string()
        .trim()
        .min(2)
        .max(100)
        .required()
        .messages({

            "string.empty":
            "Full name is required",

            "any.required":
            "Full name is required"

        }),



    phone:Joi.string()
        .pattern(/^[0-9]{10}$/)
        .required()
        .messages({

            "string.pattern.base":
            "Phone number must be 10 digits"

        }),




    addressLine:Joi.string()
        .trim()
        .required(),




    city:Joi.string()
        .trim()
        .required(),




    state:Joi.string()
        .trim()
        .required(),




    pincode:Joi.string()
        .pattern(/^[0-9]{6}$/)
        .required()
        .messages({

            "string.pattern.base":
            "Pincode must be 6 digits"

        }),




    country:Joi.string()
        .default("India"),




    landmark:Joi.string()
        .allow("")
        .optional(),




    isDefault:Joi.boolean()
        .optional()


});





// =================================
// Update Address Validation
// =================================

export const updateAddressValidation = Joi.object({


    type:Joi.string()
        .valid(
            "HOME",
            "OFFICE",
            "OTHER"
        ),



    fullName:Joi.string()
        .trim()
        .min(2),



    phone:Joi.string()
        .pattern(/^[0-9]{10}$/),



    addressLine:Joi.string()
        .trim(),



    city:Joi.string()
        .trim(),



    state:Joi.string()
        .trim(),



    pincode:Joi.string()
        .pattern(/^[0-9]{6}$/),



    country:Joi.string(),



    landmark:Joi.string()
        .allow("")

});