// import * as shipmentService from "./shipment.service.js";



// // =======================================
// // CREATE SHIPMENT
// // =======================================

// export const createShipment = async (req, res) => {

//     try {

//         const shipmentData = {

//             ...req.body,

//             user: req.user._id

//         };

//         const shipment = await shipmentService.createShipment(
//             shipmentData
//         );

//         res.status(201).json({

//             success: true,

//             message: "Shipment created successfully.",

//             shipment

//         });

//     }

//     catch (error) {

//         res.status(400).json({

//             success: false,

//             message: error.message

//         });

//     }

// };



// // =======================================
// // GET SHIPMENT BY ID
// // =======================================

// export const getShipmentById = async (req, res) => {

//     try {

//         const { id } = req.params;

//         const shipment = await shipmentService.getShipmentById(id);

//         res.status(200).json({

//             success: true,

//             shipment

//         });

//     }

//     catch (error) {

//         res.status(404).json({

//             success: false,

//             message: error.message

//         });

//     }

// };



// // =======================================
// // GET MY SHIPMENTS
// // =======================================

// export const getMyShipments = async (req, res) => {

//     try {

//         const shipments = await shipmentService.getUserShipments(
//             req.user._id
//         );

//         res.status(200).json({

//             success: true,

//             shipments

//         });

//     }

//     catch (error) {

//         res.status(400).json({

//             success: false,

//             message: error.message

//         });

//     }

// };



// // =======================================
// // GET ALL SHIPMENTS
// // ADMIN
// // =======================================

// export const getAllShipments = async (req, res) => {

//     try {

//         const shipments = await shipmentService.getAllShipments();

//         res.status(200).json({

//             success: true,

//             shipments

//         });

//     }

//     catch (error) {

//         res.status(400).json({

//             success: false,

//             message: error.message

//         });

//     }

// };



// // =======================================
// // UPDATE TRACKING DETAILS
// // =======================================

// export const updateTrackingDetails = async (req, res) => {

//     try {

//         const { id } = req.params;

//         const shipment = await shipmentService.updateTrackingDetails(

//             id,

//             req.body

//         );

//         res.status(200).json({

//             success: true,

//             message: "Tracking details updated successfully.",

//             shipment

//         });

//     }

//     catch (error) {

//         res.status(400).json({

//             success: false,

//             message: error.message

//         });

//     }

// };



// // =======================================
// // UPDATE SHIPMENT STATUS
// // =======================================

// export const updateShipmentStatus = async (req, res) => {

//     try {

//         const { id } = req.params;

//        const {
//     shipmentStatus,
//     location,
//     description
// } = req.body;

//       const shipment =
// await shipmentService.updateShipmentStatus(

//     id,

//     shipmentStatus,

//     {
//         location,
//         description,
//         updatedBy:req.user._id
//     }

// );
//         res.status(200).json({

//             success: true,

//             message: "Shipment status updated successfully.",

//             shipment

//         });

//     }

//     catch (error) {

//         res.status(400).json({

//             success: false,

//             message: error.message

//         });

//     }

// };



// // =======================================
// // DELETE SHIPMENT
// // =======================================

// export const deleteShipment = async (req, res) => {

//     try {

//         const { id } = req.params;

//         await shipmentService.deleteShipment(id);

//         res.status(200).json({

//             success: true,

//             message: "Shipment deleted successfully."

//         });

//     }

//     catch (error) {

//         res.status(400).json({

//             success: false,

//             message: error.message

//         });

//     }

// };

// export const getShipmentTracking = async(req,res)=>{

// try{

// const tracking =
// await ShipmentTracking.find({
// shipmentId:req.params.id
// })
// .sort({
// createdAt:1
// });


// res.json({
// success:true,
// tracking
// });


// }catch(error){

// res.status(400).json({
// success:false,
// message:error.message
// });

// }

// }




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

    } catch (error) {
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

        if (!shipment) {
            return res.status(404).json({
                success: false,
                message: "Shipment not found."
            });
        }

        res.status(200).json({
            success: true,
            shipment
        });

    } catch (error) {
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

    } catch (error) {
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

    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};


// =======================================
// GET SHIPMENT TRACKING
// =======================================

export const getShipmentTracking = async (req, res) => {
    try {
        const { id } = req.params;

        const shipment = await shipmentService.getShipmentById(id);

        if (!shipment) {
            return res.status(404).json({
                success: false,
                message: "Shipment not found."
            });
        }

        res.status(200).json({
            success: true,
            tracking: {
                shipmentId: shipment._id,
                courierPartner: shipment.courierPartner,
                trackingNumber: shipment.trackingNumber,
                trackingUrl: shipment.trackingUrl,
                shipmentStatus: shipment.shipmentStatus,
                dispatchDate: shipment.dispatchDate,
                expectedDeliveryDate: shipment.expectedDeliveryDate,
                deliveredAt: shipment.deliveredAt,
                updatedAt: shipment.updatedAt
            }
        });

    } catch (error) {
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
            req.body.courierPartner,
            req.body.trackingNumber,
            req.body.trackingUrl,
            req.body.dispatchDate,
            req.body.expectedDeliveryDate
        );

        if (!shipment) {
            return res.status(404).json({
                success: false,
                message: "Shipment not found."
            });
        }

        res.status(200).json({
            success: true,
            message: "Tracking details updated successfully.",
            shipment
        });

    } catch (error) {
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

        const {
            shipmentStatus,
            deliveredAt
        } = req.body;

        const shipment =
            await shipmentService.updateShipmentStatus(
                id,
                shipmentStatus,
                deliveredAt
            );

        if (!shipment) {
            return res.status(404).json({
                success: false,
                message: "Shipment not found."
            });
        }

        res.status(200).json({
            success: true,
            message: "Shipment status updated successfully.",
            shipment
        });

    } catch (error) {
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

        const shipment =
            await shipmentService.softDeleteShipment(id);

        if (!shipment) {
            return res.status(404).json({
                success: false,
                message: "Shipment not found."
            });
        }

        res.status(200).json({
            success: true,
            message: "Shipment deleted successfully."
        });

    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};