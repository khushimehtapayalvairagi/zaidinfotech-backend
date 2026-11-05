import express from "express";

import { verifyToken } from "../../common/middleware/auth.middleware.js";

import {
    createBranchController,
    getAllBranchesController,
    getBranchByIdController,
    updateBranchController,
    deleteBranchController
} from "./branch.controller.js";

const router = express.Router();

// Only SUPER_ADMIN and ADMIN can manage branches
const allowBranchManagement = (req, res, next) => {
    const role = String(req.user?.role || "").toUpperCase();

if (!["SUPER_ADMIN", "ADMIN", "SALES"].includes(role)) {        return res.status(403).json({
            success: false,
            message: "You are not authorized to manage branches."
        });
    }

    next();
};

// Active branch list can be used by authenticated staff dropdowns
router.get("/", verifyToken, getAllBranchesController);

router.get("/:id", verifyToken, getBranchByIdController);

router.post(
    "/",
    verifyToken,
    allowBranchManagement,
    createBranchController
);

router.put(
    "/:id",
    verifyToken,
    allowBranchManagement,
    updateBranchController
);

router.delete(
    "/:id",
    verifyToken,
    allowBranchManagement,
    deleteBranchController
);

export default router;