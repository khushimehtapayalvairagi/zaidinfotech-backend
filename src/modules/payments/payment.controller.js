// import * as paymentService from "./payment.service.js";
// import Order from "../orders/order.model.js";


// //Create Razorpay Order
// // =======================================
// // CREATE RAZORPAY ORDER
// // =======================================

// export const createRazorpayOrder = async (req, res) => {

//     try {

//         const {
//             orderId
//         } = req.body;


//         if (!orderId) {

//             return res.status(400).json({

//                 success: false,

//                 message: "Order ID is required"

//             });

//         }


//         // IMPORTANT:
//         // Apne order service/model ke according
//         // yahan order fetch karna hoga.

//         // const Order =
//         //     (await import("../orders/order.model.js"))
//         //         .default;


//         const order =
//             await Order.findById(orderId);


//         if (!order) {

//             return res.status(404).json({

//                 success: false,

//                 message: "Order not found"

//             });

//         }


//         const razorpayOrder =
//             await paymentService.createRazorpayPaymentOrder(

//                 order.totalAmount,

//                 `order_${order._id}`

//             );


//         return res.status(200).json({

//             success: true,

//             message:
//                 "Razorpay order created successfully",

//             order: razorpayOrder

//         });

//     }

//     catch (error) {

//         console.log(
//             "CREATE RAZORPAY ORDER ERROR:",
//             error
//         );

//         return res.status(400).json({

//             success: false,

//             message: error.message

//         });

//     }

// };



// // =======================================
// // VERIFY RAZORPAY PAYMENT
// // =======================================

// export const verifyRazorpayPaymentController = async (
//     req,
//     res
// ) => {

//     try {

//         const {

//             paymentId,

//             razorpayOrderId,

//             razorpayPaymentId,

//             razorpaySignature

//         } = req.body;


//         const payment =
//             await paymentService.verifyRazorpayPaymentService({

//                 paymentId,

//                 razorpayOrderId,

//                 razorpayPaymentId,

//                 razorpaySignature

//             });


//         return res.status(200).json({

//             success: true,

//             message:
//                 "Payment verified successfully",

//             payment

//         });

//     }

//     catch (error) {

//         console.log(
//             "VERIFY RAZORPAY PAYMENT ERROR:",
//             error
//         );

//         return res.status(400).json({

//             success: false,

//             message: error.message

//         });

//     }

// };


// // =======================================
// // CREATE PAYMENT
// // =======================================

// export const createPayment = async(req,res)=>{


//     try{


//         const userId = req.user._id;



//         const paymentData = {


//             ...req.body,


//             user:userId


//         };



//         const payment =

//         await paymentService.createPayment(

//             paymentData

//         );



//         res.status(201).json({

//             success:true,

//             message:"Payment created successfully",

//             payment

//         });



//     }

//     catch(error){


//         res.status(400).json({

//             success:false,

//             message:error.message

//         });


//     }

// };




// // =======================================
// // GET PAYMENT BY ID
// // =======================================

// export const getPaymentById = async(req,res)=>{


//     try{


//         const {id}=req.params;



//         const payment =

//         await paymentService.getPaymentById(

//             id

//         );



//         res.status(200).json({

//             success:true,

//             payment

//         });



//     }

//     catch(error){


//         res.status(404).json({

//             success:false,

//             message:error.message

//         });


//     }

// };




// // =======================================
// // GET MY PAYMENTS
// // =======================================

// export const getMyPayments = async(req,res)=>{


//     try{


//         const userId = req.user._id;



//         const payments =

//         await paymentService.getUserPayments(

//             userId

//         );



//         res.status(200).json({

//             success:true,

//             payments

//         });



//     }

//     catch(error){


//         res.status(400).json({

//             success:false,

//             message:error.message

//         });


//     }

// };




// // =======================================
// // GET ALL PAYMENTS
// // ADMIN
// // =======================================

// export const getAllPayments = async(req,res)=>{


//     try{


//         const payments =

//         await paymentService.getAllPayments();



//         res.status(200).json({

//             success:true,

//             payments

//         });



//     }

//     catch(error){


//         res.status(400).json({

//             success:false,

//             message:error.message

//         });


//     }

// };




// // =======================================
// // PAYMENT SUCCESS
// // =======================================

// export const paymentSuccess = async(req,res)=>{


//     try{


//         const {id}=req.params;



//         const {

// transactionId,

// gatewayPaymentId,

// gateway,

// gatewayResponse

// }= req.body;



//         const payment =

//         // await paymentService.markPaymentSuccess(

//         //     id,

//         //     transactionId,

//         //     gatewayResponse

//         // );

//         await paymentService.markPaymentSuccess(

//     id,

//     transactionId,

//     gatewayPaymentId,

//     gateway,

//     gatewayResponse

// );



//         res.status(200).json({

//             success:true,

//             message:"Payment successful",

//             payment

//         });



//     }

//     catch(error){


//         res.status(400).json({

//             success:false,

//             message:error.message

//         });


//     }

// };




// // =======================================
// // PAYMENT FAILED
// // =======================================

// export const paymentFailed = async(req,res)=>{


//     try{


//         const {id}=req.params;



//         const {

//             failureReason

//         } = req.body;



//         const payment =

//         await paymentService.markPaymentFailed(

//             id,

//                failureReason

//         );



//         res.status(200).json({

//             success:true,

//             message:"Payment failed",

//             payment

//         });



//     }

//     catch(error){


//         res.status(400).json({

//             success:false,

//             message:error.message

//         });


//     }

// };




// // =======================================
// // REFUND PAYMENT
// // =======================================

// export const refundPayment = async(req,res)=>{


//     try{

//         const { id } = req.params;
//         const {

//     refundReason,

//     refundedAmount

// } = req.body;

// const payment = await paymentService.refundPayment(

//     id,

//     refundReason,

//     refundedAmount

// );


//         // const {id}=req.params;



//         // const payment =

//         // await paymentService.refundPayment(

//         //     id
            

//         // );



//         res.status(200).json({

//             success:true,

//             message:"Payment refunded",

//             payment

//         });



//     }

//     catch(error){


//         res.status(400).json({

//             success:false,

//             message:error.message

//         });


//     }

// };





import * as paymentService
    from "./payment.service.js";

import Order
    from "../orders/order.model.js";


// =======================================
// CREATE RAZORPAY ORDER
// =======================================

export const createRazorpayOrder = async (
    req,
    res
) => {

    try {

        const {
            orderId
        } = req.body;

        console.log(
            "CREATE RAZORPAY ORDER REQUEST =",
            req.body
        );

        if (!orderId) {

            return res.status(400).json({

                success: false,

                message: "Order ID is required"

            });

        }

        // -----------------------------------
        // Find Order
        // -----------------------------------

        const order =
            await Order.findById(orderId);

        if (!order) {

            return res.status(404).json({

                success: false,

                message: "Order not found"

            });

        }

        console.log(
            "ORDER FOUND =",
            order._id,
            order.totalAmount
        );

        // -----------------------------------
        // Create Razorpay Order
        // -----------------------------------

        const razorpayOrder =
            await paymentService.createRazorpayPaymentOrder(

                order.totalAmount,

                `order_${order._id}`

            );

        console.log(
            "RAZORPAY ORDER CREATED =",
            razorpayOrder
        );

        // -----------------------------------
        // IMPORTANT RESPONSE
        // -----------------------------------

        return res.status(200).json({

            success: true,

            message:
                "Razorpay order created successfully",

            order: razorpayOrder,

            razorpayOrderId:
                razorpayOrder.id,

            amount:
                razorpayOrder.amount,

            currency:
                razorpayOrder.currency

        });

    }

    catch (error) {

        console.error(
            "CREATE RAZORPAY ORDER ERROR =",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                error.message ||
                "Unable to create Razorpay order"

        });

    }

};


// =======================================
// VERIFY RAZORPAY PAYMENT
// =======================================

export const verifyRazorpayPaymentController =
    async (
        req,
        res
    ) => {

        try {

            const {

                paymentId,

                razorpayOrderId,

                razorpayPaymentId,

                razorpaySignature

            } = req.body;

            console.log(
                "VERIFY PAYMENT REQUEST =",
                req.body
            );

            if (!paymentId) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Payment ID is required"

                });

            }

            if (!razorpayOrderId) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Razorpay Order ID is required"

                });

            }

            if (!razorpayPaymentId) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Razorpay Payment ID is required"

                });

            }

            if (!razorpaySignature) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Razorpay Signature is required"

                });

            }

            const payment =
                await paymentService.verifyRazorpayPaymentService({

                    paymentId,

                    razorpayOrderId,

                    razorpayPaymentId,

                    razorpaySignature

                });

            return res.status(200).json({

                success: true,

                message:
                    "Payment verified successfully",

                payment

            });

        }

        catch (error) {

            console.error(
                "VERIFY RAZORPAY PAYMENT ERROR =",
                error
            );

            return res.status(400).json({

                success: false,

                message:
                    error.message

            });

        }

    };


// =======================================
// CREATE PAYMENT
// =======================================

export const createPayment = async (
    req,
    res
) => {

    try {

        const userId =
            req.user._id;

        const paymentData = {

            ...req.body,

            user: userId

        };

        console.log(
            "CREATE PAYMENT DATA =",
            paymentData
        );

        const payment =
            await paymentService.createPayment(
                paymentData
            );

        return res.status(201).json({

            success: true,

            message:
                "Payment created successfully",

            payment

        });

    }

    catch (error) {

        console.error(
            "CREATE PAYMENT ERROR =",
            error
        );

        return res.status(400).json({

            success: false,

            message:
                error.message

        });

    }

};


// =======================================
// GET PAYMENT BY ID
// =======================================

export const getPaymentById = async (
    req,
    res
) => {

    try {

        const {
            id
        } = req.params;

        const payment =
            await paymentService.getPaymentById(
                id
            );

        return res.status(200).json({

            success: true,

            payment

        });

    }

    catch (error) {

        return res.status(404).json({

            success: false,

            message:
                error.message

        });

    }

};


// =======================================
// GET MY PAYMENTS
// =======================================

export const getMyPayments = async (
    req,
    res
) => {

    try {

        const userId =
            req.user._id;

        const payments =
            await paymentService.getUserPayments(
                userId
            );

        return res.status(200).json({

            success: true,

            payments

        });

    }

    catch (error) {

        return res.status(400).json({

            success: false,

            message:
                error.message

        });

    }

};


// =======================================
// GET ALL PAYMENTS
// =======================================

export const getAllPayments = async (
    req,
    res
) => {

    try {

        const payments =
            await paymentService.getAllPayments();

        return res.status(200).json({

            success: true,

            payments

        });

    }

    catch (error) {

        return res.status(400).json({

            success: false,

            message:
                error.message

        });

    }

};


// =======================================
// PAYMENT SUCCESS
// =======================================

export const paymentSuccess = async (
    req,
    res
) => {

    try {

        const {
            id
        } = req.params;

        const {

            transactionId,

            gatewayPaymentId,

            gateway,

            gatewayResponse

        } = req.body;

        const payment =
            await paymentService.markPaymentSuccess(

                id,

                transactionId,

                gatewayPaymentId,

                gateway,

                gatewayResponse

            );

        return res.status(200).json({

            success: true,

            message:
                "Payment successful",

            payment

        });

    }

    catch (error) {

        return res.status(400).json({

            success: false,

            message:
                error.message

        });

    }

};


// =======================================
// PAYMENT FAILED
// =======================================

export const paymentFailed = async (
    req,
    res
) => {

    try {

        const {
            id
        } = req.params;

        const {
            failureReason
        } = req.body;

        const payment =
            await paymentService.markPaymentFailed(

                id,

                failureReason

            );

        return res.status(200).json({

            success: true,

            message:
                "Payment failed",

            payment

        });

    }

    catch (error) {

        return res.status(400).json({

            success: false,

            message:
                error.message

        });

    }

};


// =======================================
// REFUND PAYMENT
// =======================================

export const refundPayment = async (
    req,
    res
) => {

    try {

        const {
            id
        } = req.params;

        const {

            refundReason,

            refundedAmount

        } = req.body;

        const payment =
            await paymentService.refundPayment(

                id,

                refundReason,

                refundedAmount

            );

        return res.status(200).json({

            success: true,

            message:
                "Payment refunded",

            payment

        });

    }

    catch (error) {

        return res.status(400).json({

            success: false,

            message:
                error.message

        });

    }

};