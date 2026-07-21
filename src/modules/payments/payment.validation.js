import Joi from "joi";


import {

    PAYMENT_FOR

} from "../../common/constants/paymentFor.js";


import {

    PAYMENT_METHOD

} from "../../common/constants/paymentMethod.js";


import {

    PAYMENT_STATUS

} from "../../common/constants/paymentStatus.js";





// =======================================
// CREATE PAYMENT VALIDATION
// =======================================

export const createPaymentValidation = Joi.object({


    paymentFor:Joi.string()

    .valid(

        ...Object.values(PAYMENT_FOR)

    )

    .required(),




    referenceId:Joi.string()

    .required(),




    amount:Joi.number()

    .min(0)

    .required(),




    paymentMethod:Joi.string()

    .valid(

        ...Object.values(PAYMENT_METHOD)

    )

    .required()



});







// =======================================
// PAYMENT SUCCESS VALIDATION
// =======================================

export const paymentSuccessValidation = Joi.object({


    transactionId:Joi.string()

    .allow(""),




    gatewayResponse:Joi.object()

    .default({})



});







// =======================================
// PAYMENT FAILED VALIDATION
// =======================================

export const paymentFailedValidation = Joi.object({


    reason:Joi.string()

    .allow("")



});







// =======================================
// REFUND VALIDATION
// =======================================

export const refundPaymentValidation = Joi.object({


    reason:Joi.string()

    .allow("")



});