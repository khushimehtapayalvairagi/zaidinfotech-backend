import Notification from "./notification.model.js";
import * as notificationRepository from "./notification.repository.js";
import User from "../users/user.model.js";


// ======================================================
// CREATE NOTIFICATION FOR ONE USER
// ======================================================

export const createNotificationService = async (data) => {

    if (!data?.user) {
        throw new Error("Notification user is required");
    }

    return await notificationRepository.createNotificationDB({
        ...data,
        isRead: false,
    });
};


// ======================================================
// NOTIFY ONE USER
// ======================================================

export const notifyUserService = async ({
    userId,
    type,
    title,
    message,
    relatedId = null,
    relatedModel = null,
}) => {

    if (!userId) {
        return null;
    }

    return await createNotificationService({

        user: userId,

        type,

        title,

        message,

        relatedId,

        relatedModel,

        isRead: false,

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
                "ADMIN",
            ],
        },

    }).select("_id");


    if (!admins || admins.length === 0) {

        console.log(
            "NO ADMIN FOUND FOR NOTIFICATION"
        );

        return [];

    }


    const notifications =
        admins.map((admin) => ({

            ...data,

            user: admin._id,

            isRead: false,

        }));


    return await Notification.insertMany(
        notifications
    );
};


// ======================================================
// NOTIFY ALL ACTIVE EMPLOYEES
// ======================================================

// export const notifyEmployeesService = async (data) => {

//     const employees = await User.find({

//         status: "ACTIVE",

//         isDeleted: false,

//         role: {
//             $nin: [
//                 "CUSTOMER",
//             ],
//         },

//     }).select("_id");


//     if (!employees || employees.length === 0) {

//         return [];

//     }


//     const notifications =
//         employees.map((employee) => ({

//             ...data,

//             user: employee._id,

//             isRead: false,

//         }));


//     return await Notification.insertMany(
//         notifications
//     );
// };

export const notifyEmployeesService = async (data) => {

  const employees = await User.find({
    status: "ACTIVE",
    isDeleted: false,

    role: {
      $nin: [
        "CUSTOMER",
        "SUPER_ADMIN",
        "ADMIN",
      ],
    },
  }).select("_id");

  if (!employees.length) {
    return [];
  }

  const notifications =
    employees.map((employee) => ({
      ...data,
      user: employee._id,
      isRead: false,
    }));

  return await Notification.insertMany(
    notifications
  );
};

// ======================================================
// GET MY NOTIFICATIONS
// ======================================================

export const getMyNotificationsService =
async (userId) => {

    const notifications =
        await notificationRepository
            .getUserNotificationsDB(userId);


    const unreadCount =
        await notificationRepository
            .getUnreadCountDB(userId);


    return {

        notifications,

        unreadCount,

    };

};


// ======================================================
// MARK ONE READ
// ======================================================

export const markAsReadService =
async (
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
// MARK ALL READ
// ======================================================

export const markAllAsReadService =
async (userId) => {

    return await notificationRepository
        .markAllAsReadDB(userId);

};


// ======================================================
// DELETE NOTIFICATION
// ======================================================

export const deleteNotificationService =
async (
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