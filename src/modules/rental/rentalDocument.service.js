// // import RentalDocument from "./rentalDocument.model.js";
// // import Rental from "./rental.model.js";


// // // =====================================================
// // // UPLOAD DOCUMENT
// // // =====================================================

// // export const uploadRentalDocumentService = async (
// //     rentalId,
// //     customerId,
// //     data,
// //     file
// // ) => {

// //     const rental =
// //         await Rental.findOne({
// //             _id: rentalId,
// //             customerId
// //         });

// //     if (!rental) {

// //         throw new Error(
// //             "Rental not found"
// //         );

// //     }


// //     if (!file) {

// //         throw new Error(
// //             "Document file is required"
// //         );

// //     }


// //     const document =
// //         await RentalDocument.create({

// //             rentalId,

// //             customerId,

// //             documentType:
// //                 data.documentType,

// //             fileUrl:
// //                 `/uploads/rental-documents/${file.filename}`,

// //             fileName:
// //                 file.originalname

// //         });


// //     await Rental.findByIdAndUpdate(
// //         rentalId,
// //         {
// //             status:
// //                 "DOCUMENT_VERIFICATION"
// //         }
// //     );


// //     return document;

// // };


// // // =====================================================
// // // GET RENTAL DOCUMENTS
// // // =====================================================

// // export const getRentalDocumentsService = async (
// //     rentalId
// // ) => {

// //     return await RentalDocument.find({
// //         rentalId
// //     })
// //         .populate(
// //             "verifiedBy",
// //             "name email"
// //         )
// //         .sort({
// //             createdAt: -1
// //         });

// // };


// // // =====================================================
// // // VERIFY DOCUMENT
// // // =====================================================

// // export const verifyRentalDocumentService = async (
// //     documentId,
// //     adminId,
// //     status,
// //     rejectionReason = ""
// // ) => {

// //     const document =
// //         await RentalDocument.findById(
// //             documentId
// //         );

// //     if (!document) {

// //         throw new Error(
// //             "Document not found"
// //         );

// //     }


// //     if (
// //         !["APPROVED", "REJECTED"]
// //             .includes(status)
// //     ) {

// //         throw new Error(
// //             "Invalid verification status"
// //         );

// //     }


// //     document.verificationStatus =
// //         status;

// //     document.rejectionReason =
// //         rejectionReason;

// //     document.verifiedBy =
// //         adminId;

// //     document.verifiedAt =
// //         new Date();


// //     await document.save();


// //     return document;

// // };

// import RentalDocument from "./rentalDocument.model.js";
// import Rental from "./rental.model.js";

// // =====================================================
// // UPLOAD RENTAL DOCUMENT
// // =====================================================

// export const uploadRentalDocumentService = async (
//     rentalId,
//     customerId,
//     data,
//     file
// ) => {
//     // ---------------------------------------------
//     // Validate rental ID
//     // ---------------------------------------------
//     if (!rentalId) {
//         throw new Error("Rental ID is required");
//     }

//     // ---------------------------------------------
//     // Validate file
//     // ---------------------------------------------
//     if (!file) {
//         throw new Error("Document file is required");
//     }

//     // ---------------------------------------------
//     // Find rental ONLY by rentalId
//     //
//     // IMPORTANT:
//     // Walk-In rental has customerId = null.
//     // Therefore don't match rental.customerId
//     // with logged-in staff user ID.
//     // ---------------------------------------------
//     const rental = await Rental.findById(rentalId);

//     if (!rental) {
//         throw new Error("Rental not found");
//     }

//     // ---------------------------------------------
//     // Validate document type
//     // ---------------------------------------------
//     const allowedDocumentTypes = [
//         "PASSPORT_PHOTO",
//         "PAN_CARD",
//         "AADHAAR_CARD",
//         "HOUSE_RENTAL_AGREEMENT",
//         "COLLEGE_ID",
//         "OFFICE_ID",
//         "GST_REGISTRATION",
//         "AUTHORIZATION_LETTER"
//     ];

//     const documentType = String(
//         data?.documentType || ""
//     )
//         .trim()
//         .toUpperCase();

//     if (!documentType) {
//         throw new Error("Document type is required");
//     }

//     if (!allowedDocumentTypes.includes(documentType)) {
//         throw new Error(
//             `Invalid document type: ${documentType}`
//         );
//     }

//     // ---------------------------------------------
//     // Create document
//     //
//     // For ONLINE:
//     // customerId = rental.customerId
//     //
//     // For WALK_IN:
//     // rental.customerId = null
//     // ---------------------------------------------
//     const document = await RentalDocument.create({
//         rentalId: rental._id,

//         customerId: rental.customerId || null,

//         documentType,

//         fileUrl: `/uploads/rental-documents/${file.filename}`,

//         fileName: file.originalname || ""
//     });

//     // ---------------------------------------------
//     // IMPORTANT:
//     //
//     // DO NOT set:
//     // status: "DOCUMENT_VERIFICATION"
//     //
//     // Rental model doesn't allow this status.
//     // Document itself already has:
//     // verificationStatus: "PENDING"
//     // ---------------------------------------------

//     return document;
// };

// // =====================================================
// // GET RENTAL DOCUMENTS
// // =====================================================

// export const getRentalDocumentsService = async (
//     rentalId
// ) => {
//     if (!rentalId) {
//         throw new Error("Rental ID is required");
//     }

//     return await RentalDocument.find({
//         rentalId
//     })
//         .populate(
//             "verifiedBy",
//             "name email"
//         )
//         .sort({
//             createdAt: -1
//         });
// };

// // =====================================================
// // VERIFY RENTAL DOCUMENT
// // =====================================================

// export const verifyRentalDocumentService = async (
//     documentId,
//     adminId,
//     status,
//     rejectionReason = ""
// ) => {
//     if (!documentId) {
//         throw new Error("Document ID is required");
//     }

//     const document =
//         await RentalDocument.findById(documentId);

//     if (!document) {
//         throw new Error("Document not found");
//     }

//     const verificationStatus = String(
//         status || ""
//     )
//         .trim()
//         .toUpperCase();

//     // ---------------------------------------------
//     // Validate status
//     // ---------------------------------------------
//     if (
//         ![
//             "APPROVED",
//             "REJECTED"
//         ].includes(verificationStatus)
//     ) {
//         throw new Error(
//             "Invalid verification status"
//         );
//     }

//     // ---------------------------------------------
//     // Update document
//     // ---------------------------------------------
//     document.verificationStatus =
//         verificationStatus;

//     document.rejectionReason =
//         verificationStatus === "REJECTED"
//             ? String(rejectionReason || "")
//             : "";

//     document.verifiedBy =
//         adminId || null;

//     document.verifiedAt =
//         new Date();

//     await document.save();

//     return document;
// };


import RentalDocument from "./rentalDocument.model.js";
import Rental from "./rental.model.js";

// =====================================================
// UPLOAD RENTAL DOCUMENT
// =====================================================

export const uploadRentalDocumentService = async (
    rentalId,
    customerId,
    data,
    file
) => {

    // ---------------------------------------------
    // Validate rental ID
    // ---------------------------------------------

    if (!rentalId) {
        throw new Error("Rental ID is required");
    }


    // ---------------------------------------------
    // Validate file
    // ---------------------------------------------

    if (!file) {
        throw new Error("Document file is required");
    }


    // ---------------------------------------------
    // Find rental
    // ---------------------------------------------

    const rental =
        await Rental.findById(rentalId);


    if (!rental) {
        throw new Error("Rental not found");
    }


    // ---------------------------------------------
    // Allowed document types
    // ---------------------------------------------

    const allowedDocumentTypes = [

        "PASSPORT_PHOTO",

        "PAN_CARD",

        "AADHAAR_CARD",

        "HOUSE_RENTAL_AGREEMENT",

        // -----------------------------------------
        // IMPORTANT
        // IDENTITY DOCUMENT
        // ONLY ONE OF THESE TWO CAN EXIST
        // -----------------------------------------

        "COLLEGE_ID",

        "OFFICE_ID",

        "GST_REGISTRATION",

        "AUTHORIZATION_LETTER"
    ];


    // ---------------------------------------------
    // Normalize document type
    // ---------------------------------------------

    const documentType = String(
        data?.documentType || ""
    )
        .trim()
        .toUpperCase();


    // ---------------------------------------------
    // Validate document type
    // ---------------------------------------------

    if (!documentType) {

        throw new Error(
            "Document type is required"
        );

    }


    if (
        !allowedDocumentTypes.includes(
            documentType
        )
    ) {

        throw new Error(
            `Invalid document type: ${documentType}`
        );

    }


    // =================================================
    // COLLEGE ID / OFFICE ID RULE
    // =================================================
    //
    // Only ONE ID document is allowed:
    //
    // COLLEGE_ID
    //       OR
    // OFFICE_ID
    //
    // NOT BOTH.
    //
    // If opposite ID already exists,
    // it will be removed before creating new one.
    // =================================================

    const isCollegeOrOfficeId =
        documentType === "COLLEGE_ID" ||
        documentType === "OFFICE_ID";


    if (isCollegeOrOfficeId) {

        const oppositeDocumentType =
            documentType === "COLLEGE_ID"
                ? "OFFICE_ID"
                : "COLLEGE_ID";


        // ---------------------------------------------
        // Find opposite ID document
        // ---------------------------------------------

        const existingOppositeDocument =
            await RentalDocument.findOne({
                rentalId: rental._id,
                documentType:
                    oppositeDocumentType
            });


        // ---------------------------------------------
        // Delete opposite ID
        // ---------------------------------------------

        if (existingOppositeDocument) {

            await RentalDocument.deleteOne({
                _id: existingOppositeDocument._id
            });

            console.log(
                `♻️ Replaced ${oppositeDocumentType} with ${documentType}`
            );

        }

    }


    // =================================================
    // CREATE DOCUMENT
    // =================================================

    const document =
        await RentalDocument.create({

            rentalId:
                rental._id,

            // -----------------------------------------
            // ONLINE RENTAL
            // customerId = rental.customerId
            //
            // WALK-IN RENTAL
            // rental.customerId = null
            // -----------------------------------------

            customerId:
                rental.customerId || null,

            documentType,

            fileUrl:
                `/uploads/rental-documents/${file.filename}`,

            fileName:
                file.originalname || ""
        });


    // =================================================
    // RETURN CREATED DOCUMENT
    // =================================================

    return document;
};


// =====================================================
// GET RENTAL DOCUMENTS
// =====================================================

export const getRentalDocumentsService = async (
    rentalId
) => {

    if (!rentalId) {

        throw new Error(
            "Rental ID is required"
        );

    }


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
// VERIFY RENTAL DOCUMENT
// =====================================================

export const verifyRentalDocumentService = async (
    documentId,
    adminId,
    status,
    rejectionReason = ""
) => {

    if (!documentId) {

        throw new Error(
            "Document ID is required"
        );

    }


    const document =
        await RentalDocument.findById(
            documentId
        );


    if (!document) {

        throw new Error(
            "Document not found"
        );

    }


    const verificationStatus =
        String(status || "")
            .trim()
            .toUpperCase();


    // ---------------------------------------------
    // Validate verification status
    // ---------------------------------------------

    if (
        ![
            "APPROVED",
            "REJECTED"
        ].includes(
            verificationStatus
        )
    ) {

        throw new Error(
            "Invalid verification status"
        );

    }


    // ---------------------------------------------
    // Update verification
    // ---------------------------------------------

    document.verificationStatus =
        verificationStatus;


    document.rejectionReason =
        verificationStatus === "REJECTED"
            ? String(
                rejectionReason || ""
            )
            : "";


    document.verifiedBy =
        adminId || null;


    document.verifiedAt =
        new Date();


    await document.save();


    return document;
};