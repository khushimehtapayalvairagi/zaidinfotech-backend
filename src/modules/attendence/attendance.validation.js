import Joi from "joi";

export const manualAttendanceValidation = Joi.object({
    user: Joi.string()
        .required()
        .messages({
            "string.empty": "User is required",
            "any.required": "User is required"
        }),

    employeeId: Joi.string()
        .required()
        .messages({
            "string.empty": "Employee ID is required",
            "any.required": "Employee ID is required"
        }),

    date: Joi.date()
        .required()
        .messages({
            "date.base": "Date must be a valid date",
            "any.required": "Date is required"
        }),

    status: Joi.string()
        .valid(
            "PRESENT",
            "ABSENT",
            "HALF_DAY",
            "LEAVE",
            "LATE"
        )
        .required()
        .messages({
            "any.only": "Invalid attendance status",
            "any.required": "Attendance status is required"
        }),

    attendanceMode: Joi.string()
        .valid("MANUAL", "BIOMETRIC")
        .required()
        .messages({
            "any.only": "Invalid attendance mode",
            "any.required": "Attendance mode is required"
        }),

    remark: Joi.string()
        .allow("")
        .optional(),
     checkIn: Joi.date().allow(null).optional(), 
     checkOut: Joi.date().allow(null).optional(),    
});

// export const biometricAttendanceValidation = Joi.object({
//     user: Joi.string().required(),

//     employeeId: Joi.string().required(),

//     date: Joi.date().required(),

//     attendanceMode: Joi.string()
//         .valid("BIOMETRIC")
//         .required(),

//     punchType: Joi.string()
//         .valid("CHECK_IN", "CHECK_OUT")
//         .required()
// });

export const biometricAttendanceValidation = Joi.object({

    user: Joi.string()
        .optional(),

    employeeId: Joi.string()
        .required(),

    biometricId: Joi.string()
        .allow("")
        .optional(),

    date: Joi.date()
        .optional(),

    punchTime: Joi.date()
        .optional(),

    attendanceMode: Joi.string()
        .valid("BIOMETRIC")
        .optional()
        .default("BIOMETRIC"),

    punchType: Joi.string()
        .valid(
            "CHECK_IN",
            "CHECK_OUT"
        )
        .optional(),

    deviceSerialNumber: Joi.string()
        .allow("")
        .optional(),

    verifyMode: Joi.alternatives()
        .try(
            Joi.string(),
            Joi.number()
        )
        .optional()

});


export const checkoutValidation = Joi.object({
    user: Joi.string().required(),

    employeeId: Joi.string().required(),

    date: Joi.date().required(),

    checkoutTime: Joi.date().required()
});