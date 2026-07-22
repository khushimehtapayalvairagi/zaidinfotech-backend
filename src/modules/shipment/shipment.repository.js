import Shipment from "./shipment.model.js";



// =======================================
// CREATE SHIPMENT
// =======================================

export const createShipment = async (shipmentData) => {

    const shipment = new Shipment(shipmentData);

    return await shipment.save();

};



// =======================================
// GET SHIPMENT BY ID
// =======================================

export const getShipmentById = async (shipmentId) => {

    return await Shipment.findOne({

        _id: shipmentId,

        isDeleted: false

    })

    .populate("user", "firstName lastName email");

};



// =======================================
// GET SHIPMENT BY REFERENCE
// ORDER / REPAIR / RENTAL
// =======================================

export const getShipmentByReference = async (

    shipmentFor,

    referenceId

) => {

    return await Shipment.findOne({

        shipmentFor,

        referenceId,

        isDeleted: false

    });

};



// =======================================
// GET USER SHIPMENTS
// =======================================

export const getUserShipments = async (userId) => {

    return await Shipment.find({

        user: userId,

        isDeleted: false

    })

    .sort({

        createdAt: -1

    });

};



// =======================================
// GET ALL SHIPMENTS
// =======================================

export const getAllShipments = async () => {

    return await Shipment.find({

        isDeleted: false

    })

    .populate("user", "firstName lastName email")

    .sort({

        createdAt: -1

    });

};



// =======================================
// UPDATE TRACKING DETAILS
// =======================================

export const updateTrackingDetails = async (

    shipmentId,

    courierPartner,

    trackingNumber,

    trackingUrl,

    dispatchDate,

    expectedDeliveryDate

) => {

    return await Shipment.findByIdAndUpdate(

        shipmentId,

        {

            courierPartner,

            trackingNumber,

            trackingUrl,

            dispatchDate,

            expectedDeliveryDate

        },

        {

            new: true

        }

    );

};



// =======================================
// UPDATE SHIPMENT STATUS
// =======================================

export const updateShipmentStatus = async (

    shipmentId,

    shipmentStatus,

    deliveredAt = null

) => {

    const updateData = {

        shipmentStatus

    };

    if (deliveredAt) {

        updateData.deliveredAt = deliveredAt;

    }

    return await Shipment.findByIdAndUpdate(

        shipmentId,

        updateData,

        {

            new: true

        }

    );

};



// =======================================
// SOFT DELETE SHIPMENT
// =======================================

export const softDeleteShipment = async (shipmentId) => {

    return await Shipment.findByIdAndUpdate(

        shipmentId,

        {

            isDeleted: true

        },

        {

            new: true

        }

    );

};