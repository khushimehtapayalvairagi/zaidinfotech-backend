import Joi from "joi";


export const categoryValidation = Joi.object({

    name:Joi.string()
    .required(),

    image:Joi.string()
    .allow(""),

    description:Joi.string()
    .allow(""),


    parentCategory:Joi.string()
    .allow(null)


});