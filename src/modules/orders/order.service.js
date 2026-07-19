import * as orderRepository from "./order.repository.js";



// =======================================
// CREATE ORDER
// =======================================

export const createOrder = async(orderData)=>{


    const order = await orderRepository.createOrder(
        orderData
    );


    return order;

};




// =======================================
// GET ORDER BY ID
// =======================================

export const getOrderById = async(orderId)=>{


    const order = await orderRepository.findOrderById(
        orderId
    );


    if(!order){

        throw new Error(
            "Order not found"
        );

    }


    return order;

};




// =======================================
// GET USER ORDERS
// =======================================

export const getUserOrders = async(userId)=>{


    const orders = 
    await orderRepository.findOrdersByUserId(
        userId
    );


    return orders;

};




// =======================================
// GET ALL ORDERS (ADMIN)
// =======================================

export const getAllOrders = async()=>{


    const orders =
    await orderRepository.findAllOrders();


    return orders;

};




// =======================================
// UPDATE ORDER STATUS
// =======================================

export const updateOrderStatus = async(

    orderId,

    status

)=>{


    const order =

    await orderRepository.findOrderById(
        orderId
    );



    if(!order){

        throw new Error(
            "Order not found"
        );

    }



    const updatedOrder =

    await orderRepository.updateOrderStatus(

        orderId,

        status

    );



    return updatedOrder;

};




// =======================================
// UPDATE PAYMENT STATUS
// =======================================

export const updatePaymentStatus = async(

    orderId,

    paymentStatus,

    paymentId

)=>{


    const order =

    await orderRepository.findOrderById(
        orderId
    );



    if(!order){

        throw new Error(
            "Order not found"
        );

    }



    const updatedOrder =

    await orderRepository.updatePaymentStatus(

        orderId,

        paymentStatus,

        paymentId

    );



    return updatedOrder;

};