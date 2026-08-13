

// export default router;

import express from "express";
import { validate } from "../../common/middleware/validate.middleware.js";
import * as attendanceController from "./attendance.controller.js";
import {
    manualAttendanceValidation,
    biometricAttendanceValidation,
    checkoutValidation
} from "./attendance.validation.js";

const router = express.Router();

router.get("/", attendanceController.getAllAttendance);

router.post(
    "/manual",
    validate(manualAttendanceValidation),
    attendanceController.createManualAttendance
);

router.post(
    "/biometric",
    validate(biometricAttendanceValidation),
    attendanceController.processBiometricPunch
);

router.put(
    "/checkout",
    validate(checkoutValidation),
    attendanceController.processCheckout
);

export default router;