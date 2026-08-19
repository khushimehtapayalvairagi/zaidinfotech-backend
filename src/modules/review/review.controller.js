import * as reviewService
    from "./review.service.js";


// =======================================
// CREATE REVIEW
// =======================================

export const createReview = async (
    req,
    res
) => {

    try {

        const review =
            await reviewService.createReview(
                req.user._id,
                req.body
            );


        res.status(201).json({

            success: true,

            message:
                "Review submitted successfully. It is waiting for admin approval.",

            review

        });

    }
    catch (error) {

        res.status(400).json({

            success: false,

            message: error.message

        });

    }

};


// =======================================
// GET PRODUCT REVIEWS
// PUBLIC
// =======================================

export const getProductReviews = async (
    req,
    res
) => {

    try {

        const reviews =
            await reviewService.getProductReviews(
                req.params.productId
            );


        res.status(200).json({

            success: true,

            reviews

        });

    }
    catch (error) {

        res.status(400).json({

            success: false,

            message: error.message

        });

    }

};


// =======================================
// GET PRODUCT RATING SUMMARY
// PUBLIC
// =======================================

export const getProductRatingSummary = async (
    req,
    res
) => {

    try {

        const summary =
            await reviewService.getProductRatingSummary(
                req.params.productId
            );


        res.status(200).json({

            success: true,

            summary

        });

    }
    catch (error) {

        res.status(400).json({

            success: false,

            message: error.message

        });

    }

};


// =======================================
// GET MY REVIEWS
// =======================================

export const getMyReviews = async (
    req,
    res
) => {

    try {

        const reviews =
            await reviewService.getMyReviews(
                req.user._id
            );


        res.status(200).json({

            success: true,

            reviews

        });

    }
    catch (error) {

        res.status(400).json({

            success: false,

            message: error.message

        });

    }

};


// =======================================
// GET REVIEW BY ID
// =======================================

export const getReviewById = async (
    req,
    res
) => {

    try {

        const review =
            await reviewService.getReviewById(
                req.params.id
            );


        res.status(200).json({

            success: true,

            review

        });

    }
    catch (error) {

        res.status(404).json({

            success: false,

            message: error.message

        });

    }

};


// =======================================
// UPDATE MY REVIEW
// =======================================

export const updateMyReview = async (
    req,
    res
) => {

    try {

        const review =
            await reviewService.updateMyReview(

                req.params.id,

                req.user._id,

                req.body

            );


        res.status(200).json({

            success: true,

            message:
                "Review updated successfully and sent for approval.",

            review

        });

    }
    catch (error) {

        res.status(400).json({

            success: false,

            message: error.message

        });

    }

};


// =======================================
// DELETE MY REVIEW
// =======================================

export const deleteMyReview = async (
    req,
    res
) => {

    try {

        await reviewService.deleteMyReview(

            req.params.id,

            req.user._id

        );


        res.status(200).json({

            success: true,

            message:
                "Review deleted successfully."

        });

    }
    catch (error) {

        res.status(400).json({

            success: false,

            message: error.message

        });

    }

};


// =======================================
// GET ALL REVIEWS
// ADMIN
// =======================================

export const getAllReviews = async (
    req,
    res
) => {

    try {

        const reviews =
            await reviewService.getAllReviews();


        res.status(200).json({

            success: true,

            reviews

        });

    }
    catch (error) {

        res.status(400).json({

            success: false,

            message: error.message

        });

    }

};


// =======================================
// APPROVE REVIEW
// ADMIN
// =======================================

export const approveReview = async (
    req,
    res
) => {

    try {

        const review =
            await reviewService.approveReview(

                req.params.id,

                req.user._id

            );


        res.status(200).json({

            success: true,

            message:
                "Review approved successfully.",

            review

        });

    }
    catch (error) {

        res.status(400).json({

            success: false,

            message: error.message

        });

    }

};


// =======================================
// REJECT REVIEW
// ADMIN
// =======================================

export const rejectReview = async (
    req,
    res
) => {

    try {

        const {
            rejectionReason
        } = req.body;


        const review =
            await reviewService.rejectReview(

                req.params.id,

                req.user._id,

                rejectionReason

            );


        res.status(200).json({

            success: true,

            message:
                "Review rejected successfully.",

            review

        });

    }
    catch (error) {

        res.status(400).json({

            success: false,

            message: error.message

        });

    }

};