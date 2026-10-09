






import express from "express";

import {
    getItSupportProfile,
    updateItSupportProfile,
    changeItSupportPassword,
} from "./itsupport.controller.js";

import {
    verifyToken,
} from "../../common/middleware/auth.middleware.js";

const router = express.Router();


// =====================================================
// GET IT SUPPORT PROFILE
// =====================================================

router.get(
    "/profile",
    verifyToken,
    getItSupportProfile
);


// =====================================================
// UPDATE IT SUPPORT PROFILE
// EMAIL OPTIONAL
// =====================================================

router.put(
    "/profile",
    verifyToken,
    updateItSupportProfile
);


// =====================================================
// CHANGE PASSWORD
// =====================================================

router.put(
    "/change-password",
    verifyToken,
    changeItSupportPassword
);


export default router;