import mongoose from "mongoose";


// =====================================================
// RENTAL DOCUMENT SCHEMA
// =====================================================

const rentalDocumentSchema = new mongoose.Schema(
    {

        // =================================================
        // RENTAL
        // =================================================

        rentalId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Rental",
            required: true,
            index: true
        },


        // =================================================
        // UPLOADED BY
        // =================================================
        /*
            IMPORTANT:

            This field stores the logged-in user/staff
            who uploaded the document.

            For WALK_IN rentals:

                Rental.customerId = null

            Therefore DO NOT use Rental.customerId
            as the value for this field.

            Controller/service should use:

                req.user._id
        */

        customerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true
        },


        // =================================================
        // DOCUMENT TYPE
        // =================================================

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

            required: true,

            trim: true,

            uppercase: true,

            index: true
        },


        // =================================================
        // FILE URL
        // =================================================

        fileUrl: {
            type: String,
            required: true,
            trim: true
        },


        // =================================================
        // ORIGINAL FILE NAME
        // =================================================

        fileName: {
            type: String,
            default: "",
            trim: true
        },


        // =================================================
        // VERIFICATION STATUS
        // =================================================

        verificationStatus: {
            type: String,

            enum: [
                "PENDING",
                "APPROVED",
                "REJECTED"
            ],

            default: "PENDING",

            index: true
        },


        // =================================================
        // REJECTION REASON
        // =================================================

        rejectionReason: {
            type: String,
            default: "",
            trim: true
        },


        // =================================================
        // VERIFIED BY
        // =================================================

        verifiedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null
        },


        // =================================================
        // VERIFIED AT
        // =================================================

        verifiedAt: {
            type: Date,
            default: null
        }

    },

    {
        timestamps: true
    }
);


// =====================================================
// INDEXES
// =====================================================

/*
    Helps fetch documents of a rental
    grouped by document type.
*/

rentalDocumentSchema.index({
    rentalId: 1,
    documentType: 1
});


/*
    Helps fetch pending/approved/rejected
    documents for a rental.
*/

rentalDocumentSchema.index({
    rentalId: 1,
    verificationStatus: 1
});


// =====================================================
// MODEL
// =====================================================

const RentalDocument = mongoose.model(
    "RentalDocument",
    rentalDocumentSchema
);


// =====================================================
// EXPORT
// =====================================================

export default RentalDocument;