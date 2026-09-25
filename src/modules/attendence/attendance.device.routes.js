import express from "express";

import * as attendanceController
    from "./attendance.controller.js";


const router = express.Router();


// =====================================================
// eSSL / ZKTeco ADMS DEVICE ROUTES
// =====================================================


// Device initialization / heartbeat
router.get(
    "/cdata",
    attendanceController
        .biometricDeviceInitialization
);


// Attendance data
router.post(
    "/cdata",
    attendanceController
        .processBiometricDevicePush
);


// Device command polling
router.get(
    "/getrequest",
    attendanceController
        .biometricGetRequest
);


// Device command result
router.post(
    "/devicecmd",
    attendanceController
        .biometricDeviceCommand
);


// Optional registry endpoint
router.get(
    "/registry",
    attendanceController
        .biometricDeviceInitialization
);


router.post(
    "/registry",
    attendanceController
        .processBiometricDevicePush
);


export default router;