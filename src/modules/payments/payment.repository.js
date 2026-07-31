// import Payment from "./payment.model.js";



// // =======================================
// // CREATE PAYMENT
// // =======================================

// export const createPayment = async (paymentData) => {

//     const payment = new Payment(paymentData);

//     return await payment.save();

// };
// export const getPaymentCount = async () => {
//     return await Payment.countDocuments();
// };



// // =======================================
// // GET PAYMENT BY ID
// // =======================================

// export const getPaymentById = async (paymentId) => {

//     return await Payment.findById(paymentId)
//         .populate("user", "firstName lastName email");

// };



// // =======================================
// // GET PAYMENT BY REFERENCE
// // ORDER / REPAIR / RENTAL
// // =======================================

// export const getPaymentByReference = async (
//     paymentFor,
//     referenceId
// ) => {

//     return await Payment.findOne({

//     paymentFor,

//     referenceId,

//     isDeleted:false

// });

// };




// export const getUserPayments = async (userId) => {

//     return await Payment.find({

//         user: userId,

//         isDeleted: false

//     }).sort({

//         createdAt: -1

//     });

// };



// // =======================================
// // GET ALL PAYMENTS
// // =======================================

// export const getAllPayments = async () => {

//     return await Payment.find()

//         .populate("user", "firstName lastName email")

//         .sort({

//             createdAt: -1

//         });

// };





// export const updatePaymentStatus = async (

//     paymentId,

//     paymentStatus,

//     transactionId,

//     gatewayPaymentId,

//     gateway,

//     gatewayResponse,


//     failureReason

// ) => {

//   return await Payment.findByIdAndUpdate(
//     paymentId,
//     {
//         paymentStatus,
//         transactionId,
//         gatewayPaymentId,
//         gateway,
//         gatewayResponse,
//         paymentDate: new Date(),
//         paidAt: new Date(),
//         failureReason
//     },
//     {
//         new: true
//     }
// );

// };


// export const updateRefundStatus = async (

//     paymentId,

//     paymentStatus,

//     refundReason,

//     refundedAmount

// ) => {

//     return await Payment.findByIdAndUpdate(

//         paymentId,

//         {

//             paymentStatus,

//             refundReason,

//             refundedAmount,

//             refundedAt: new Date()

//         },

//         {

//             new: true

//         }

//     );

// };





import Payment from "./payment.model.js";


// =======================================
// CREATE PAYMENT
// =======================================

export const createPayment = async (
    paymentData
) => {

    const payment =
        new Payment(paymentData);

    return await payment.save();

};


// =======================================
// GET PAYMENT COUNT
// =======================================

export const getPaymentCount = async () => {

    return await Payment.countDocuments({

        isDeleted: false

    });

};


// =======================================
// GET PAYMENT BY ID
// =======================================

export const getPaymentById = async (
    paymentId
) => {

    return await Payment.findById(
        paymentId
    )
        .populate(
            "user",
            "firstName lastName email"
        );

};


// =======================================
// GET PAYMENT BY REFERENCE
// =======================================

export const getPaymentByReference = async (

    paymentFor,

    referenceId

) => {

    return await Payment.findOne({

        paymentFor,

        referenceId,

        isDeleted: false

    });

};


// =======================================
// GET USER PAYMENTS
// =======================================

export const getUserPayments = async (
    userId
) => {

    return await Payment.find({

        user: userId,

        isDeleted: false

    })
        .sort({

            createdAt: -1

        });

};


// =======================================
// GET ALL PAYMENTS
// =======================================

export const getAllPayments = async () => {

    return await Payment.find({

        isDeleted: false

    })
        .populate(
            "user",
            "firstName lastName email"
        )
        .sort({

            createdAt: -1

        });

};


// =======================================
// UPDATE PAYMENT STATUS
// =======================================

export const updatePaymentStatus = async (

    paymentId,

    paymentStatus,

    transactionId = "",

    gatewayPaymentId = "",

    gateway = "",

    gatewayResponse = {},

    failureReason = ""

) => {

    return await Payment.findByIdAndUpdate(

        paymentId,

        {

            paymentStatus,

            transactionId,

            gatewayPaymentId,

            gateway,

            gatewayResponse,

            failureReason,

            paymentDate: new Date(),

            paidAt:
                paymentStatus === "SUCCESS"
                    ? new Date()
                    : undefined

        },

        {

            new: true,

            runValidators: true

        }

    );

};


// =======================================
// UPDATE PAYMENT FAILED
// =======================================

export const updatePaymentFailed = async (

    paymentId,

    reason = ""

) => {

    return await Payment.findByIdAndUpdate(

        paymentId,

        {

            paymentStatus: "FAILED",

            failureReason: reason,

            paymentDate: new Date()

        },

        {

            new: true,

            runValidators: true

        }

    );

};


// =======================================
// UPDATE REFUND STATUS
// =======================================

export const updateRefundStatus = async (

    paymentId,

    paymentStatus,

    refundReason,

    refundedAmount

) => {

    return await Payment.findByIdAndUpdate(

        paymentId,

        {

            paymentStatus,

            refundReason,

            refundedAmount,

            refundedAt: new Date()

        },

        {

            new: true,

            runValidators: true

        }

    );

};