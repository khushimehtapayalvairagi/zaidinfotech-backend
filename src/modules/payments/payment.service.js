import * as paymentRepository from "./payment.repository.js";

import {
    PAYMENT_STATUS
} from "../../common/constants/paymentStatus.js";




// =======================================
// CREATE PAYMENT
// =======================================

export const createPayment = async(paymentData)=>{


    const payment =

    await paymentRepository.createPayment(
        paymentData
    );


    return payment;

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



    return await paymentRepository.updatePaymentStatus(

        paymentId,

        PAYMENT_STATUS.FAILED,

        "",

        {

            reason

        }

    );

};




// =======================================
// REFUND PAYMENT
// =======================================

export const refundPayment = async(paymentId)=>{


    const payment =

    await paymentRepository.getPaymentById(
        paymentId
    );



    if(!payment){

        throw new Error(
            "Payment not found"
        );

    }



    return await paymentRepository.updateRefundStatus(

        paymentId,

        PAYMENT_STATUS.REFUNDED

    );

};