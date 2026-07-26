import * as paymentRepository from "./payment.repository.js";

import {
    PAYMENT_STATUS
} from "../../common/constants/paymentStatus.js";
import {
    createRazorpayOrder,
    verifyRazorpayPayment
} from "./razorpay.service.js";

// =======================================
// CREATE RAZORPAY ORDER
// =======================================

export const createRazorpayPaymentOrder = async (

    amount,
    receipt

) => {

    return await createRazorpayOrder({

        amount,

        receipt

    });

};


// =======================================
// VERIFY RAZORPAY PAYMENT
// =======================================

export const verifyRazorpayPaymentService = async ({

    paymentId,

    razorpayOrderId,

    razorpayPaymentId,

    razorpaySignature

}) => {


    const payment =
        await paymentRepository.getPaymentById(
            paymentId
        );


    if (!payment) {

        throw new Error(
            "Payment not found"
        );

    }


    const isValid =
        verifyRazorpayPayment({

            razorpayOrderId,

            razorpayPaymentId,

            razorpaySignature

        });


    if (!isValid) {

        throw new Error(
            "Invalid Razorpay payment signature"
        );

    }


    return await paymentRepository.updatePaymentStatus(

        paymentId,

        PAYMENT_STATUS.SUCCESS,

        razorpayPaymentId,

        razorpayPaymentId,

        "RAZORPAY",

        {

            razorpayOrderId,

            razorpayPaymentId,

            razorpaySignature

        }

    );

};


// =======================================
// CREATE PAYMENT
// =======================================

export const createPayment = async (paymentData) => {

    // Generate Receipt Number
    paymentData.receiptNumber = await generateReceiptNumber();

    // Default Currency
    if (!paymentData.currency) {
        paymentData.currency = "INR";
    }

    return await paymentRepository.createPayment(paymentData);

};

const generateReceiptNumber = async () => {

    const count = await paymentRepository.getPaymentCount();

    const nextNumber = count + 1;

    return `PAY${new Date().getFullYear()}${String(nextNumber).padStart(6, "0")}`;

};


// =======================================
// GET PAYMENT BY ID
// =======================================

export const getPaymentById = async(paymentId)=>{


    const payment =

    await paymentRepository.getPaymentById(
        paymentId
    );


    if(!payment){

        throw new Error(
            "Payment not found"
        );

    }


    return payment;

};




// =======================================
// GET PAYMENT BY REFERENCE
// ORDER / REPAIR / RENTAL
// =======================================

export const getPaymentByReference = async(

    paymentFor,

    referenceId

)=>{


    const payment =

    await paymentRepository.getPaymentByReference(

        paymentFor,

        referenceId

    );


    return payment;

};




// =======================================
// GET USER PAYMENTS
// =======================================

export const getUserPayments = async(userId)=>{


    return await paymentRepository.getUserPayments(
        userId
    );

};




// =======================================
// GET ALL PAYMENTS
// ADMIN
// =======================================

export const getAllPayments = async()=>{


    return await paymentRepository.getAllPayments();

};




// =======================================
// MARK PAYMENT SUCCESS
// =======================================

export const markPaymentSuccess = async(

    paymentId,

   transactionId,

gatewayPaymentId,

gateway,



gatewayResponse

)=>{


    const payment =

    await paymentRepository.getPaymentById(
        paymentId
    );



    if(!payment){

        throw new Error(
            "Payment not found"
        );

    }



  return await paymentRepository.updatePaymentStatus(

    paymentId,

    PAYMENT_STATUS.SUCCESS,

    transactionId,

    gatewayPaymentId,

    gateway,

    gatewayResponse

);

};




// =======================================
// MARK PAYMENT FAILED
// =======================================

export const markPaymentFailed = async(

    paymentId,

    reason

)=>{


    const payment =

    await paymentRepository.getPaymentById(
        paymentId
    );



    if(!payment){

        throw new Error(
            "Payment not found"
        );

    }
return await paymentRepository.updatePaymentFailed(

    paymentId,

    reason

);



//    return await paymentRepository.updatePaymentStatus(

//     paymentId,

//     PAYMENT_STATUS.FAILED,

//     failureReason

// );

};




// =======================================
// REFUND PAYMENT
// =======================================

// export const refundPayment = async(paymentId)=>{


//     const payment =

//     await paymentRepository.getPaymentById(
//        refundPayment(

// paymentId,

// refundReason,

// refundedAmount

// )
//     );



//     if(!payment){

//         throw new Error(
//             "Payment not found"
//         );

//     }



//   return await paymentRepository.updateRefundStatus(

//     paymentId,

//     PAYMENT_STATUS.REFUNDED,

//     refundReason,

//     refundedAmount

// );

// };

export const refundPayment = async (

    paymentId,

    refundReason,

    refundedAmount

)=>{

    const payment = await paymentRepository.getPaymentById(

        paymentId

    );

    if(!payment){

        throw new Error("Payment not found");

    }

    return await paymentRepository.updateRefundStatus(

        paymentId,

        PAYMENT_STATUS.REFUNDED,

        refundReason,

        refundedAmount

    );

};

// =======================================
// GET PAYMENT COUNT
// =======================================

export const getPaymentCount = async () => {
       return await paymentRepository.getPaymentCount({

    // return await Payment.countDocuments({

        isDeleted: false

    });

};