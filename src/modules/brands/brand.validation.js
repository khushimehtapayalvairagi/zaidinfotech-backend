import Joi from "joi";

export const brandValidation = Joi.object({
  name: Joi.string().trim().required(),

  logo: Joi.string().allow(""),

  description: Joi.string().allow(""),

  category: Joi.string().required(),

  status: Joi.string()
    .valid("ACTIVE", "INACTIVE")
    .optional(),
});