import Rental from "./rental.model.js";

import {
    uploadRentalDocumentService,
    getRentalDocumentsService,
    verifyRentalDocumentService
} from "./rentalDocument.service.js";


// =====================================================
// UPLOAD RENTAL DOCUMENT
// =====================================================

export const uploadRentalDocumentController = async (
    req,
    res
) => {

    try {

        const {
            rentalId
        } = req.params;

        const {
            documentType
        } = req.body;


        // =============================================
        // AUTH CHECK
        // =============================================

        if (!req.user?._id) {

            return res.status(401).json({

                success: false,

                message:
                    "Authentication required"

            });

        }


        // =============================================
        // RENTAL ID CHECK
        // =============================================

        if (!rentalId) {

            return res.status(400).json({

                success: false,

                message:
                    "Rental ID is required"

            });

        }


        // =============================================
        // DOCUMENT TYPE CHECK
        // =============================================

        if (!documentType) {

            return res.status(400).json({

                success: false,

                message:
                    "Document type is required"

            });

        }


        // =============================================
        // FILE CHECK
        // =============================================

        if (!req.file) {

            return res.status(400).json({

                success: false,

                message:
                    "Please upload a document"

            });

        }


        // =============================================
        // CHECK RENTAL OWNERSHIP
        // =============================================

        const rental =
            await Rental.findOne({

                _id: rentalId,

                customerId: req.user._id

            });


        if (!rental) {

            return res.status(404).json({

                success: false,

                message:
                    "Rental not found or access denied"

            });

        }


        // =============================================
        // SERVICE
        // =============================================

        const document =
            await uploadRentalDocumentService(

                rentalId,

                req.user._id,

                {
                    documentType
                },

                req.file

            );


        // =============================================
        // RESPONSE
        // =============================================

        return res.status(201).json({

            success: true,

            message:
                "Rental document uploaded successfully",

            data: document

        });

    }

    catch (error) {

        console.error(
            "Upload Rental Document Error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                error.message ||
                "Failed to upload rental document"

        });

    }

};



// =====================================================
// GET RENTAL DOCUMENTS
// =====================================================

export const getRentalDocumentsController = async (
    req,
    res
) => {

    try {

        const {
            rentalId
        } = req.params;


        // =============================================
        // AUTH CHECK
        // =============================================

        if (!req.user?._id) {

            return res.status(401).json({

                success: false,

                message:
                    "Authentication required"

            });

        }


        // =============================================
        // RENTAL ID CHECK
        // =============================================

        if (!rentalId) {

            return res.status(400).json({

                success: false,

                message:
                    "Rental ID is required"

            });

        }


        // =============================================
        // FIND RENTAL
        // =============================================

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


        // =============================================
        // CHECK OWNER
        // =============================================

        const isOwner =
            String(
                rental.customerId
            ) ===
            String(
                req.user._id
            );


        // =============================================
        // CHECK STAFF / ADMIN
        // =============================================

        const role =
            String(
                req.user.role ||
                req.user.userType ||
                req.user.type ||
                ""
            ).toUpperCase();


        const isStaff =
            [
                "ADMIN",
                "SUPER_ADMIN",
                "RECEPTIONIST",
                "STAFF"
            ].includes(
                role
            );


        // =============================================
        // ACCESS CHECK
        // =============================================

        if (
            !isOwner &&
            !isStaff
        ) {

            return res.status(403).json({

                success: false,

                message:
                    "You are not allowed to view these documents"

            });

        }


        // =============================================
        // SERVICE
        // =============================================

        const documents =
            await getRentalDocumentsService(
                rentalId
            );


        // =============================================
        // RESPONSE
        // =============================================

        return res.status(200).json({

            success: true,

            message:
                "Rental documents fetched successfully",

            data: documents

        });

    }

    catch (error) {

        console.error(
            "Get Rental Documents Error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                error.message ||
                "Failed to fetch rental documents"

        });

    }

};



// =====================================================
// VERIFY RENTAL DOCUMENT
// =====================================================

export const verifyRentalDocumentController = async (
    req,
    res
) => {

    try {

        const {
            documentId
        } = req.params;

        const {
            status,
            rejectionReason
        } = req.body;


        // =============================================
        // AUTH CHECK
        // =============================================

        if (!req.user?._id) {

            return res.status(401).json({

                success: false,

                message:
                    "Authentication required"

            });

        }


        // =============================================
        // DOCUMENT ID CHECK
        // =============================================

        if (!documentId) {

            return res.status(400).json({

                success: false,

                message:
                    "Document ID is required"

            });

        }


        // =============================================
        // NORMALIZE STATUS
        // =============================================

        const normalizedStatus =
            String(
                status || ""
            ).trim().toUpperCase();


        // =============================================
        // STATUS VALIDATION
        // =============================================

        if (
            ![
                "APPROVED",
                "REJECTED"
            ].includes(
                normalizedStatus
            )
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Status must be APPROVED or REJECTED"

            });

        }


        // =============================================
        // REJECTION REASON
        // =============================================

        if (
            normalizedStatus === "REJECTED" &&
            !String(
                rejectionReason || ""
            ).trim()
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Rejection reason is required"

            });

        }


        // =============================================
        // SERVICE
        // =============================================

        const document =
            await verifyRentalDocumentService(

                documentId,

                req.user._id,

                normalizedStatus,

                rejectionReason || null

            );


        // =============================================
        // RESPONSE
        // =============================================

        return res.status(200).json({

            success: true,

            message:
                normalizedStatus === "APPROVED"
                    ? "Rental document approved successfully"
                    : "Rental document rejected successfully",

            data: document

        });

    }

    catch (error) {

        console.error(
            "Verify Rental Document Error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                error.message ||
                "Failed to verify rental document"

        });

    }

};