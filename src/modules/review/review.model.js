import mongoose from "mongoose";

import {
    REVIEW_STATUS
} from "../../common/constants/reviewStatus.js";


const reviewSchema = new mongoose.Schema(
{
    // =======================================
    // CUSTOMER
    // =======================================

    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true
    },


    // =======================================
    // PRODUCT
    // =======================================

    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
        index: true
    },


    // =======================================
    // ORDER
    // Used for verified purchase
    // =======================================

    order: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Order",
        required: true,
        index: true
    },


    // =======================================
    // RATING
    // 1 - 5
    // =======================================

    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },


    // =======================================
    // COMMENT
    // =======================================

    comment: {
        type: String,
        required: true,
        trim: true,
        maxlength: 1000
    },


    // =======================================
    // REVIEW IMAGES
    // =======================================

    images: [
        {
            type: String,
            trim: true
        }
    ],


    // =======================================
    // VERIFIED PURCHASE
    // =======================================

    verifiedPurchase: {
        type: Boolean,
        default: false
    },


    // =======================================
    // ADMIN MODERATION
    // =======================================

    status: {
        type: String,
        enum: Object.values(REVIEW_STATUS),
        default: REVIEW_STATUS.PENDING,
        index: true
    },


    // =======================================
    // ADMIN WHO REVIEWED
    // =======================================

    reviewedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null
    },


    // =======================================
    // REJECTION REASON
    // =======================================

    rejectionReason: {
        type: String,
        default: "",
        trim: true
    },


    // =======================================
    // SOFT DELETE
    // =======================================

    isDeleted: {
        type: Boolean,
        default: false
    }

},
{
    timestamps: true
});


// =======================================
// ONE REVIEW PER USER + PRODUCT + ORDER
// =======================================

reviewSchema.index(
{
    user: 1,
    product: 1,
    order: 1
},
{
    unique: true
});


// =======================================
// PRODUCT REVIEW LIST
// =======================================

reviewSchema.index({
    product: 1,
    status: 1,
    createdAt: -1
});


const Review = mongoose.model(
    "Review",
    reviewSchema
);


export default Review;