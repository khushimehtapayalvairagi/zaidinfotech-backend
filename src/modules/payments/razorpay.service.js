import Razorpay from "razorpay";
import crypto from "crypto";

import dotenv from "dotenv";
dotenv.config();

// console.log("KEY_ID:", process.env.RAZORPAY_KEY_ID);
// console.log("KEY_SECRET:", process.env.RAZORPAY_KEY_SECRET);

const razorpay = new Razorpay({

    key_id: process.env.RAZORPAY_KEY_ID,

    key_secret: process.env.RAZORPAY_KEY_SECRET

});


// =======================================
// CREATE RAZORPAY ORDER
// =======================================


export const createRazorpayOrder = async ({
    amount,
    receipt
}) => {

    const options = {

        amount: Math.round(amount * 100),

        currency: "INR",

        receipt

    };

    const razorpayOrder =
        await razorpay.orders.create(options);

    return razorpayOrder;

};


// =======================================
// VERIFY RAZORPAY PAYMENT
// =======================================

export const verifyRazorpayPayment = ({

    razorpayOrderId,

    razorpayPaymentId,

    razorpaySignature

}) => {

  
       const body = `${razorpayOrderId}|${razorpayPaymentId}`;

    const expectedSignature =
        crypto

            .createHmac(
                "sha256",
                process.env.RAZORPAY_KEY_SECRET
            )

            .update(body)

            .digest("hex");


    return expectedSignature === razorpaySignature;

};