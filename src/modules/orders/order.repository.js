import Order from "./order.model.js";




// =======================================
// Create New Order
// =======================================

export const createOrder = async(orderData)=>{


    const order = new Order(orderData);


    return await order.save();

};




// =======================================
// Find Order By Id
// =======================================

export const findOrderById = async(orderId)=>{


    return await Order.findById(orderId)

    .populate(
        "user",
        "firstName lastName email"
    )

    .populate(
        "orderItems.product"
    );


};




// =======================================
// Find All Orders Of User
// =======================================

export const findOrdersByUserId = async(userId)=>{


    return await Order.find({

        user:userId

    })

    .populate(
        "orderItems.product"
    )

    .sort({

        createdAt:-1

    });


};




// =======================================
// Find All Orders (Admin)
// =======================================

export const findAllOrders = async()=>{


    return await Order.find()

    .populate(
        "user",
        "firstName lastName email"
    )

    .populate(
        "orderItems.product"
    )

    .sort({

        createdAt:-1

    });


};




// =======================================
// Update Order Status
// =======================================

export const updateOrderStatus = async(

    orderId,

    status

)=>{


    return await Order.findByIdAndUpdate(

        orderId,

        {

            orderStatus:status

        },

        {

            new:true

        }

    );


};




// =======================================
// Update Payment Status
// =======================================

export const updatePaymentStatus = async(

    orderId,

    paymentStatus,

    paymentId

)=>{


    return await Order.findByIdAndUpdate(

        orderId,

        {

            paymentStatus,

            paymentId

        },

        {

            new:true

        }

    );


};