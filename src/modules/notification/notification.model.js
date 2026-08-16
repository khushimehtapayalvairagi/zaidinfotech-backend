import mongoose from "mongoose";


const notificationSchema = new mongoose.Schema(

{

    // Kisko notification jaani hai

    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },


    // Notification type

    type:{
        type:String,
        enum:[
            "ORDER_PLACED",
            "PAYMENT",
            "ORDER_STATUS",
            "STOCK_LOW",
            "STOCK_OUT",
            "GENERAL"
        ],
        required:true
    },


    title:{
        type:String,
        required:true
    },


    message:{
        type:String,
        required:true
    },


    // Related record ka reference (order id, product id etc)

    relatedId:{
        type:mongoose.Schema.Types.ObjectId,
        default:null
    },


    relatedModel:{
        type:String,
        enum:[
            "Order",
            "Product",
            null
        ],
        default:null
    },


    // Read/Unread

    isRead:{
        type:Boolean,
        default:false
    }


},

{
    timestamps:true
}

);


// Fast query ke liye index

notificationSchema.index({
    user:1,
    createdAt:-1
});


const Notification = mongoose.model(
    "Notification",
    notificationSchema
);


export default Notification;