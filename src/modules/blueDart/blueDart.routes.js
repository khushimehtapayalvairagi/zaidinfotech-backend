import express from "express";

import {
    testBlueDartAuth,
} from "./blueDart.controller.js";

import { verifyToken } from "../../common/middleware/auth.middleware.js";

const router = express.Router();


/**
 * Test Blue Dart JWT authentication
 *
 * GET
 * /api/blue-dart/auth/test
 */
router.get(
    "/auth/test",
    verifyToken,
    testBlueDartAuth
);


export default router;