// import Razorpay from "razorpay";
// import crypto from "crypto";
// import dotenv from "dotenv";

// dotenv.config();


// // =======================================
// // ENV
// // =======================================

// const razorpayKeyId =
//     process.env.RAZORPAY_KEY_ID;

// const razorpayKeySecret =
//     process.env.RAZORPAY_KEY_SECRET;


// if (!razorpayKeyId) {

//     throw new Error(
//         "RAZORPAY_KEY_ID is missing in backend .env"
//     );

// }

// if (!razorpayKeySecret) {

//     throw new Error(
//         "RAZORPAY_KEY_SECRET is missing in backend .env"
//     );

// }


// // =======================================
// // RAZORPAY INSTANCE
// // =======================================

// const razorpay =
//     new Razorpay({

//         key_id:
//             razorpayKeyId,

//         key_secret:
//             razorpayKeySecret,

//     });


// // =======================================
// // CREATE RAZORPAY ORDER
// // =======================================

// // export const createRazorpayOrder = async ({

// //     amount,

// //     receipt,

// // }) => {

// //     try {

// //         const numericAmount =
// //             Number(amount);

// //         if (
// //             !Number.isFinite(numericAmount) ||
// //             numericAmount <= 0
// //         ) {

// //             throw new Error(
// //                 "Invalid payment amount"
// //             );

// //         }

// //         if (!receipt) {

// //             throw new Error(
// //                 "Receipt is required"
// //             );

// //         }

// //         const options = {

// //             amount:
// //                 Math.round(
// //                     numericAmount * 100
// //                 ),

// //             currency:
// //                 "INR",

// //             receipt:
// //                 String(receipt),

// //         };

// //         console.log(
// //             "RAZORPAY CREATE ORDER OPTIONS =",
// //             options
// //         );

// //         const razorpayOrder =
// //             await razorpay.orders.create(
// //                 options
// //             );

// //         console.log(
// //             "RAZORPAY CREATED ORDER =",
// //             razorpayOrder
// //         );

// //         return razorpayOrder;

// //     }

// //     catch (error) {

// //         console.error(
// //             "RAZORPAY CREATE ORDER ERROR =",
// //             error.response?.data ||
// //             error.message ||
// //             error
// //         );

// //         throw new Error(

// //             error.response?.data?.error?.description ||
// //             error.message ||
// //             "Unable to create Razorpay order"

// //         );

// //     }

// // };
// // =====================================================
// // CREATE RAZORPAY ORDER
// // =====================================================

// export const createRazorpayOrder = async (
//     orderId,
//     amount
// ) => {

//     try {

//         if (!orderId) {

//             throw new Error(
//                 "Order ID is required"
//             );

//         }


//         if (
//             amount === undefined ||
//             amount === null ||
//             !Number.isFinite(Number(amount)) ||
//             Number(amount) <= 0
//         ) {

//             throw new Error(
//                 "Valid payment amount is required"
//             );

//         }


//         const finalAmount =
//             Math.round(
//                 Number(amount) * 100
//             ) / 100;


//         console.log(
//             "CREATE RAZORPAY ORDER"
//         );

//         console.log(
//             "ORDER ID:",
//             orderId
//         );

//         console.log(
//             "FINAL PAYMENT AMOUNT:",
//             finalAmount
//         );


//         const response =
//             await axios.post(

//                 `${API}/razorpay/order`,

//                 {
//                     orderId:
//                         orderId,

//                     amount:
//                         finalAmount
//                 },

//                 {
//                     headers:
//                         getHeaders()
//                 }

//             );


//         console.log(
//             "CREATE RAZORPAY ORDER RESPONSE:",
//             response.data
//         );


//         return response.data;

//     }

//     catch (error) {

//         console.error(
//             "CREATE RAZORPAY ORDER ERROR:",
//             error?.response?.data ||
//             error?.message
//         );


//         throw (
//             error?.response?.data ||
//             {
//                 success: false,

//                 message:
//                     error?.message ||
//                     "Unable to create Razorpay order"
//             }
//         );

//     }

// };



// // =======================================
// // VERIFY RAZORPAY PAYMENT
// // =======================================

// export const verifyRazorpayPayment = ({

//     razorpayOrderId,

//     razorpayPaymentId,

//     razorpaySignature,

// }) => {

//     try {

//         if (
//             !razorpayOrderId ||
//             !razorpayPaymentId ||
//             !razorpaySignature
//         ) {

//             return false;

//         }

//         const body =
//             `${razorpayOrderId}|${razorpayPaymentId}`;

//         const expectedSignature =
//             crypto
//                 .createHmac(
//                     "sha256",
//                     razorpayKeySecret
//                 )
//                 .update(body)
//                 .digest("hex");

//         return (
//             expectedSignature ===
//             razorpaySignature
//         );

//     }

//     catch (error) {

//         console.error(
//             "RAZORPAY VERIFY ERROR =",
//             error.message
//         );

//         return false;

//     }

// };




import Razorpay from "razorpay";
import crypto from "crypto";
import dotenv from "dotenv";

dotenv.config();


// =====================================================
// ENVIRONMENT
// =====================================================

const razorpayKeyId =
    process.env.RAZORPAY_KEY_ID;

const razorpayKeySecret =
    process.env.RAZORPAY_KEY_SECRET;


// =====================================================
// ENV VALIDATION
// =====================================================

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


// =====================================================
// RAZORPAY INSTANCE
// =====================================================

const razorpay =
    new Razorpay({

        key_id:
            razorpayKeyId,

        key_secret:
            razorpayKeySecret,

    });


// =====================================================
// CREATE RAZORPAY ORDER
//
// IMPORTANT:
// This is BACKEND code.
// Do NOT use axios/API/getHeaders here.
//
// Input:
// {
//     amount,
//     receipt
// }
//
// amount = rupees
//
// Razorpay requires amount in paise.
// =====================================================

export const createRazorpayOrder = async ({

    amount,

    receipt,

}) => {

    try {

        // ---------------------------------------------
        // AMOUNT VALIDATION
        // ---------------------------------------------

        const numericAmount =
            Number(amount);


        if (
            !Number.isFinite(
                numericAmount
            ) ||
            numericAmount <= 0
        ) {

            throw new Error(
                "Invalid Razorpay payment amount"
            );

        }


        // ---------------------------------------------
        // RECEIPT
        // ---------------------------------------------

        if (!receipt) {

            throw new Error(
                "Razorpay receipt is required"
            );

        }


        // ---------------------------------------------
        // RUPEES -> PAISE
        // ---------------------------------------------

        const amountInPaise =
            Math.round(
                numericAmount * 100
            );


        if (
            !Number.isInteger(
                amountInPaise
            ) ||
            amountInPaise <= 0
        ) {

            throw new Error(
                "Invalid Razorpay amount in paise"
            );

        }


        // ---------------------------------------------
        // RAZORPAY OPTIONS
        // ---------------------------------------------

        const options = {

            amount:
                amountInPaise,

            currency:
                "INR",

            receipt:
                String(receipt),

        };


        console.log(
            "=========================================="
        );

        console.log(
            "RAZORPAY CREATE ORDER"
        );

        console.log(
            "RAZORPAY KEY ID:",
            razorpayKeyId
        );

        console.log(
            "AMOUNT RUPEES:",
            numericAmount
        );

        console.log(
            "AMOUNT PAISE:",
            amountInPaise
        );

        console.log(
            "RECEIPT:",
            options.receipt
        );

        console.log(
            "OPTIONS:",
            options
        );

        console.log(
            "=========================================="
        );


        // ---------------------------------------------
        // CREATE ORDER
        // ---------------------------------------------

        const razorpayOrder =
            await razorpay.orders.create(
                options
            );


        // ---------------------------------------------
        // SUCCESS LOG
        // ---------------------------------------------

        console.log(
            "=========================================="
        );

        console.log(
            "RAZORPAY ORDER CREATED SUCCESSFULLY"
        );

        console.log(
            "RAZORPAY ORDER:",
            razorpayOrder
        );

        console.log(
            "=========================================="
        );


        return razorpayOrder;

    }

    catch (error) {

        console.error(
            "=========================================="
        );

        console.error(
            "RAZORPAY CREATE ORDER ERROR"
        );

        console.error(
            "ERROR MESSAGE:",
            error?.message
        );

        console.error(
            "ERROR RESPONSE:",
            error?.response?.data
        );

        console.error(
            "ERROR STATUS:",
            error?.response?.status
        );

        console.error(
            "FULL ERROR:",
            error
        );

        console.error(
            "=========================================="
        );


        const razorpayMessage =
            error?.error?.description ||
            error?.response?.data?.error?.description ||
            error?.response?.data?.message ||
            error?.message ||
            "Unable to create Razorpay order";


        throw new Error(
            razorpayMessage
        );

    }

};


// =====================================================
// VERIFY RAZORPAY PAYMENT
// =====================================================

export const verifyRazorpayPayment = ({

    razorpayOrderId,

    razorpayPaymentId,

    razorpaySignature,

}) => {

    try {

        // ---------------------------------------------
        // VALIDATION
        // ---------------------------------------------

        if (
            !razorpayOrderId ||
            !razorpayPaymentId ||
            !razorpaySignature
        ) {

            return false;

        }


        // ---------------------------------------------
        // RAZORPAY SIGNATURE BODY
        // ---------------------------------------------

        const body =
            `${razorpayOrderId}|${razorpayPaymentId}`;


        // ---------------------------------------------
        // CREATE HMAC
        // ---------------------------------------------

        const expectedSignature =
            crypto
                .createHmac(
                    "sha256",
                    razorpayKeySecret
                )
                .update(body)
                .digest("hex");


        // ---------------------------------------------
        // SAFE COMPARISON
        // ---------------------------------------------

        return (
            expectedSignature ===
            razorpaySignature
        );

    }

    catch (error) {

        console.error(
            "RAZORPAY VERIFY ERROR:",
            error?.message
        );

        return false;

    }

};