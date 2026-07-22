import * as shipmentRepository from "./shipment.repository.js";

import {
    SHIPMENT_STATUS
} from "../../common/constants/shipmentStatus.js";



// =======================================
// CREATE SHIPMENT
// =======================================

export const createShipment = async (shipmentData) => {

    // Check if shipment already exists
    const existingShipment =
    await shipmentRepository.getShipmentByReference(

        shipmentData.shipmentFor,

        shipmentData.referenceId

    );

    if(existingShipment){

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

    shipmentStatus

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

    return await shipmentRepository.updateShipmentStatus(

        shipmentId,

        shipmentStatus,

        deliveredAt

    );

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