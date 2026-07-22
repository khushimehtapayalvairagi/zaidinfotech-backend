import Payment from "./payment.model.js";



// =======================================
// CREATE PAYMENT
// =======================================

export const createPayment = async (paymentData) => {

    const payment = new Payment(paymentData);

    return await payment.save();

};



// =======================================
// GET PAYMENT BY ID
// =======================================

export const getPaymentById = async (paymentId) => {

    return await Payment.findById(paymentId)
        .populate("user", "firstName lastName email");

};



// =======================================
// GET PAYMENT BY REFERENCE
// ORDER / REPAIR / RENTAL
// =======================================

export const getPaymentByReference = async (
    paymentFor,
    referenceId
) => {

    return await Payment.findOne({

    paymentFor,

    referenceId,

    isDeleted:false

});

};



// =======================================
// GET USER PAYMENTS
// =======================================

export const getUserPayments = async (userId) => {

 Payment.find({

    user:userId,

    isDeleted:false

}).sort({

        createdAt: -1

    });

};



// =======================================
// GET ALL PAYMENTS
// =======================================

export const getAllPayments = async () => {

    return await Payment.find()

        .populate("user", "firstName lastName email")

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

    gatewayResponse = {}

) => {

    return await Payment.findByIdAndUpdate(

        paymentId,

        {

            paymentStatus,

            transactionId,

            gatewayResponse,

          paymentDate:new Date(),

           paidAt:new Date()

        },

        {

            new: true

        }

    );

};



// =======================================
// UPDATE REFUND STATUS
// =======================================

export const updateRefundStatus = async (

    paymentId,

    paymentStatus

) => {

    return await Payment.findByIdAndUpdate(

        paymentId,

   {

paymentStatus,

refundReason,

refundedAmount,

refundedAt:new Date()

},

        {

            new: true

        }

    );

};