import * as notificationService from "./notification.service.js";


// ================================
// Get My Notifications
// ================================

export const getMyNotifications = async(req,res)=>{

try{

    const result =
    await notificationService.getMyNotificationsService(
        req.user._id
    );

    res.status(200).json({
        success:true,
        ...result
    });

}
catch(error){

    res.status(400).json({
        success:false,
        message:error.message
    });

}

};


// ================================
// Mark As Read
// ================================

export const markAsRead = async(req,res)=>{

try{

    const notification =
    await notificationService.markAsReadService(
        req.params.id,
        req.user._id
    );

    res.status(200).json({
        success:true,
        message:"Marked as read",
        notification
    });

}
catch(error){

    res.status(400).json({
        success:false,
        message:error.message
    });

}

};


// ================================
// Mark All As Read
// ================================

export const markAllAsRead = async(req,res)=>{

try{

    await notificationService.markAllAsReadService(
        req.user._id
    );

    res.status(200).json({
        success:true,
        message:"All notifications marked as read"
    });

}
catch(error){

    res.status(400).json({
        success:false,
        message:error.message
    });

}

};


// ================================
// Delete Notification
// ================================

export const deleteNotification = async(req,res)=>{

try{

    await notificationService.deleteNotificationService(
        req.params.id,
        req.user._id
    );

    res.status(200).json({
        success:true,
        message:"Notification deleted"
    });

}
catch(error){

    res.status(400).json({
        success:false,
        message:error.message
    });

}

};