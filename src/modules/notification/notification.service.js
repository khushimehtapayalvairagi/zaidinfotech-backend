// import * as notificationRepository from "./notification.repository.js";
// import Notification from "./notification.model.js";
// import User from "../users/user.model.js";     // ⚠️ apna actual path check kar lena


// // ================================
// // Create Notification (single user)
// // ================================

// export const createNotificationService = async(data)=>{

//     return await notificationRepository.createNotificationDB(data);

// };


// // ================================
// // Notify ALL Admins (bulk insert)
// // ================================

// export const notifyAdminsService = async(data)=>{

//     const admins = await User.find({
//         role:{ $in:["SUPER_ADMIN","ADMIN"] }
//     }).select("_id");

//     if(admins.length === 0) return;

//     const notifications = admins.map((admin)=>({
//         ...data,
//         user:admin._id
//     }));

//     await Notification.insertMany(notifications);

// };


// // ================================
// // Get My Notifications
// // ================================

// export const getMyNotificationsService = async(userId)=>{

//     const notifications =
//     await notificationRepository.getUserNotificationsDB(userId);

//     const unreadCount =
//     await notificationRepository.getUnreadCountDB(userId);

//     return { notifications, unreadCount };

// };


// // ================================
// // Mark as Read
// // ================================

// export const markAsReadService = async(id,userId)=>{

//     const notification =
//     await notificationRepository.markAsReadDB(id,userId);

//     if(!notification){
//         throw new Error("Notification not found");
//     }

//     return notification;

// };


// // ================================
// // Mark All as Read
// // ================================

// export const markAllAsReadService = async(userId)=>{

//     return await notificationRepository.markAllAsReadDB(userId);

// };


// // ================================
// // Delete Notification
// // ================================

// export const deleteNotificationService = async(id,userId)=>{

//     const notification =
//     await notificationRepository.deleteNotificationDB(id,userId);

//     if(!notification){
//         throw new Error("Notification not found");
//     }

//     return notification;

// };



import * as notificationRepository from "./notification.repository.js";
import Notification from "./notification.model.js";
import User from "../users/user.model.js";


// ======================================================
// CREATE NOTIFICATION FOR ONE USER
// ======================================================

export const createNotificationService = async (data) => {

    if (!data.user) {
        throw new Error("Notification user is required");
    }

    return await notificationRepository.createNotificationDB({
        ...data,
        isRead: false
    });

};


// ======================================================
// NOTIFY ALL ADMINS
// ======================================================

export const notifyAdminsService = async (data) => {

    const admins = await User.find({
        role: {
            $in: [
                "SUPER_ADMIN",
                "ADMIN"
            ]
        }
    }).select("_id");

    if (!admins || admins.length === 0) {
        return;
    }

    const notifications = admins.map((admin) => ({

        ...data,

        user: admin._id,

        isRead: false

    }));

    await Notification.insertMany(
        notifications
    );

};


// ======================================================
// GET MY NOTIFICATIONS
// ======================================================

export const getMyNotificationsService = async (
    userId
) => {

    const notifications =
        await notificationRepository
            .getUserNotificationsDB(userId);

    const unreadCount =
        await notificationRepository
            .getUnreadCountDB(userId);

    return {

        notifications,

        unreadCount

    };

};


// ======================================================
// MARK SINGLE AS READ
// ======================================================

export const markAsReadService = async (
    id,
    userId
) => {

    const notification =
        await notificationRepository
            .markAsReadDB(
                id,
                userId
            );

    if (!notification) {

        throw new Error(
            "Notification not found"
        );

    }

    return notification;

};


// ======================================================
// MARK ALL AS READ
// ======================================================

export const markAllAsReadService = async (
    userId
) => {

    return await notificationRepository
        .markAllAsReadDB(userId);

};


// ======================================================
// DELETE NOTIFICATION
// ======================================================

export const deleteNotificationService = async (
    id,
    userId
) => {

    const notification =
        await notificationRepository
            .deleteNotificationDB(
                id,
                userId
            );

    if (!notification) {

        throw new Error(
            "Notification not found"
        );

    }

    return notification;

};


// ======================================================
// NOTIFY ALL EMPLOYEES
// ======================================================

export const notifyEmployeesService = async (data) => {

    const employees = await User.find({
        status: "ACTIVE",
        isDeleted: false,

        role: {
            $nin: [
                "CUSTOMER",
            ]
        }
    }).select("_id");

    if (!employees || employees.length === 0) {
        return;
    }

    const notifications = employees.map((employee) => ({
        ...data,

        user: employee._id,

        isRead: false,
    }));

    await Notification.insertMany(
        notifications
    );
};