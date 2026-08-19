import * as reviewRepository
    from "./review.repository.js";

import * as orderRepository
    from "../orders/order.repository.js";

import {
    REVIEW_STATUS
} from "../../common/constants/reviewStatus.js";


// =======================================
// CREATE REVIEW
// =======================================

export const createReview = async (
    userId,
    reviewData
) => {

    const {
        product,
        order,
        rating,
        comment,
        images
    } = reviewData;


    // ===================================
    // 1. CHECK ORDER
    // ===================================

    const customerOrder =
        await orderRepository.findOrderForReview(

            order,

            userId,

            product

        );


    if (!customerOrder) {

        throw new Error(
            "You can review this product only after purchasing it and receiving the order."
        );

    }


    // ===================================
    // 2. CHECK DUPLICATE REVIEW
    // ===================================

    const existingReview =
        await reviewRepository.getExistingReview(

            userId,

            product,

            order

        );


    if (existingReview) {

        throw new Error(
            "You have already reviewed this product for this order."
        );

    }


    // ===================================
    // 3. CREATE REVIEW
    // ===================================

    const review =
        await reviewRepository.createReview({

            user: userId,

            product,

            order,

            rating,

            comment,

            images: images || [],

            // Backend khud set karega
            verifiedPurchase: true,

            // Admin approval required
            status: REVIEW_STATUS.PENDING

        });


    return review;

};


// =======================================
// GET PRODUCT REVIEWS
// =======================================

export const getProductReviews = async (
    productId
) => {

    return await reviewRepository.getProductReviews(
        productId
    );

};


// =======================================
// GET PRODUCT RATING SUMMARY
// =======================================

export const getProductRatingSummary = async (
    productId
) => {

    return await reviewRepository.getProductRatingSummary(
        productId
    );

};


// =======================================
// GET MY REVIEWS
// =======================================

export const getMyReviews = async (
    userId
) => {

    return await reviewRepository.getUserReviews(
        userId
    );

};


// =======================================
// GET REVIEW BY ID
// =======================================

export const getReviewById = async (
    reviewId
) => {

    const review =
        await reviewRepository.getReviewById(
            reviewId
        );


    if (!review) {

        throw new Error(
            "Review not found."
        );

    }


    return review;

};


// =======================================
// UPDATE MY REVIEW
// =======================================

export const updateMyReview = async (
    reviewId,
    userId,
    updateData
) => {

    const review =
        await reviewRepository.getReviewById(
            reviewId
        );


    if (!review) {

        throw new Error(
            "Review not found."
        );

    }


    if (
        review.user._id.toString() !==
        userId.toString()
    ) {

        throw new Error(
            "You are not allowed to update this review."
        );

    }


    return await reviewRepository.updateReview(

        reviewId,

        {
            rating: updateData.rating,

            comment: updateData.comment,

            images: updateData.images || [],

            // Edited review again needs approval
            status: REVIEW_STATUS.PENDING,

            reviewedBy: null,

            rejectionReason: ""
        }

    );

};


// =======================================
// DELETE MY REVIEW
// =======================================

export const deleteMyReview = async (
    reviewId,
    userId
) => {

    const review =
        await reviewRepository.getReviewById(
            reviewId
        );


    if (!review) {

        throw new Error(
            "Review not found."
        );

    }


    if (
        review.user._id.toString() !==
        userId.toString()
    ) {

        throw new Error(
            "You are not allowed to delete this review."
        );

    }


    return await reviewRepository.deleteReview(
        reviewId
    );

};


// =======================================
// GET ALL REVIEWS
// ADMIN
// =======================================

export const getAllReviews = async () => {

    return await reviewRepository.getAllReviews();

};


// =======================================
// APPROVE REVIEW
// ADMIN
// =======================================

export const approveReview = async (
    reviewId,
    adminId
) => {

    const review =
        await reviewRepository.getReviewById(
            reviewId
        );


    if (!review) {

        throw new Error(
            "Review not found."
        );

    }


    return await reviewRepository.updateReview(

        reviewId,

        {
            status: REVIEW_STATUS.APPROVED,

            reviewedBy: adminId,

            rejectionReason: ""
        }

    );

};


// =======================================
// REJECT REVIEW
// ADMIN
// =======================================

export const rejectReview = async (
    reviewId,
    adminId,
    rejectionReason = ""
) => {

    const review =
        await reviewRepository.getReviewById(
            reviewId
        );


    if (!review) {

        throw new Error(
            "Review not found."
        );

    }


    return await reviewRepository.updateReview(

        reviewId,

        {
            status: REVIEW_STATUS.REJECTED,

            reviewedBy: adminId,

            rejectionReason
        }

    );

};