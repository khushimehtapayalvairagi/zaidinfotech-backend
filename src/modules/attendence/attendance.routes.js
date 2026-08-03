import express from "express";


import {

manualAttendance,

biometricAttendance,

checkout,

getAttendance

}
from "./attendance.controller.js";


import {
validate
}
from "../../common/middleware/validate.middleware.js";


import {

manualAttendanceValidation,

biometricAttendanceValidation,

checkoutValidation

}
from "./attendance.validation.js";


import {
allowRoles
}
from "../../common/middleware/role.middleware.js";

import {

    verifyToken

} from "../../common/middleware/auth.middleware.js";



const router = express.Router();



// ==========================================
// Manual Attendance
// Only Admin can mark attendance
// ==========================================

router.post(
"/manual",

 verifyToken,

allowRoles(
"SUPER_ADMIN",
"ADMIN"
),

validate(manualAttendanceValidation),

manualAttendance

);




// ==========================================
// Biometric Attendance
// Machine API
// ==========================================

router.post(
"/biometric",

validate(biometricAttendanceValidation),

biometricAttendance

);




// ==========================================
// Checkout
// Employee/Admin
// ==========================================

router.put(
"/checkout",

 verifyToken,

validate(checkoutValidation),

checkout

);




// ==========================================
// Attendance List
// ==========================================

router.get(
"/",

 verifyToken,

getAttendance

);



export default router;