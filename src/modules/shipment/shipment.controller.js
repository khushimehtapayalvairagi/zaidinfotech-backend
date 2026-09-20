import * as shipmentService
  from "./shipment.service.js";

import {
    generateBlueDartWaybill,
    testBlueDartConnection
} from "./blueDart.service.js";
// ======================================================
// CREATE SHIPMENT
// ======================================================

export const createShipment = async (
  req,
  res
) => {

  try {

    const {

      shipmentFor,

      referenceId,

      blueDartProduct,

      courierPartner,

      trackingNumber,

      trackingUrl,

      dispatchDate,

      expectedDeliveryDate,

      notes,

      packageDetails

    } = req.body;


    const shipmentData = {

      shipmentFor,

      referenceId,

      blueDartProduct,

      courierPartner,

      trackingNumber,

      trackingUrl,

      dispatchDate,

      expectedDeliveryDate,

      notes,

      packageDetails,

      user:
        req.user._id

    };


    const shipment =
      await shipmentService.createShipment(
        shipmentData
      );


    return res.status(201).json({

      success: true,

      message:
        "Shipment created successfully.",

      shipment

    });

  }
  catch (error) {

    console.error(
      "CREATE SHIPMENT ERROR:",
      error
    );


    return res.status(400).json({

      success: false,

      message:
        error.message

    });

  }

};


// ======================================================
// DISPATCH ORDER
// BLUE DART
// ======================================================

export const dispatchOrder = async (
  req,
  res
) => {

  try {

    const {

      orderId,

      blueDartProduct,

      packageDetails

    } = req.body;


    const result =
      await shipmentService.dispatchOrder({

        orderId,

        blueDartProduct,

        packageDetails,

        dispatchedBy:
          req.user._id

      });


    return res.status(201).json({

      success: true,

      message:
        "Order dispatched successfully through Blue Dart.",

      shipment:
        result.shipment,

      order:
        result.order,

      blueDart:
        result.blueDart

    });

  }
  catch (error) {

    console.error(
      "DISPATCH ORDER ERROR:",
      error
    );


    return res.status(400).json({

      success: false,

      message:
        error.message

    });

  }

};


// ======================================================
// GET SHIPMENT BY ID
// ======================================================

export const getShipmentById = async (
  req,
  res
) => {

  try {

    const {
      id
    } = req.params;


    const shipment =
      await shipmentService.getShipmentById(
        id
      );


    return res.status(200).json({

      success: true,

      shipment

    });

  }
  catch (error) {

    return res.status(404).json({

      success: false,

      message:
        error.message

    });

  }

};


// ======================================================
// GET MY SHIPMENTS
// ======================================================

export const getMyShipments = async (
  req,
  res
) => {

  try {

    const shipments =
      await shipmentService.getUserShipments(
        req.user._id
      );


    return res.status(200).json({

      success: true,

      shipments

    });

  }
  catch (error) {

    return res.status(400).json({

      success: false,

      message:
        error.message

    });

  }

};


// ======================================================
// GET ALL SHIPMENTS
// ======================================================

export const getAllShipments = async (
  req,
  res
) => {

  try {

    const shipments =
      await shipmentService.getAllShipments();


    return res.status(200).json({

      success: true,

      shipments

    });

  }
  catch (error) {

    return res.status(400).json({

      success: false,

      message:
        error.message

    });

  }

};


// ======================================================
// GET SHIPMENT TRACKING
// ======================================================

export const getShipmentTracking = async (
  req,
  res
) => {

  try {

    const {
      id
    } = req.params;


    const shipment =
      await shipmentService.getShipmentById(
        id
      );


    return res.status(200).json({

      success: true,

      tracking: {

        shipmentId:
          shipment._id,

        courierPartner:
          shipment.courierPartner,

        blueDartProduct:
          shipment.blueDartProduct,

        trackingNumber:
          shipment.trackingNumber,

        trackingUrl:
          shipment.trackingUrl,

        shipmentStatus:
          shipment.shipmentStatus,

        dispatchDate:
          shipment.dispatchDate,

        expectedDeliveryDate:
          shipment.expectedDeliveryDate,

        deliveredAt:
          shipment.deliveredAt,

        updatedAt:
          shipment.updatedAt

      }

    });

  }
  catch (error) {

    return res.status(400).json({

      success: false,

      message:
        error.message

    });

  }

};


// ======================================================
// UPDATE TRACKING
// ======================================================

export const updateTrackingDetails = async (
  req,
  res
) => {

  try {

    const {
      id
    } = req.params;


    const shipment =
      await shipmentService.updateTrackingDetails(

        id,

        req.body

      );


    return res.status(200).json({

      success: true,

      message:
        "Tracking details updated successfully.",

      shipment

    });

  }
  catch (error) {

    return res.status(400).json({

      success: false,

      message:
        error.message

    });

  }

};


// ======================================================
// UPDATE SHIPMENT STATUS
// ======================================================

export const updateShipmentStatus = async (
  req,
  res
) => {

  try {

    const {
      id
    } = req.params;


    const {

      shipmentStatus,

      location,

      description

    } = req.body;


    const shipment =
      await shipmentService.updateShipmentStatus(

        id,

        shipmentStatus,

        {

          location,

          description,

          updatedBy:
            req.user._id

        }

      );


    return res.status(200).json({

      success: true,

      message:
        "Shipment status updated successfully.",

      shipment

    });

  }
  catch (error) {

    return res.status(400).json({

      success: false,

      message:
        error.message

    });

  }

};


// ======================================================
// DELETE SHIPMENT
// ======================================================

export const deleteShipment = async (
  req,
  res
) => {

  try {

    const {
      id
    } = req.params;


    await shipmentService.deleteShipment(
      id
    );


    return res.status(200).json({

      success: true,

      message:
        "Shipment deleted successfully."

    });

  }
  catch (error) {

    return res.status(400).json({

      success: false,

      message:
        error.message

    });

  }

};


// =======================================
// TEST BLUE DART CONNECTION
// =======================================

export const testBlueDart = async (
  req,
  res
) => {

  try {

    const result =
      await testBlueDartConnection();

    return res.status(200).json({

      success: true,

      message:
        result.message,

      methods:
        result.methods

    });

  } catch (error) {

    console.error(
      "BLUE DART CONNECTION TEST ERROR:",
      error
    );

    return res.status(400).json({

      success: false,

      message:
        error.message

    });

  }

};