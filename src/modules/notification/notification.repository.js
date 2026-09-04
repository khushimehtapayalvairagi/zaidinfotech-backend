// import Notification from "./notification.model.js";


// // ================================
// // Create Notification
// // ================================

// export const createNotificationDB = async(data)=>{

//     return await Notification.create(data);

// };


// // ================================
// // Get User Notifications
// // ================================

// export const getUserNotificationsDB = async(userId)=>{

//     return await Notification.find({
//         user:userId
//     })
//     .sort({
//         createdAt:-1
//     })
//     .limit(50);

// };


// // ================================
// // Get Unread Count
// // ================================

// export const getUnreadCountDB = async(userId)=>{

//     return await Notification.countDocuments({
//         user:userId,
//         isRead:false
//     });

// };


// // ================================
// // Mark Single as Read
// // ================================

// export const markAsReadDB = async(id,userId)=>{

//     return await Notification.findOneAndUpdate(

//         { _id:id, user:userId },

//         { isRead:true },

//         { new:true }

//     );

// };


// // ================================
// // Mark All as Read
// // ================================

// export const markAllAsReadDB = async(userId)=>{

//     return await Notification.updateMany(

//         { user:userId, isRead:false },

//         { isRead:true }

//     );

// };


// // ================================
// // Delete Notification
// // ================================

// export const deleteNotificationDB = async(id,userId)=>{

//     return await Notification.findOneAndDelete({
//         _id:id,
//         user:userId
//     });

// };


import Notification from "./notification.model.js";

// ==========================================
// CREATE
// ==========================================

export const createNotificationDB = async (
  data
) => {
  return await Notification.create(data);
};

// ==========================================
// GET USER NOTIFICATIONS
// ==========================================

export const getUserNotificationsDB = async (
  userId
) => {
  return await Notification.find({
    user: userId,
  })
    .sort({
      createdAt: -1,
    })
    .limit(50);
};

// ==========================================
// UNREAD COUNT
// ==========================================

export const getUnreadCountDB = async (
  userId
) => {
  return await Notification.countDocuments({
    user: userId,
    isRead: false,
  });
};

// ==========================================
// MARK ONE READ
// ==========================================

export const markAsReadDB = async (
  id,
  userId
) => {
  return await Notification.findOneAndUpdate(
    {
      _id: id,
      user: userId,
    },
    {
      isRead: true,
    },
    {
      new: true,
    }
  );
};

// ==========================================
// MARK ALL READ
// ==========================================

export const markAllAsReadDB = async (
  userId
) => {
  return await Notification.updateMany(
    {
      user: userId,
      isRead: false,
    },
    {
      isRead: true,
    }
  );
};

// ==========================================
// DELETE
// ==========================================

export const deleteNotificationDB = async (
  id,
  userId
) => {
  return await Notification.findOneAndDelete({
    _id: id,
    user: userId,
  });
};