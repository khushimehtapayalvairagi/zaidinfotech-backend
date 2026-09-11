
import express from "express";
import { verifyToken } from "../../common/middleware/auth.middleware.js";
import {
    getReceptionistProfile,
    updateReceptionistProfile,
    changeReceptionistPassword,
} from "./receptionist.controller.js";

const router = express.Router();

router.get("/profile", verifyToken, getReceptionistProfile);
router.put("/profile", verifyToken, updateReceptionistProfile);
router.put("/change-password", verifyToken, changeReceptionistPassword);

export default router;