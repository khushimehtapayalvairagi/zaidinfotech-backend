import * as shipmentRepository from "./shipment.repository.js";

import {
    SHIPMENT_STATUS
} from "../../common/constants/shipmentStatus.js";

import ShipmentTracking from "./shipmentTracking.model.js";
import Order from "../orders/order.model.js";
import {
  generateBlueDartWaybill
} from "./blueDart.service.js";


import {
  testBlueDartConnection
} from "./blueDart.service.js";
// =======================================
// CREATE GENERIC SHIPMENT
// =======================================

export const createShipment = async (
  shipmentData
) => {

  const existingShipment =
    await shipmentRepository.getShipmentByReference(

      shipmentData.shipmentFor,

      shipmentData.referenceId

    );


  if (existingShipment) {

    throw new Error(
      "Shipment already exists for this reference."
    );

  }


  return await shipmentRepository.createShipment(
    shipmentData
  );

};



// =======================================
// GET SHIPMENT BY ID
// =======================================

export const getShipmentById = async (shipmentId) => {

    const shipment =
    await shipmentRepository.getShipmentById(
        shipmentId
    );

    if(!shipment){

        throw new Error(
            "Shipment not found."
        );

    }

    return shipment;

};



// =======================================
// GET SHIPMENT BY REFERENCE
// =======================================

export const getShipmentByReference = async (

    shipmentFor,

    referenceId

) => {

    return await shipmentRepository.getShipmentByReference(

        shipmentFor,

        referenceId

    );

};



// =======================================
// GET USER SHIPMENTS
// =======================================

export const getUserShipments = async (userId) => {

    return await shipmentRepository.getUserShipments(
        userId
    );

};



// =======================================
// GET ALL SHIPMENTS
// =======================================

export const getAllShipments = async () => {

    return await shipmentRepository.getAllShipments();

};



// =======================================
// UPDATE TRACKING DETAILS
// =======================================

export const updateTrackingDetails = async (

    shipmentId,

    trackingData

) => {

    const shipment =
    await shipmentRepository.getShipmentById(
        shipmentId
    );

    if(!shipment){

        throw new Error(
            "Shipment not found."
        );

    }

    return await shipmentRepository.updateTrackingDetails(

        shipmentId,

        trackingData.courierPartner,

        trackingData.trackingNumber,

        trackingData.trackingUrl,

        trackingData.dispatchDate,

        trackingData.expectedDeliveryDate

    );

};



// =======================================
// UPDATE SHIPMENT STATUS
// =======================================

export const updateShipmentStatus = async (
    shipmentId,
    shipmentStatus,
    trackingInfo={}
) => {


const shipment =
await shipmentRepository.getShipmentById(
    shipmentId
);


if(!shipment){

    throw new Error(
        "Shipment not found."
    );

}



let deliveredAt = null;


if(
    shipmentStatus === SHIPMENT_STATUS.DELIVERED
){

    deliveredAt = new Date();

}



// 1. Update Current Shipment Status

const updatedShipment =
await shipmentRepository.updateShipmentStatus(

    shipmentId,

    shipmentStatus,

    deliveredAt

);




// 2. Save Tracking History

await ShipmentTracking.create({

    shipmentId: shipmentId,

    status: shipmentStatus,

    location:
    trackingInfo.location || "",

    description:
    trackingInfo.description || "",

    updatedBy:
    trackingInfo.updatedBy || null

});



return updatedShipment;


};



// =======================================
// DELETE SHIPMENT
// =======================================

export const deleteShipment = async (shipmentId) => {

    const shipment =
    await shipmentRepository.getShipmentById(
        shipmentId
    );

    if(!shipment){

        throw new Error(
            "Shipment not found."
        );

    }

    return await shipmentRepository.softDeleteShipment(
        shipmentId
    );

};



// =======================================
// DISPATCH ORDER THROUGH BLUE DART
// =======================================

export const dispatchOrder = async ({
  orderId,
  blueDartProduct,
  packageDetails,
  dispatchedBy
}) => {

  // =========================================
  // VALIDATE ORDER ID
  // =========================================

  if (!orderId) {

    throw new Error(
      "Order ID is required."
    );

  }


  // =========================================
  // FIND ORDER
  // =========================================

  const order =
    await Order.findById(orderId)
      .populate(
        "user",
        "firstName lastName email phone"
      );


  if (!order) {

    throw new Error(
      "Order not found."
    );

  }


  // =========================================
  // ORDER STATUS CHECK
  // =========================================

  if (
    order.orderStatus === "CANCELLED"
  ) {

    throw new Error(
      "Cancelled order cannot be dispatched."
    );

  }


  if (
    order.orderStatus === "SHIPPED" ||
    order.orderStatus === "DELIVERED"
  ) {

    throw new Error(
      "This order has already been dispatched."
    );

  }


  // =========================================
  // ORDER TYPE CHECK
  // =========================================

  if (
    !["B2B", "B2C"].includes(
      order.orderType
    )
  ) {

    throw new Error(
      "Order type is not configured properly."
    );

  }


  // =========================================
  // BLUE DART PRODUCT VALIDATION
  // =========================================

  const validProducts = {

    B2B: [
      "APEX",
      "SURFACE"
    ],

    B2C: [
      "ECOM_AIR",
      "ECOM_LITE_SURFACE"
    ]

  };


  if (!blueDartProduct) {

    throw new Error(
      `Blue Dart product is required for ${order.orderType} order.`
    );

  }


  if (
    !validProducts[
      order.orderType
    ].includes(
      blueDartProduct
    )
  ) {

    throw new Error(

      `Invalid Blue Dart product ${blueDartProduct} for ${order.orderType} order.`

    );

  }


  // =========================================
  // PACKAGE VALIDATION
  // =========================================

  if (!packageDetails) {

    throw new Error(
      "Package details are required."
    );

  }


  const pieceCount =
    Number(
      packageDetails.pieceCount || 1
    );


  const actualWeight =
    Number(
      packageDetails.actualWeight || 0
    );


  if (
    !Number.isInteger(pieceCount) ||
    pieceCount < 1
  ) {

    throw new Error(
      "Piece count must be at least 1."
    );

  }


  if (
    !Number.isFinite(actualWeight) ||
    actualWeight <= 0
  ) {

    throw new Error(
      "Valid package weight is required."
    );

  }


  // =========================================
  // CHECK EXISTING SHIPMENT
  // =========================================

  const existingShipment =
    await shipmentRepository.getShipmentByReference(
      "ORDER",
      orderId
    );


  if (existingShipment) {

    if (
      existingShipment.trackingNumber
    ) {

      throw new Error(
        `Order is already dispatched. AWB: ${existingShipment.trackingNumber}`
      );

    }


    throw new Error(
      "Shipment already exists for this order."
    );

  }


  // =========================================
  // CALL BLUE DART
  // =========================================

  const blueDartResponse =
    await generateBlueDartWaybill({

      order,

      shippingAddress:
        order.shippingAddress,

      customer:
        order.user,

      blueDartProduct,

      packageDetails

    });


  // =========================================
  // CREATE SHIPMENT
  // =========================================

  const shipmentData = {

    user:
      order.user._id,

    shipmentFor:
      "ORDER",

    referenceId:
      order._id,

    blueDartProduct,

    packageDetails,

    courierPartner:
      "BLUE_DART",

    trackingNumber:
      blueDartResponse.awbNumber,

    trackingUrl:
      "",

    shipmentStatus:
      "SHIPPED",

    dispatchDate:
      new Date(),

    notes:
      `Dispatched by user ${dispatchedBy}`

  };


  const shipment =
    await shipmentRepository.createShipment(
      shipmentData
    );


  // =========================================
  // UPDATE ORDER TRACKING
  // =========================================

  order.orderStatus =
    "SHIPPED";


  if (
    !order.tracking
  ) {

    order.tracking = {

      history: [],

      courierName:
        "BLUE_DART",

      trackingNumber:
        blueDartResponse.awbNumber,

      trackingUrl:
        "",

      expectedDeliveryDate:
        null

    };

  } else {

    order.tracking.courierName =
      "BLUE_DART";

    order.tracking.trackingNumber =
      blueDartResponse.awbNumber;

    order.tracking.trackingUrl =
      "";

  }


  if (
    !order.tracking.history
  ) {

    order.tracking.history =
      [];

  }


  order.tracking.history.push({

    status:
      "SHIPPED",

    message:
      `Order dispatched through Blue Dart. AWB: ${blueDartResponse.awbNumber}`,

    updatedBy:
      dispatchedBy,

    createdAt:
      new Date()

  });


  await order.save();



  await ShipmentTracking.create({

    shipmentId:
      shipment._id,

    status:
      "SHIPPED",

    location:
      "",

    description:
      `Blue Dart shipment created. AWB: ${blueDartResponse.awbNumber}`,

    updatedBy:
      dispatchedBy

  });


  // =========================================
  // RETURN
  // =========================================

  return {

    shipment,

    order,

    blueDart: {

      awbNumber:
        blueDartResponse.awbNumber,

      destinationArea:
        blueDartResponse.destinationArea,

      destinationLocation:
        blueDartResponse.destinationLocation

    }

  };

};