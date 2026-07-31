import Razorpay from "razorpay";
import crypto from "crypto";
import dotenv from "dotenv";

dotenv.config();


// =======================================
// ENV
// =======================================

const razorpayKeyId =
    process.env.RAZORPAY_KEY_ID;

const razorpayKeySecret =
    process.env.RAZORPAY_KEY_SECRET;


if (!razorpayKeyId) {

    throw new Error(
        "RAZORPAY_KEY_ID is missing in backend .env"
    );

}

if (!razorpayKeySecret) {

    throw new Error(
        "RAZORPAY_KEY_SECRET is missing in backend .env"
    );

}


// =======================================
// RAZORPAY INSTANCE
// =======================================

const razorpay =
    new Razorpay({

        key_id:
            razorpayKeyId,

        key_secret:
            razorpayKeySecret,

    });


// =======================================
// CREATE RAZORPAY ORDER
// =======================================

export const createRazorpayOrder = async ({

    amount,

    receipt,

}) => {

    try {

        const numericAmount =
            Number(amount);

        if (
            !Number.isFinite(numericAmount) ||
            numericAmount <= 0
        ) {

            throw new Error(
                "Invalid payment amount"
            );

        }

        if (!receipt) {

            throw new Error(
                "Receipt is required"
            );

        }

        const options = {

            amount:
                Math.round(
                    numericAmount * 100
                ),

            currency:
                "INR",

            receipt:
                String(receipt),

        };

        console.log(
            "RAZORPAY CREATE ORDER OPTIONS =",
            options
        );

        const razorpayOrder =
            await razorpay.orders.create(
                options
            );

        console.log(
            "RAZORPAY CREATED ORDER =",
            razorpayOrder
        );

        return razorpayOrder;

    }

    catch (error) {

        console.error(
            "RAZORPAY CREATE ORDER ERROR =",
            error.response?.data ||
            error.message ||
            error
        );

        throw new Error(

            error.response?.data?.error?.description ||
            error.message ||
            "Unable to create Razorpay order"

        );

    }

};


// =======================================
// VERIFY RAZORPAY PAYMENT
// =======================================

export const verifyRazorpayPayment = ({

    razorpayOrderId,

    razorpayPaymentId,

    razorpaySignature,

}) => {

    try {

        if (
            !razorpayOrderId ||
            !razorpayPaymentId ||
            !razorpaySignature
        ) {

            return false;

        }

        const body =
            `${razorpayOrderId}|${razorpayPaymentId}`;

        const expectedSignature =
            crypto
                .createHmac(
                    "sha256",
                    razorpayKeySecret
                )
                .update(body)
                .digest("hex");

        return (
            expectedSignature ===
            razorpaySignature
        );

    }

    catch (error) {

        console.error(
            "RAZORPAY VERIFY ERROR =",
            error.message
        );

        return false;

    }

};