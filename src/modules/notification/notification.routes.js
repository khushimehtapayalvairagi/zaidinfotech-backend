import express from "express";

import {
    getMyNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification
} from "./notification.controller.js";

import {
    verifyToken
} from "../../common/middleware/auth.middleware.js";


const router = express.Router();


// =======================================
// GET MY NOTIFICATIONS
// =======================================

router.get(
    "/",
    verifyToken,
    getMyNotifications
);


// =======================================
// MARK SINGLE AS READ
// =======================================

router.patch(
    "/:id/read",
    verifyToken,
    markAsRead
);


// =======================================
// MARK ALL AS READ
// =======================================

router.patch(
    "/read-all",
    verifyToken,
    markAllAsRead
);


// =======================================
// DELETE NOTIFICATION
// =======================================

router.delete(
    "/:id",
    verifyToken,
    deleteNotification
);


export default router;