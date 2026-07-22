import * as shipmentService from "./shipment.service.js";



// =======================================
// CREATE SHIPMENT
// =======================================

export const createShipment = async (req, res) => {

    try {

        const shipmentData = {

            ...req.body,

            user: req.user._id

        };

        const shipment = await shipmentService.createShipment(
            shipmentData
        );

        res.status(201).json({

            success: true,

            message: "Shipment created successfully.",

            shipment

        });

    }

    catch (error) {

        res.status(400).json({

            success: false,

            message: error.message

        });

    }

};



// =======================================
// GET SHIPMENT BY ID
// =======================================

export const getShipmentById = async (req, res) => {

    try {

        const { id } = req.params;

        const shipment = await shipmentService.getShipmentById(id);

        res.status(200).json({

            success: true,

            shipment

        });

    }

    catch (error) {

        res.status(404).json({

            success: false,

            message: error.message

        });

    }

};



// =======================================
// GET MY SHIPMENTS
// =======================================

export const getMyShipments = async (req, res) => {

    try {

        const shipments = await shipmentService.getUserShipments(
            req.user._id
        );

        res.status(200).json({

            success: true,

            shipments

        });

    }

    catch (error) {

        res.status(400).json({

            success: false,

            message: error.message

        });

    }

};



// =======================================
// GET ALL SHIPMENTS
// ADMIN
// =======================================

export const getAllShipments = async (req, res) => {

    try {

        const shipments = await shipmentService.getAllShipments();

        res.status(200).json({

            success: true,

            shipments

        });

    }

    catch (error) {

        res.status(400).json({

            success: false,

            message: error.message

        });

    }

};



// =======================================
// UPDATE TRACKING DETAILS
// =======================================

export const updateTrackingDetails = async (req, res) => {

    try {

        const { id } = req.params;

        const shipment = await shipmentService.updateTrackingDetails(

            id,

            req.body

        );

        res.status(200).json({

            success: true,

            message: "Tracking details updated successfully.",

            shipment

        });

    }

    catch (error) {

        res.status(400).json({

            success: false,

            message: error.message

        });

    }

};



// =======================================
// UPDATE SHIPMENT STATUS
// =======================================

export const updateShipmentStatus = async (req, res) => {

    try {

        const { id } = req.params;

        const { shipmentStatus } = req.body;

        const shipment = await shipmentService.updateShipmentStatus(

            id,

            shipmentStatus

        );

        res.status(200).json({

            success: true,

            message: "Shipment status updated successfully.",

            shipment

        });

    }

    catch (error) {

        res.status(400).json({

            success: false,

            message: error.message

        });

    }

};



// =======================================
// DELETE SHIPMENT
// =======================================

export const deleteShipment = async (req, res) => {

    try {

        const { id } = req.params;

        await shipmentService.deleteShipment(id);

        res.status(200).json({

            success: true,

            message: "Shipment deleted successfully."

        });

    }

    catch (error) {

        res.status(400).json({

            success: false,

            message: error.message

        });

    }

};