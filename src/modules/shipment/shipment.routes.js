import express from "express";

import {

  createShipment,

  dispatchOrder,
   testBlueDart,

  getShipmentById,

  getMyShipments,

  getAllShipments,

  updateTrackingDetails,

  updateShipmentStatus,

  deleteShipment,

  getShipmentTracking

} from "./shipment.controller.js";


import {

  createShipmentValidation,

  dispatchOrderValidation,

  updateTrackingValidation,

  updateShipmentStatusValidation

} from "./shipment.validation.js";


import {
  validate
} from "../../common/middleware/validate.middleware.js";



import {
  verifyToken
} from "../../common/middleware/auth.middleware.js";


const router =
  express.Router();


// ======================================================
// DISPATCH ORDER THROUGH BLUE DART
// ======================================================

router.post(

  "/dispatch",

  verifyToken,

  validate(
    dispatchOrderValidation
  ),

  dispatchOrder

);

// =======================================
// TEST BLUE DART CONNECTION
// =======================================

router.get(
  "/blue-dart/test-connection",
  verifyToken,
  testBlueDart
);

// ======================================================
// GET MY SHIPMENTS
// ======================================================

router.get(

  "/my",

  verifyToken,

  getMyShipments

);


// ======================================================
// CREATE GENERIC SHIPMENT
// ======================================================

router.post(

  "/",

  verifyToken,

  validate(
    createShipmentValidation
  ),

  createShipment

);


// ======================================================
// GET ALL SHIPMENTS
// ======================================================

router.get(

  "/",

  verifyToken,

  getAllShipments

);


// ======================================================
// GET SHIPMENT TRACKING
// ======================================================

router.get(

  "/:id/tracking",

  verifyToken,

  getShipmentTracking

);


// ======================================================
// GET SHIPMENT BY ID
// ======================================================

router.get(

  "/:id",

  verifyToken,

  getShipmentById

);


// ======================================================
// UPDATE TRACKING DETAILS
// ======================================================

router.put(

  "/tracking/:id",

  verifyToken,

  validate(
    updateTrackingValidation
  ),

  updateTrackingDetails

);


// ======================================================
// UPDATE SHIPMENT STATUS
// ======================================================

router.patch(

  "/status/:id",

  verifyToken,

  validate(
    updateShipmentStatusValidation
  ),

  updateShipmentStatus

);


// ======================================================
// DELETE SHIPMENT
// ======================================================

router.delete(

  "/:id",

  verifyToken,

  deleteShipment

);


export default router;