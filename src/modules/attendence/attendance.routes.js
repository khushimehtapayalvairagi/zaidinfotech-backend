import express from "express";

import { validate } from "../../common/middleware/validate.middleware.js";

import * as attendanceController from "./attendance.controller.js";

import {
    manualAttendanceValidation,
    biometricAttendanceValidation,
    checkoutValidation
} from "./attendance.validation.js";


const router = express.Router();


// =====================================================
// NORMAL ATTENDANCE
// =====================================================

router.get(
    "/",
    attendanceController.getAllAttendance
);


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



// =====================================================
// BIOMETRIC DEVICE / ADMS
// =====================================================


// Device initialization
router.get(
    "/cdata",
    attendanceController.biometricDeviceInitialization
);


// Device sends attendance
router.post(
    "/cdata",
    attendanceController.processBiometricDevicePush
);


// Device polling
router.get(
    "/getrequest",
    attendanceController.biometricGetRequest
);


// Device command response
router.post(
    "/devicecmd",
    attendanceController.biometricDeviceCommand
);


// Device registration
router.get(
    "/registry",
    attendanceController.biometricDeviceInitialization
);


router.post(
    "/registry",
    attendanceController.processBiometricDevicePush
);


export default router;