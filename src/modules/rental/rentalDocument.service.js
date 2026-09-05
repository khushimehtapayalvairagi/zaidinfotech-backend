import RentalDocument from "./rentalDocument.model.js";
import Rental from "./rental.model.js";


// =====================================================
// UPLOAD DOCUMENT
// =====================================================

export const uploadRentalDocumentService = async (
    rentalId,
    customerId,
    data,
    file
) => {

    const rental =
        await Rental.findOne({
            _id: rentalId,
            customerId
        });

    if (!rental) {

        throw new Error(
            "Rental not found"
        );

    }


    if (!file) {

        throw new Error(
            "Document file is required"
        );

    }


    const document =
        await RentalDocument.create({

            rentalId,

            customerId,

            documentType:
                data.documentType,

            fileUrl:
                `/uploads/rental-documents/${file.filename}`,

            fileName:
                file.originalname

        });


    await Rental.findByIdAndUpdate(
        rentalId,
        {
            status:
                "DOCUMENT_VERIFICATION"
        }
    );


    return document;

};


// =====================================================
// GET RENTAL DOCUMENTS
// =====================================================

export const getRentalDocumentsService = async (
    rentalId
) => {

    return await RentalDocument.find({
        rentalId
    })
        .populate(
            "verifiedBy",
            "name email"
        )
        .sort({
            createdAt: -1
        });

};


// =====================================================
// VERIFY DOCUMENT
// =====================================================

export const verifyRentalDocumentService = async (
    documentId,
    adminId,
    status,
    rejectionReason = ""
) => {

    const document =
        await RentalDocument.findById(
            documentId
        );

    if (!document) {

        throw new Error(
            "Document not found"
        );

    }


    if (
        !["APPROVED", "REJECTED"]
            .includes(status)
    ) {

        throw new Error(
            "Invalid verification status"
        );

    }


    document.verificationStatus =
        status;

    document.rejectionReason =
        rejectionReason;

    document.verifiedBy =
        adminId;

    document.verifiedAt =
        new Date();


    await document.save();


    return document;

};