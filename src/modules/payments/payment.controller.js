import * as paymentService from "./payment.service.js";




// =======================================
// CREATE PAYMENT
// =======================================

export const createPayment = async(req,res)=>{


    try{


        const userId = req.user._id;



        const paymentData = {


            ...req.body,


            user:userId


        };



        const payment =

        await paymentService.createPayment(

            paymentData

        );



        res.status(201).json({

            success:true,

            message:"Payment created successfully",

            payment

        });



    }

    catch(error){


        res.status(400).json({

            success:false,

            message:error.message

        });


    }

};




// =======================================
// GET PAYMENT BY ID
// =======================================

export const getPaymentById = async(req,res)=>{


    try{


        const {id}=req.params;



        const payment =

        await paymentService.getPaymentById(

            id

        );



        res.status(200).json({

            success:true,

            payment

        });



    }

    catch(error){


        res.status(404).json({

            success:false,

            message:error.message

        });


    }

};




// =======================================
// GET MY PAYMENTS
// =======================================

export const getMyPayments = async(req,res)=>{


    try{


        const userId = req.user._id;



        const payments =

        await paymentService.getUserPayments(

            userId

        );



        res.status(200).json({

            success:true,

            payments

        });



    }

    catch(error){


        res.status(400).json({

            success:false,

            message:error.message

        });


    }

};




// =======================================
// GET ALL PAYMENTS
// ADMIN
// =======================================

export const getAllPayments = async(req,res)=>{


    try{


        const payments =

        await paymentService.getAllPayments();



        res.status(200).json({

            success:true,

            payments

        });



    }

    catch(error){


        res.status(400).json({

            success:false,

            message:error.message

        });


    }

};




// =======================================
// PAYMENT SUCCESS
// =======================================

export const paymentSuccess = async(req,res)=>{


    try{


        const {id}=req.params;



        const {

            transactionId,

            gatewayResponse

        } = req.body;



        const payment =

        await paymentService.markPaymentSuccess(

            id,

            transactionId,

            gatewayResponse

        );



        res.status(200).json({

            success:true,

            message:"Payment successful",

            payment

        });



    }

    catch(error){


        res.status(400).json({

            success:false,

            message:error.message

        });


    }

};




// =======================================
// PAYMENT FAILED
// =======================================

export const paymentFailed = async(req,res)=>{


    try{


        const {id}=req.params;



        const {

            reason

        } = req.body;



        const payment =

        await paymentService.markPaymentFailed(

            id,

            reason

        );



        res.status(200).json({

            success:true,

            message:"Payment failed",

            payment

        });



    }

    catch(error){


        res.status(400).json({

            success:false,

            message:error.message

        });


    }

};




// =======================================
// REFUND PAYMENT
// =======================================

export const refundPayment = async(req,res)=>{


    try{


        const {id}=req.params;



        const payment =

        await paymentService.refundPayment(

            id

        );



        res.status(200).json({

            success:true,

            message:"Payment refunded",

            payment

        });



    }

    catch(error){


        res.status(400).json({

            success:false,

            message:error.message

        });


    }

};