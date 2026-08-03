import Joi from "joi";


// Manual Attendance Validation

export const manualAttendanceValidation = Joi.object({

    user:Joi.string()
        .required()
        .messages({
            "any.required":
            "Employee is required"
        }),


    status:Joi.string()
        .valid(
            "PRESENT",
            "ABSENT",
            "HALF_DAY",
            "LEAVE"
        )
        .required(),


    remark:Joi.string()
        .allow("")

});





// Biometric Validation

export const biometricAttendanceValidation = Joi.object({

    biometricId:Joi.string()
        .required()
        .messages({
            "any.required":
            "Biometric ID required"
        }),


    punchTime:Joi.date()
        .required()

});





// Checkout Validation

export const checkoutValidation = Joi.object({

    user:Joi.string()
        .required()

});