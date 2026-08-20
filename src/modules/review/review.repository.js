// import Review from "./review.model.js";


// // =======================================
// // CREATE REVIEW
// // =======================================

// export const createReview = async (reviewData) => {

//     return await Review.create(reviewData);

// };


// // =======================================
// // GET REVIEW BY ID
// // =======================================

// export const getReviewById = async (reviewId) => {

//     return await Review.findOne({
//         _id: reviewId,
//         isDeleted: false
//     })
//     .populate(
//         "user",
//         "firstName lastName email"
//     )
//     .populate(
//         "product",
//         "name images price"
//     )
//     .populate(
//         "order",
//         "orderNumber status"
//     )
//     .populate(
//         "reviewedBy",
//         "firstName lastName"
//     );

// };


// // =======================================
// // GET PRODUCT REVIEWS
// // PUBLIC
// // ONLY APPROVED
// // =======================================

// export const getProductReviews = async (productId) => {

//     return await Review.find({
//         product: productId,
//         status: "APPROVED",
//         isDeleted: false
//     })
//     .populate(
//         "user",
//         "firstName lastName"
//     )
//     .sort({
//         createdAt: -1
//     });

// };


// // =======================================
// // GET MY REVIEWS
// // =======================================

// export const getUserReviews = async (userId) => {

//     return await Review.find({
//         user: userId,
//         isDeleted: false
//     })
//     .populate(
//         "product",
//         "name images price"
//     )
//     .populate(
//         "order",
//         "orderNumber status"
//     )
//     .sort({
//         createdAt: -1
//     });

// };


// // =======================================
// // GET ALL REVIEWS
// // ADMIN
// // =======================================

// export const getAllReviews = async () => {

//     return await Review.find({
//         isDeleted: false
//     })
//     .populate(
//         "user",
//         "firstName lastName email"
//     )
//     .populate(
//         "product",
//         "name"
//     )
//     .populate(
//         "order",
//         "orderNumber status"
//     )
//     .populate(
//         "reviewedBy",
//         "firstName lastName"
//     )
//     .sort({
//         createdAt: -1
//     });

// };


// // =======================================
// // UPDATE REVIEW
// // =======================================

// export const updateReview = async (
//     reviewId,
//     updateData
// ) => {

//     return await Review.findOneAndUpdate(
//         {
//             _id: reviewId,
//             isDeleted: false
//         },
//         updateData,
//         {
//             new: true,
//             runValidators: true
//         }
//     );

// };


// // =======================================
// // SOFT DELETE
// // =======================================

// export const deleteReview = async (reviewId) => {

//     return await Review.findOneAndUpdate(
//         {
//             _id: reviewId,
//             isDeleted: false
//         },
//         {
//             isDeleted: true
//         },
//         {
//             new: true
//         }
//     );

// };


// // =======================================
// // CHECK EXISTING REVIEW
// // =======================================

// export const getExistingReview = async (
//     userId,
//     productId,
//     orderId
// ) => {

//     return await Review.findOne({
//         user: userId,
//         product: productId,
//         order: orderId,
//         isDeleted: false
//     });

// };


// // =======================================
// // PRODUCT RATING SUMMARY
// // =======================================

// export const getProductRatingSummary = async (
//     productId
// ) => {

//     const result = await Review.aggregate([

//         {
//             $match: {
//                 product: productId,
//                 status: "APPROVED",
//                 isDeleted: false
//             }
//         },

//         {
//             $group: {
//                 _id: null,

//                 totalReviews: {
//                     $sum: 1
//                 },

//                 averageRating: {
//                     $avg: "$rating"
//                 },

//                 fiveStar: {
//                     $sum: {
//                         $cond: [
//                             {
//                                 $eq: ["$rating", 5]
//                             },
//                             1,
//                             0
//                         ]
//                     }
//                 },

//                 fourStar: {
//                     $sum: {
//                         $cond: [
//                             {
//                                 $eq: ["$rating", 4]
//                             },
//                             1,
//                             0
//                         ]
//                     }
//                 },

//                 threeStar: {
//                     $sum: {
//                         $cond: [
//                             {
//                                 $eq: ["$rating", 3]
//                             },
//                             1,
//                             0
//                         ]
//                     }
//                 },

//                 twoStar: {
//                     $sum: {
//                         $cond: [
//                             {
//                                 $eq: ["$rating", 2]
//                             },
//                             1,
//                             0
//                         ]
//                     }
//                 },

//                 oneStar: {
//                     $sum: {
//                         $cond: [
//                             {
//                                 $eq: ["$rating", 1]
//                             },
//                             1,
//                             0
//                         ]
//                     }
//                 }
//             }
//         },

//         {
//             $project: {
//                 _id: 0,

//                 totalReviews: 1,

//                 averageRating: {
//                     $round: [
//                         "$averageRating",
//                         1
//                     ]
//                 },

//                 fiveStar: 1,
//                 fourStar: 1,
//                 threeStar: 1,
//                 twoStar: 1,
//                 oneStar: 1
//             }
//         }

//     ]);


//     return result[0] || {
//         totalReviews: 0,
//         averageRating: 0,
//         fiveStar: 0,
//         fourStar: 0,
//         threeStar: 0,
//         twoStar: 0,
//         oneStar: 0
//     };

// };


// // ==========================================
// // FIND ORDER FOR REVIEW
// // ==========================================

// export const findOrderForReview = async (
//     orderId,
//     userId
// ) => {

//     const order = await Order.findOne({

//         _id: orderId,

//         user: userId

//     }).select(

//         "_id user orderItems status paymentStatus"

//     );

//     return order;

// };


import Review from "./review.model.js";
import Order from "../orders/order.model.js";


// =======================================
// CREATE REVIEW
// =======================================

export const createReview = async (reviewData) => {

    return await Review.create(reviewData);

};


// =======================================
// GET REVIEW BY ID
// =======================================

export const getReviewById = async (reviewId) => {

    return await Review.findOne({
        _id: reviewId,
        isDeleted: false
    })
    .populate(
        "user",
        "firstName lastName email"
    )
    .populate(
        "product",
        "name images price"
    )
    .populate(
        "order",
        "orderNumber status"
    )
    .populate(
        "reviewedBy",
        "firstName lastName"
    );

};


// =======================================
// GET PRODUCT REVIEWS
// PUBLIC
// ONLY APPROVED
// =======================================

export const getProductReviews = async (productId) => {

    return await Review.find({
        product: productId,
        status: "APPROVED",
        isDeleted: false
    })
    .populate(
        "user",
        "firstName lastName"
    )
    .sort({
        createdAt: -1
    });

};


// =======================================
// GET MY REVIEWS
// =======================================

export const getUserReviews = async (userId) => {

    return await Review.find({
        user: userId,
        isDeleted: false
    })
    .populate(
        "product",
        "name images price"
    )
    .populate(
        "order",
        "orderNumber status"
    )
    .sort({
        createdAt: -1
    });

};


// =======================================
// GET ALL REVIEWS
// ADMIN
// =======================================

export const getAllReviews = async () => {

    return await Review.find({
        isDeleted: false
    })
    .populate(
        "user",
        "firstName lastName email"
    )
    .populate(
        "product",
        "name"
    )
    .populate(
        "order",
        "orderNumber status"
    )
    .populate(
        "reviewedBy",
        "firstName lastName"
    )
    .sort({
        createdAt: -1
    });

};


// =======================================
// UPDATE REVIEW
// =======================================

export const updateReview = async (
    reviewId,
    updateData
) => {

    return await Review.findOneAndUpdate(
        {
            _id: reviewId,
            isDeleted: false
        },
        updateData,
        {
            new: true,
            runValidators: true
        }
    );

};


// =======================================
// SOFT DELETE
// =======================================

export const deleteReview = async (reviewId) => {

    return await Review.findOneAndUpdate(
        {
            _id: reviewId,
            isDeleted: false
        },
        {
            isDeleted: true
        },
        {
            new: true
        }
    );

};


// =======================================
// CHECK EXISTING REVIEW
// =======================================

export const getExistingReview = async (
    userId,
    productId,
    orderId
) => {

    return await Review.findOne({
        user: userId,
        product: productId,
        order: orderId,
        isDeleted: false
    });

};


// =======================================
// PRODUCT RATING SUMMARY
// =======================================

export const getProductRatingSummary = async (
    productId
) => {

    const result = await Review.aggregate([

        {
            $match: {
                product: productId,
                status: "APPROVED",
                isDeleted: false
            }
        },

        {
            $group: {
                _id: null,

                totalReviews: {
                    $sum: 1
                },

                averageRating: {
                    $avg: "$rating"
                },

                fiveStar: {
                    $sum: {
                        $cond: [
                            {
                                $eq: ["$rating", 5]
                            },
                            1,
                            0
                        ]
                    }
                },

                fourStar: {
                    $sum: {
                        $cond: [
                            {
                                $eq: ["$rating", 4]
                            },
                            1,
                            0
                        ]
                    }
                },

                threeStar: {
                    $sum: {
                        $cond: [
                            {
                                $eq: ["$rating", 3]
                            },
                            1,
                            0
                        ]
                    }
                },

                twoStar: {
                    $sum: {
                        $cond: [
                            {
                                $eq: ["$rating", 2]
                            },
                            1,
                            0
                        ]
                    }
                },

                oneStar: {
                    $sum: {
                        $cond: [
                            {
                                $eq: ["$rating", 1]
                            },
                            1,
                            0
                        ]
                    }
                }
            }
        },

        {
            $project: {
                _id: 0,

                totalReviews: 1,

                averageRating: {
                    $round: [
                        "$averageRating",
                        1
                    ]
                },

                fiveStar: 1,
                fourStar: 1,
                threeStar: 1,
                twoStar: 1,
                oneStar: 1
            }
        }

    ]);


    return result[0] || {
        totalReviews: 0,
        averageRating: 0,
        fiveStar: 0,
        fourStar: 0,
        threeStar: 0,
        twoStar: 0,
        oneStar: 0
    };

};


// ==========================================
// FIND ORDER FOR REVIEW
// ==========================================

export const findOrderForReview = async (
    orderId,
    userId
) => {

    const order = await Order.findOne({

        _id: orderId,

        user: userId

    }).select(
        "_id user orderItems status paymentStatus"
    );

    return order;

};