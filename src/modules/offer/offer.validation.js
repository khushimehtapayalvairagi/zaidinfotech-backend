import Joi from "joi";


// ================================
// CREATE OFFER VALIDATION
// ================================

export const createOfferValidation = Joi.object({

    title: Joi.string()
    .required()
    .trim(),


    description: Joi.string()
    .allow("")
    .optional(),



    discountType: Joi.string()
    .valid(
        "PERCENTAGE",
        "FLAT"
    )
    .required(),



    discountValue: Joi.number()
    .required()
    .min(0),



    products: Joi.array()
    .items(
        Joi.string()
    )
    .min(1)
    .required(),



    startDate: Joi.date()
    .required(),



    endDate: Joi.date()
    .required(),



    status: Joi.string()
    .valid(
        "ACTIVE",
        "INACTIVE"
    )
    .default("ACTIVE")


});





// ================================
// UPDATE OFFER VALIDATION
// ================================

export const updateOfferValidation = Joi.object({

    title:Joi.string(),

    description:Joi.string()
    .allow(""),


    discountType:Joi.string()
    .valid(
        "PERCENTAGE",
        "FLAT"
    ),


    discountValue:Joi.number()
    .min(0),


    products:Joi.array()
    .items(
        Joi.string()
    ),


    startDate:Joi.date(),


    endDate:Joi.date(),


    status:Joi.string()
    .valid(
        "ACTIVE",
        "INACTIVE"
    )

});