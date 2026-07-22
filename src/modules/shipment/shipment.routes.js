
import express from "express";

import {

    createShipment,

    getShipmentById,

    getMyShipments,

    getAllShipments,

    updateTrackingDetails,

    updateShipmentStatus,

    deleteShipment

} from "./shipment.controller.js";

import {

    createShipmentValidation,

    updateTrackingValidation,

    updateShipmentStatusValidation

} from "./shipment.validation.js";

import { validate } from "../../common/middleware/validate.middleware.js";


import { verifyToken } from "../../common/middleware/auth.middleware.js";

const router = express.Router();



// =======================================
// CREATE SHIPMENT
// =======================================

router.post(

    "/",

    verifyToken,

    validate(createShipmentValidation),

    createShipment

);



// =======================================
// GET MY SHIPMENTS
// =======================================

router.get(

    "/my",

    validate,

    getMyShipments

);



// =======================================
// GET ALL SHIPMENTS
// =======================================

router.get(

    "/",

    verifyToken,

    getAllShipments

);



// =======================================
// GET SHIPMENT BY ID
// =======================================

router.get(

    "/:id",

    verifyToken,

    getShipmentById

);



// =======================================
// UPDATE TRACKING DETAILS
// =======================================

router.put(

    "/tracking/:id",

    verifyToken,

    validate(updateTrackingValidation),

    updateTrackingDetails

);



// =======================================
// UPDATE SHIPMENT STATUS
// =======================================

router.patch(

    "/status/:id",

    verifyToken,

    validate(updateShipmentStatusValidation),

    updateShipmentStatus

);



// =======================================
// DELETE SHIPMENT
// =======================================

router.delete(

    "/:id",

    verifyToken,

    deleteShipment

);

export default router;