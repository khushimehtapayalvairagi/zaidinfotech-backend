import Joi from "joi";

import {
  SHIPMENT_FOR
} from "../../common/constants/shipmentFor.js";

import {
  SHIPMENT_STATUS
} from "../../common/constants/shipmentStatus.js";

import {
  BLUEDART_PRODUCT
} from "../../common/constants/blueDartProduct.js";


// ======================================================
// CREATE GENERIC SHIPMENT VALIDATION
// ======================================================

export const createShipmentValidation = Joi.object({

  shipmentFor: Joi.string()
    .valid(
      ...Object.values(SHIPMENT_FOR)
    )
    .required(),

  referenceId: Joi.string()
    .required(),

  blueDartProduct: Joi.string()
    .valid(
      ...Object.values(BLUEDART_PRODUCT)
    )
    .allow(null, "")
    .optional(),

  courierPartner: Joi.string()
    .allow("")
    .optional(),

  trackingNumber: Joi.string()
    .allow("")
    .optional(),

  trackingUrl: Joi.string()
    .allow("")
    .optional(),

  packageDetails: Joi.object({

    pieceCount: Joi.number()
      .integer()
      .min(1)
      .default(1),

    actualWeight: Joi.number()
      .positive()
      .required(),

    length: Joi.number()
      .positive()
      .allow(null)
      .optional(),

    breadth: Joi.number()
      .positive()
      .allow(null)
      .optional(),

    height: Joi.number()
      .positive()
      .allow(null)
      .optional()

  })
    .optional(),

  dispatchDate: Joi.date()
    .optional(),

  expectedDeliveryDate: Joi.date()
    .optional(),

  notes: Joi.string()
    .allow("")
    .optional()

});


// ======================================================
// DISPATCH ORDER VALIDATION
// ======================================================

export const dispatchOrderValidation = Joi.object({

  orderId: Joi.string()
    .required(),

  blueDartProduct: Joi.string()
    .valid(
      ...Object.values(BLUEDART_PRODUCT)
    )
    .required(),

  packageDetails: Joi.object({

    pieceCount: Joi.number()
      .integer()
      .min(1)
      .default(1),

    actualWeight: Joi.number()
      .positive()
      .required(),

    length: Joi.number()
      .positive()
      .allow(null)
      .optional(),

    breadth: Joi.number()
      .positive()
      .allow(null)
      .optional(),

    height: Joi.number()
      .positive()
      .allow(null)
      .optional()

  })
    .required()

});


// ======================================================
// UPDATE TRACKING VALIDATION
// ======================================================

export const updateTrackingValidation = Joi.object({

  courierPartner: Joi.string()
    .required(),

  trackingNumber: Joi.string()
    .required(),

  trackingUrl: Joi.string()
    .allow("")
    .optional(),

  dispatchDate: Joi.date()
    .optional(),

  expectedDeliveryDate: Joi.date()
    .optional()

});


// ======================================================
// UPDATE SHIPMENT STATUS VALIDATION
// ======================================================

export const updateShipmentStatusValidation = Joi.object({

  shipmentStatus: Joi.string()
    .valid(
      ...Object.values(SHIPMENT_STATUS)
    )
    .required(),

  location: Joi.string()
    .allow("")
    .optional(),

  description: Joi.string()
    .allow("")
    .optional()

});


// ======================================================
// DELETE SHIPMENT VALIDATION
// ======================================================

export const deleteShipmentValidation = Joi.object({

  id: Joi.string()
    .required()

});