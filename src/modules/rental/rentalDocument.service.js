import mongoose from "mongoose";
import RentalDocument from "./rentalDocument.model.js";
import Rental from "./rental.model.js";

const ALLOWED_DOCUMENT_TYPES = [
  "PASSPORT_PHOTO",
  "PAN_CARD",
  "AADHAAR_CARD",
  "HOUSE_RENTAL_AGREEMENT",
  "COLLEGE_ID",
  "OFFICE_ID",
  "GST_REGISTRATION",
  "AUTHORIZATION_LETTER",
  "LAPTOP_CONDITION"
];

const IMAGE_SIDES = ["FRONT", "BACK", "FULL"];

const createError = (message, statusCode = 400) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const removeOppositeIdDocument = async (
  rentalId,
  documentType
) => {
  if (
    documentType !== "COLLEGE_ID" &&
    documentType !== "OFFICE_ID"
  ) {
    return;
  }

  const opposite =
    documentType === "COLLEGE_ID"
      ? "OFFICE_ID"
      : "COLLEGE_ID";

  await RentalDocument.deleteMany({
    rentalId,
    documentType: opposite
  });
};

export const uploadRentalDocumentService = async (
  rentalId,
  customerId,
  data,
  file
) => {
  if (!mongoose.isValidObjectId(rentalId)) {
    throw createError("Invalid rental ID");
  }

  if (!file) {
    throw createError("Document file is required");
  }

  const rental = await Rental.findById(rentalId);

  if (!rental) {
    throw createError("Rental not found", 404);
  }

  const documentType = String(
    data?.documentType || ""
  ).trim().toUpperCase();

  const imageSide = String(
    data?.imageSide || ""
  ).trim().toUpperCase();

  if (!ALLOWED_DOCUMENT_TYPES.includes(documentType)) {
    throw createError(
      `Invalid document type: ${documentType}`
    );
  }

  if (documentType === "LAPTOP_CONDITION") {
    if (!IMAGE_SIDES.includes(imageSide)) {
      throw createError(
        "Laptop image side must be FRONT, BACK or FULL"
      );
    }

    if (
      ![
        "image/jpeg",
        "image/png",
        "image/webp"
      ].includes(file.mimetype)
    ) {
      throw createError(
        "Laptop photos must be JPG, PNG or WEBP"
      );
    }
  } else if (imageSide) {
    throw createError(
      "imageSide is only allowed for laptop condition photos"
    );
  }

  const fileUrl =
    `/uploads/rental-documents/${file.filename}`;

  const fileName = file.originalname || "";

  // Laptop condition photos belong to one specific
  // rental unit, not all rentals in the order.
  if (documentType === "LAPTOP_CONDITION") {
    return await RentalDocument.findOneAndUpdate(
      {
        rentalId: rental._id,
        documentType: "LAPTOP_CONDITION",
        imageSide
      },
      {
        $set: {
          customerId: rental.customerId || null,
          fileUrl,
          fileName,
          verificationStatus: "PENDING",
          rejectionReason: "",
          verifiedBy: null,
          verifiedAt: null
        },
        $setOnInsert: {
          rentalId: rental._id,
          documentType: "LAPTOP_CONDITION",
          imageSide
        }
      },
      {
        new: true,
        upsert: true,
        runValidators: true
      }
    );
  }

  // Existing identity-document behavior preserved.
  await removeOppositeIdDocument(
    rental._id,
    documentType
  );

  const document = await RentalDocument.create({
    rentalId: rental._id,
    customerId: rental.customerId || null,
    documentType,
    fileUrl,
    fileName
  });

  // Share identity documents across the same order.
  if (rental.orderId) {
    const siblings = await Rental.find({
      orderId: rental.orderId,
      _id: { $ne: rental._id }
    }).select("_id customerId");

    for (const sibling of siblings) {
      await removeOppositeIdDocument(
        sibling._id,
        documentType
      );

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

export const getRentalDocumentsService = async (
  rentalId
) => {
  if (!mongoose.isValidObjectId(rentalId)) {
    throw createError("Invalid rental ID");
  }

  return RentalDocument.find({ rentalId })
    .populate("verifiedBy", "name email")
    .sort({ createdAt: -1 });
};

export const verifyRentalDocumentService = async (
  documentId,
  adminId,
  status,
  rejectionReason = ""
) => {
  if (!mongoose.isValidObjectId(documentId)) {
    throw createError("Invalid document ID");
  }

  const document = await RentalDocument.findById(
    documentId
  );

  if (!document) {
    throw createError("Document not found", 404);
  }

  const verificationStatus = String(
    status || ""
  ).trim().toUpperCase();

  if (
    !["APPROVED", "REJECTED"].includes(
      verificationStatus
    )
  ) {
    throw createError("Invalid verification status");
  }

  if (
    verificationStatus === "REJECTED" &&
    !String(rejectionReason || "").trim()
  ) {
    throw createError("Rejection reason is required");
  }

  document.verificationStatus = verificationStatus;
  document.rejectionReason =
    verificationStatus === "REJECTED"
      ? String(rejectionReason).trim()
      : "";

  document.verifiedBy = adminId || null;
  document.verifiedAt = new Date();

  await document.save();

  return document;
};