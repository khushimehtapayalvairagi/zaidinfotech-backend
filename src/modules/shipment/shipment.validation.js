import Joi from "joi";

import {
    SHIPMENT_FOR
} from "../../common/constants/shipmentFor.js";

import {
    SHIPMENT_STATUS
} from "../../common/constants/shipmentStatus.js";



// =======================================
// CREATE SHIPMENT VALIDATION
// =======================================

export const createShipmentValidation = Joi.object({

    shipmentFor: Joi.string()

        .valid(

            ...Object.values(SHIPMENT_FOR)

        )

        .required(),


    referenceId: Joi.string()

        .required(),


    courierPartner: Joi.string()

        .allow(""),


    trackingNumber: Joi.string()

        .allow(""),


    trackingUrl: Joi.string()

        .allow(""),


    dispatchDate: Joi.date()


        .optional(),


    expectedDeliveryDate: Joi.date()

        .optional(),


    notes: Joi.string()

        .allow("")

});



// =======================================
// UPDATE TRACKING VALIDATION
// =======================================

export const updateTrackingValidation = Joi.object({

    courierPartner: Joi.string()

        .required(),


    trackingNumber: Joi.string()

        .required(),


    trackingUrl: Joi.string()

        .allow(""),


    dispatchDate: Joi.date()

        .optional(),


    expectedDeliveryDate: Joi.date()

        .optional()

});



// =======================================
// UPDATE SHIPMENT STATUS VALIDATION
// =======================================

export const updateShipmentStatusValidation = Joi.object({

    shipmentStatus: Joi.string()

        .valid(

            ...Object.values(SHIPMENT_STATUS)

        )

        .required()

});



// =======================================
// DELETE SHIPMENT VALIDATION
// =======================================

export const deleteShipmentValidation = Joi.object({

    id: Joi.string()

        .required()

});