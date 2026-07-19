import * as orderService from "./order.service.js";




// =======================================
// CREATE ORDER
// =======================================

export const createOrder = async(req,res)=>{


    try{


        const userId = req.user._id;


        const orderData = {

            ...req.body,

            user:userId

        };



        const order =

        await orderService.createOrder(
            orderData
        );



        res.status(201).json({

            success:true,

            message:
            "Order created successfully",

            order

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
// GET MY ORDERS
// =======================================

export const getMyOrders = async(req,res)=>{


    try{


        const userId = req.user._id;



        const orders =

        await orderService.getUserOrders(
            userId
        );



        res.status(200).json({

            success:true,

            orders

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
// GET SINGLE ORDER
// =======================================

export const getOrderById = async(req,res)=>{


    try{


        const {id}=req.params;



        const order =

        await orderService.getOrderById(
            id
        );



        res.status(200).json({

            success:true,

            order

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
// UPDATE ORDER STATUS
// =======================================

export const updateOrderStatus = async(
    req,
    res
)=>{


    try{


        const {id}=req.params;


        const {status}=req.body;



        const order =

        await orderService.updateOrderStatus(

            id,

            status

        );



        res.status(200).json({

            success:true,

            message:
            "Order status updated",

            order

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
// UPDATE PAYMENT STATUS
// =======================================

export const updatePaymentStatus = async(
    req,
    res
)=>{


    try{


        const {id}=req.params;



        const {

            paymentStatus,

            paymentId

        } = req.body;




        const order =

        await orderService.updatePaymentStatus(

            id,

            paymentStatus,

            paymentId

        );



        res.status(200).json({

            success:true,

            message:
            "Payment status updated",

            order

        });



    }

    catch(error){


        res.status(400).json({

            success:false,

            message:error.message

        });


    }

};