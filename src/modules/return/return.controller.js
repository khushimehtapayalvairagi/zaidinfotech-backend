import {
    createReturnService,
    getReturnService,
    getReturnsService,
    getMyReturnsService,
    getReturnsByOrderService,
    approveReturnService,
    rejectReturnService,
    markPickupRequestedService,
    markPickedUpService,
    receiveReturnService,
    inspectReturnService,
    completeReturnService,
    cancelReturnService
} from "./return.service.js";


// ======================================================
// CREATE RETURN
// ======================================================

export const createReturnController =
    async (req, res) => {

        try {

            const result =
                await createReturnService(
                    req.body,
                    req.user._id
                );


            return res.status(201).json({

                success: true,

                message:
                    "Return request created successfully",

                data: result

            });

        } catch (error) {

            return res.status(400).json({

                success: false,

                message:
                    error.message

            });

        }

    };


// ======================================================
// GET ALL RETURNS
// ======================================================

export const getReturnsController =
    async (req, res) => {

        try {

            const result =
                await getReturnsService(
                    req.query
                );


            return res.status(200).json({

                success: true,

                count: result.length,

                data: result

            });

        } catch (error) {

            return res.status(500).json({

                success: false,

                message:
                    error.message

            });

        }

    };


// ======================================================
// GET MY RETURNS
// ======================================================

export const getMyReturnsController =
    async (req, res) => {

        try {

            const result =
                await getMyReturnsService(
                    req.user._id
                );


            return res.status(200).json({

                success: true,

                count: result.length,

                data: result

            });

        } catch (error) {

            return res.status(500).json({

                success: false,

                message:
                    error.message

            });

        }

    };


// ======================================================
// GET SINGLE RETURN
// ======================================================

export const getReturnController =
    async (req, res) => {

        try {

            const result =
                await getReturnService(
                    req.params.id
                );


            return res.status(200).json({

                success: true,

                data: result

            });

        } catch (error) {

            return res.status(404).json({

                success: false,

                message:
                    error.message

            });

        }

    };


// ======================================================
// GET RETURNS BY ORDER
// ======================================================

export const getReturnsByOrderController =
    async (req, res) => {

        try {

            const result =
                await getReturnsByOrderService(
                    req.params.orderId,
                    req.user._id
                );


            return res.status(200).json({

                success: true,

                count: result.length,

                data: result

            });

        } catch (error) {

            return res.status(400).json({

                success: false,

                message:
                    error.message

            });

        }

    };


// ======================================================
// APPROVE
// ======================================================

export const approveReturnController =
    async (req, res) => {

        try {

            const result =
                await approveReturnService(
                    req.params.id,
                    req.user._id
                );


            return res.status(200).json({

                success: true,

                message:
                    "Return approved successfully",

                data: result

            });

        } catch (error) {

            return res.status(400).json({

                success: false,

                message:
                    error.message

            });

        }

    };


// ======================================================
// REJECT
// ======================================================

export const rejectReturnController =
    async (req, res) => {

        try {

            const result =
                await rejectReturnService(
                    req.params.id,
                    req.user._id,
                    req.body.rejectionReason
                );


            return res.status(200).json({

                success: true,

                message:
                    "Return rejected successfully",

                data: result

            });

        } catch (error) {

            return res.status(400).json({

                success: false,

                message:
                    error.message

            });

        }

    };


// ======================================================
// PICKUP REQUESTED
// ======================================================

export const markPickupRequestedController =
    async (req, res) => {

        try {

            const result =
                await markPickupRequestedService(
                    req.params.id,
                    req.user._id
                );


            return res.status(200).json({

                success: true,

                message:
                    "Pickup request created successfully",

                data: result

            });

        } catch (error) {

            return res.status(400).json({

                success: false,

                message:
                    error.message

            });

        }

    };


// ======================================================
// PICKED UP
// ======================================================

export const markPickedUpController =
    async (req, res) => {

        try {

            const result =
                await markPickedUpService(
                    req.params.id,
                    req.user._id,
                    req.body.trackingNumber
                );


            return res.status(200).json({

                success: true,

                message:
                    "Return pickup marked successfully",

                data: result

            });

        } catch (error) {

            return res.status(400).json({

                success: false,

                message:
                    error.message

            });

        }

    };


// ======================================================
// RECEIVE
// ======================================================

export const receiveReturnController =
    async (req, res) => {

        try {

            const result =
                await receiveReturnService(
                    req.params.id,
                    req.user._id
                );


            return res.status(200).json({

                success: true,

                message:
                    "Return received successfully",

                data: result

            });

        } catch (error) {

            return res.status(400).json({

                success: false,

                message:
                    error.message

            });

        }

    };


// ======================================================
// INSPECT
// ======================================================

export const inspectReturnController =
    async (req, res) => {

        try {

            const result =
                await inspectReturnService(
                    req.params.id,
                    req.user._id,
                    req.body.items
                );


            return res.status(200).json({

                success: true,

                message:
                    "Return inspection completed",

                data: result

            });

        } catch (error) {

            return res.status(400).json({

                success: false,

                message:
                    error.message

            });

        }

    };


// ======================================================
// COMPLETE
// ======================================================

export const completeReturnController =
    async (req, res) => {

        try {

            const result =
                await completeReturnService(
                    req.params.id,
                    req.user._id
                );


            return res.status(200).json({

                success: true,

                message:
                    "Return completed successfully",

                data: result

            });

        } catch (error) {

            return res.status(400).json({

                success: false,

                message:
                    error.message

            });

        }

    };


// ======================================================
// CANCEL
// ======================================================

export const cancelReturnController =
    async (req, res) => {

        try {

            const result =
                await cancelReturnService(
                    req.params.id,
                    req.user._id
                );


            return res.status(200).json({

                success: true,

                message:
                    "Return cancelled successfully",

                data: result

            });

        } catch (error) {

            return res.status(400).json({

                success: false,

                message:
                    error.message

            });

        }

    };