import mongoose from "mongoose";

const rentalDocumentSchema = new mongoose.Schema(
    {
        rentalId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Rental",
            required: true,
            index: true
        },

        customerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        documentType: {
            type: String,
            enum: [
                "PASSPORT_PHOTO",
                "PAN_CARD",
                "AADHAAR_CARD",
                "HOUSE_RENTAL_AGREEMENT",
                "COLLEGE_ID",
                "OFFICE_ID",
                "GST_REGISTRATION",
                "AUTHORIZATION_LETTER"
            ],
            required: true
        },

        fileUrl: {
            type: String,
            required: true
        },

        fileName: {
            type: String,
            default: ""
        },

        verificationStatus: {
            type: String,
            enum: [
                "PENDING",
                "APPROVED",
                "REJECTED"
            ],
            default: "PENDING"
        },

        rejectionReason: {
            type: String,
            default: ""
        },

        verifiedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null
        },

        verifiedAt: {
            type: Date,
            default: null
        }
    },
    {
        timestamps: true
    }
);

rentalDocumentSchema.index({
    rentalId: 1,
    documentType: 1
});

const RentalDocument = mongoose.model(
    "RentalDocument",
    rentalDocumentSchema
);

export default RentalDocument;