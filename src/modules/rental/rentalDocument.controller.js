import Rental from "./rental.model.js";

import {
    uploadRentalDocumentService,
    getRentalDocumentsService,
    verifyRentalDocumentService
} from "./rentalDocument.service.js";


// ============================================================
// UPLOAD RENTAL DOCUMENT
// ============================================================

export const uploadRentalDocumentController =
    async (req, res) => {

        try {

            console.log(
                "========================================"
            );

            console.log(
                "UPLOAD RENTAL DOCUMENT CONTROLLER"
            );

            console.log(
                "PARAMS:",
                req.params
            );

            console.log(
                "BODY:",
                req.body
            );

            console.log(
                "FILE:",
                req.file
            );

            console.log(
                "USER:",
                req.user?._id,
                req.user?.role
            );

            console.log(
                "CONTENT-TYPE:",
                req.headers["content-type"]
            );

            console.log(
                "========================================"
            );


            // ------------------------------------------------
            // Rental ID
            // ------------------------------------------------

            const { rentalId } =
                req.params;

            if (!rentalId) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Rental ID is required"
                });
            }


            // ------------------------------------------------
            // User
            // ------------------------------------------------

            if (!req.user?._id) {
                return res.status(401).json({
                    success: false,
                    message:
                        "Authentication required"
                });
            }


            // ------------------------------------------------
            // File
            // ------------------------------------------------

            if (!req.file) {

                return res.status(400).json({
                    success: false,
                    message:
                        "Please upload a document"
                });
            }


            // ------------------------------------------------
            // Rental exists?
            // ------------------------------------------------

            const rental =
                await Rental.findById(
                    rentalId
                );

            if (!rental) {

                return res.status(404).json({
                    success: false,
                    message:
                        "Rental not found"
                });
            }


            // ------------------------------------------------
            // IMPORTANT
            //
            // Do NOT check:
            //
            // customerId: req.user._id
            //
            // because WALK_IN rental has
            // customerId = null.
            // ------------------------------------------------


            // ------------------------------------------------
            // Upload service
            // ------------------------------------------------

            const document =
                await uploadRentalDocumentService(
                    rentalId,
                    req.user._id,
                    req.body,
                    req.file
                );


            // ------------------------------------------------
            // Response
            // ------------------------------------------------

            return res.status(201).json({

                success: true,

                message:
                    "Rental document uploaded successfully",

                data: document
            });

        } catch (error) {

            console.error(
                "========================================"
            );

            console.error(
                "UPLOAD RENTAL DOCUMENT ERROR"
            );

            console.error(
                error
            );

            console.error(
                "========================================"
            );

            return res.status(400).json({

                success: false,

                message:
                    error?.message ||
                    "Failed to upload rental document"
            });
        }
    };


// ============================================================
// GET RENTAL DOCUMENTS
// ============================================================

export const getRentalDocumentsController =
    async (req, res) => {

        try {

            const { rentalId } =
                req.params;

            if (!rentalId) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Rental ID is required"
                });
            }


            const rental =
                await Rental.findById(
                    rentalId
                );

            if (!rental) {
                return res.status(404).json({
                    success: false,
                    message:
                        "Rental not found"
                });
            }


            const documents =
                await getRentalDocumentsService(
                    rentalId
                );


            return res.status(200).json({

                success: true,

                message:
                    "Rental documents fetched successfully",

                data: documents
            });

        } catch (error) {

            console.error(
                "GET RENTAL DOCUMENTS ERROR:",
                error
            );

            return res.status(400).json({

                success: false,

                message:
                    error?.message ||
                    "Failed to fetch rental documents"
            });
        }
    };


// ============================================================
// VERIFY RENTAL DOCUMENT
// ============================================================

export const verifyRentalDocumentController =
    async (req, res) => {

        try {

            const { documentId } =
                req.params;


            if (!documentId) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Document ID is required"
                });
            }


            if (!req.user?._id) {
                return res.status(401).json({
                    success: false,
                    message:
                        "Authentication required"
                });
            }


            const document =
                await verifyRentalDocumentService(
                    documentId,
                    req.user._id,
                    req.body
                );


            return res.status(200).json({

                success: true,

                message:
                    "Rental document verification updated successfully",

                data: document
            });

        } catch (error) {

            console.error(
                "VERIFY RENTAL DOCUMENT ERROR:",
                error
            );

            return res.status(400).json({

                success: false,

                message:
                    error?.message ||
                    "Failed to verify rental document"
            });
        }
    };