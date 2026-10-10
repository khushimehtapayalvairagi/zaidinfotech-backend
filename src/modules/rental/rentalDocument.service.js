import RentalDocument from "./rentalDocument.model.js";
import Rental from "./rental.model.js";

const ALLOWED_DOCUMENT_TYPES = [
    "PASSPORT_PHOTO",
    "PAN_CARD",
    "AADHAAR_CARD",
    "HOUSE_RENTAL_AGREEMENT",

    // COLLEGE_ID / OFFICE_ID me se sirf ek hi rah sakta hai
    "COLLEGE_ID",
    "OFFICE_ID",

    "GST_REGISTRATION",
    "AUTHORIZATION_LETTER"
];


// COLLEGE_ID <-> OFFICE_ID: opposite wala hata do
const removeOppositeIdDocument = async (rentalId, documentType) => {

    if (documentType !== "COLLEGE_ID" && documentType !== "OFFICE_ID") {
        return;
    }

    const opposite =
        documentType === "COLLEGE_ID" ? "OFFICE_ID" : "COLLEGE_ID";

    await RentalDocument.deleteMany({
        rentalId,
        documentType: opposite
    });
};


// =====================================================
// UPLOAD RENTAL DOCUMENT
//
// Agar rental kisi order ka part hai (orderId), to wahi document
// us order ke baaki saare laptops (rentals) par bhi attach ho jata hai.
// Receptionist ko sirf ek baar upload karna padta hai.
// =====================================================

export const uploadRentalDocumentService = async (
    rentalId,
    customerId,
    data,
    file
) => {

    if (!rentalId) {
        throw new Error("Rental ID is required");
    }

    if (!file) {
        throw new Error("Document file is required");
    }

    const rental = await Rental.findById(rentalId);

    if (!rental) {
        throw new Error("Rental not found");
    }

    const documentType = String(data?.documentType || "")
        .trim()
        .toUpperCase();

    if (!documentType) {
        throw new Error("Document type is required");
    }

    if (!ALLOWED_DOCUMENT_TYPES.includes(documentType)) {
        throw new Error(`Invalid document type: ${documentType}`);
    }

    const fileUrl = `/uploads/rental-documents/${file.filename}`;
    const fileName = file.originalname || "";

    // ---------- is rental ka document ----------
    await removeOppositeIdDocument(rental._id, documentType);

    const document = await RentalDocument.create({
        rentalId: rental._id,
        customerId: rental.customerId || null,
        documentType,
        fileUrl,
        fileName
    });

    // ---------- same order ke baaki rentals ----------
    if (rental.orderId) {

        const siblings = await Rental.find({
            orderId: rental.orderId,
            _id: { $ne: rental._id }
        }).select("_id customerId");

        for (const sibling of siblings) {

            await removeOppositeIdDocument(sibling._id, documentType);

            await RentalDocument.create({
                rentalId: sibling._id,
                customerId: sibling.customerId || null,
                documentType,
                fileUrl,
                fileName
            });
        }
    }

    return document;
};


// =====================================================
// GET RENTAL DOCUMENTS
// =====================================================

export const getRentalDocumentsService = async (rentalId) => {

    if (!rentalId) {
        throw new Error("Rental ID is required");
    }

    return await RentalDocument.find({ rentalId })
        .populate("verifiedBy", "name email")
        .sort({ createdAt: -1 });
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
        throw new Error("Document ID is required");
    }

    const document = await RentalDocument.findById(documentId);

    if (!document) {
        throw new Error("Document not found");
    }

    const verificationStatus = String(status || "")
        .trim()
        .toUpperCase();

    if (!["APPROVED", "REJECTED"].includes(verificationStatus)) {
        throw new Error("Invalid verification status");
    }

    document.verificationStatus = verificationStatus;

    document.rejectionReason =
        verificationStatus === "REJECTED"
            ? String(rejectionReason || "")
            : "";

    document.verifiedBy = adminId || null;
    document.verifiedAt = new Date();

    await document.save();

    return document;
};