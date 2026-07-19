import Joi from "joi";

import {
    ORDER_STATUS
} from "../../common/constants/orderStatus.js";



// =======================================
// CREATE ORDER VALIDATION
// =======================================

export const createOrderValidation = Joi.object({


    orderItems:Joi.array()

    .items(

        Joi.object({

            product:Joi.string()
            .required(),


            title:Joi.string()
            .required(),


            quantity:Joi.number()
            .min(1)
            .required(),


            price:Joi.number()
            .required(),


            imageUrl:Joi.string()
            .allow("")

        })

    )

    .min(1)

    .required(),




    shippingAddress:Joi.object({

        fullName:Joi.string()
        .required(),


        phone:Joi.string()
        .required(),


        addressLine:Joi.string()
        .required(),


        city:Joi.string()
        .required(),


        state:Joi.string()
        .required(),


        pincode:Joi.string()
        .required(),


        country:Joi.string()
        .allow(""),


        landmark:Joi.string()
        .allow("")


    })

    .required(),




    totalAmount:Joi.number()

    .required()



});





// =======================================
// UPDATE ORDER STATUS VALIDATION
// =======================================

export const updateOrderStatusValidation = Joi.object({


    status:Joi.string()

    .valid(

        ...Object.values(
            ORDER_STATUS
        )

    )

    .required()


});





// =======================================
// UPDATE PAYMENT STATUS VALIDATION
// =======================================

export const updatePaymentStatusValidation = Joi.object({


    paymentStatus:Joi.string()

    .valid(

        "PENDING",
        "PAID",
        "FAILED",
        "REFUNDED"

    )

    .required(),



    paymentId:Joi.string()

    .allow("")


});