
import express from "express";
import {
    getItSupportProfile,
    updateItSupportProfile,
    changeItSupportPassword,
} from "./itsupport.controller.js";
import { verifyToken } from "../../common/middleware/auth.middleware.js";

const router = express.Router();

router.get("/profile", verifyToken, getItSupportProfile);
router.put("/profile", verifyToken, updateItSupportProfile);
router.put("/change-password", verifyToken, changeItSupportPassword);

export default router;




