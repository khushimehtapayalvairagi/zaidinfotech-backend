// import mongoose from "mongoose";

// const rentalDocumentSchema = new mongoose.Schema(
//     {
//         rentalId: {
//             type: mongoose.Schema.Types.ObjectId,
//             ref: "Rental",
//             required: true,
//             index: true
//         },

//         customerId: {
//             type: mongoose.Schema.Types.ObjectId,
//             ref: "User",
//             required: true
//         },

//         documentType: {
//             type: String,
//             enum: [
//                 "PASSPORT_PHOTO",
//                 "PAN_CARD",
//                 "AADHAAR_CARD",
//                 "HOUSE_RENTAL_AGREEMENT",
//                 "COLLEGE_ID",
//                 "OFFICE_ID",
//                 "GST_REGISTRATION",
//                 "AUTHORIZATION_LETTER"
//             ],
//             required: true
//         },

//         fileUrl: {
//             type: String,
//             required: true
//         },

//         fileName: {
//             type: String,
//             default: ""
//         },

//         verificationStatus: {
//             type: String,
//             enum: [
//                 "PENDING",
//                 "APPROVED",
//                 "REJECTED"
//             ],
//             default: "PENDING"
//         },

//         rejectionReason: {
//             type: String,
//             default: ""
//         },

//         verifiedBy: {
//             type: mongoose.Schema.Types.ObjectId,
//             ref: "User",
//             default: null
//         },

//         verifiedAt: {
//             type: Date,
//             default: null
//         }
//     },
//     {
//         timestamps: true
//     }
// );

// rentalDocumentSchema.index({
//     rentalId: 1,
//     documentType: 1
// });

// const RentalDocument = mongoose.model(
//     "RentalDocument",
//     rentalDocumentSchema
// );

// export default RentalDocument;


import mongoose from "mongoose";

const rentalDocumentSchema = new mongoose.Schema(
    {
        // ==========================================
        // RENTAL ID
        // ==========================================
        rentalId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Rental",
            required: true,
            index: true
        },

        // ==========================================
        // CUSTOMER ID
        // ==========================================
        // WALK-IN rental me customerId null ho sakta hai.
        // ONLINE rental me customerId available rahega.
        customerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null
        },

        // ==========================================
        // DOCUMENT TYPE
        // ==========================================
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

        // ==========================================
        // FILE URL
        // ==========================================
        fileUrl: {
            type: String,
            required: true
        },

        // ==========================================
        // ORIGINAL FILE NAME
        // ==========================================
        fileName: {
            type: String,
            default: ""
        },

        // ==========================================
        // VERIFICATION STATUS
        // ==========================================
        verificationStatus: {
            type: String,
            enum: [
                "PENDING",
                "APPROVED",
                "REJECTED"
            ],
            default: "PENDING"
        },

        // ==========================================
        // REJECTION REASON
        // ==========================================
        rejectionReason: {
            type: String,
            default: ""
        },

        // ==========================================
        // VERIFIED BY
        // ==========================================
        verifiedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null
        },

        // ==========================================
        // VERIFIED AT
        // ==========================================
        verifiedAt: {
            type: Date,
            default: null
        }
    },

    {
        timestamps: true
    }
);

// ==========================================
// INDEX
// ==========================================
rentalDocumentSchema.index({
    rentalId: 1,
    documentType: 1
});

// ==========================================
// MODEL
// ==========================================
const RentalDocument = mongoose.model(
    "RentalDocument",
    rentalDocumentSchema
);

export default RentalDocument;