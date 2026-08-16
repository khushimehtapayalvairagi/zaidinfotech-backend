import express from "express";

import {
    getMyNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification
} from "./notification.controller.js";

import { verifyToken } from "../../common/middleware/auth.middleware.js";


const router = express.Router();


// Get My Notifications + Unread Count

router.get(
    "/",
    verifyToken,
    getMyNotifications
);


// Mark Single Notification as Read

router.patch(
    "/:id/read",
    verifyToken,
    markAsRead
);


// Mark All as Read

router.patch(
    "/read-all",
    verifyToken,
    markAllAsRead
);


// Delete Notification

router.delete(
    "/:id",
    verifyToken,
    deleteNotification
);


export default router;