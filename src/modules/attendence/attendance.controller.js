// import * as attendanceService from "./attendance.service.js";

// // 1. Create Manual Attendance
// export const createManualAttendance = async (req, res, next) => {
//     try {
//         const attendanceData = req.body;
//         const result = await attendanceService.markManualAttendance(attendanceData);

//         return res.status(201).json({
//             success: true,
//             message: "Attendance marked successfully",
//             data: result
//         });
//     } catch (error) {
//         next(error);
//     }
// };

// // 2. Fetch All Attendance Records
// export const getAllAttendance = async (req, res, next) => {
//     try {
//         const records = await attendanceService.getAttendanceRecords();

//         return res.status(200).json({
//             success: true,
//             data: records
//         });
//     } catch (error) {
//         next(error);
//     }
// };

// // 3. Biometric Machine Punch
// export const processBiometricPunch = async (req, res, next) => {
//     try {
//         const punchData = req.body;
//         const result = await attendanceService.markBiometricPunch(punchData);

//         return res.status(200).json({
//             success: true,
//             message: "Biometric punch recorded successfully",
//             data: result
//         });
//     } catch (error) {
//         next(error);
//     }
// };

// // 4. Employee Checkout
// export const processCheckout = async (req, res, next) => {
//     try {
//         const { user, checkoutTime } = req.body;
//         const result = await attendanceService.checkoutAttendance(user, checkoutTime);

//         return res.status(200).json({
//             success: true,
//             message: "Checkout recorded successfully",
//             data: result
//         });
//     } catch (error) {
//         next(error);
//     }
// };



import * as attendanceService from "./attendance.service.js";


// =====================================================
// 1. CREATE MANUAL ATTENDANCE
// =====================================================

export const createManualAttendance = async (
    req,
    res,
    next
) => {

    try {

        const attendanceData =
            req.body;

        const result =
            await attendanceService
                .markManualAttendance(
                    attendanceData
                );

        return res.status(201).json({

            success: true,

            message:
                "Attendance marked successfully",

            data:
                result
        });

    } catch (error) {

        next(error);
    }
};


// =====================================================
// 2. FETCH ALL ATTENDANCE
// =====================================================

export const getAllAttendance = async (
    req,
    res,
    next
) => {

    try {

        const records =
            await attendanceService
                .getAttendanceRecords();

        return res.status(200).json({

            success: true,

            data:
                records
        });

    } catch (error) {

        next(error);
    }
};


// =====================================================
// 3. EXISTING JSON BIOMETRIC API
// DO NOT REMOVE
// =====================================================

export const processBiometricPunch = async (
    req,
    res,
    next
) => {

    try {

        const punchData =
            req.body;

        const result =
            await attendanceService
                .markBiometricPunch(
                    punchData
                );

        return res.status(200).json({

            success: true,

            message:
                "Biometric punch recorded successfully",

            data:
                result
        });

    } catch (error) {

        next(error);
    }
};


// =====================================================
// 4. EMPLOYEE CHECKOUT
// =====================================================

export const processCheckout = async (
    req,
    res,
    next
) => {

    try {

        const {
            user,
            checkoutTime
        } = req.body;

        const result =
            await attendanceService
                .checkoutAttendance(
                    user,
                    checkoutTime
                );

        return res.status(200).json({

            success: true,

            message:
                "Checkout recorded successfully",

            data:
                result
        });

    } catch (error) {

        next(error);
    }
};


// =====================================================
// 5. DEVICE PUSH
// POST /iclock/cdata
// =====================================================

export const processBiometricDevicePush = async (
    req,
    res,
    next
) => {

    try {

        const serialNumber =
            req.query.SN ||
            req.query.sn ||
            "";

        const table =
            String(
                req.query.table ||
                "ATTLOG"
            ).toUpperCase();

        const rawBody =
            typeof req.body === "string"
                ? req.body
                : JSON.stringify(req.body);


        console.log(
            "================================="
        );

        console.log(
            "BIOMETRIC DEVICE PUSH"
        );

        console.log(
            "SN:",
            serialNumber
        );

        console.log(
            "TABLE:",
            table
        );

        console.log(
            "BODY:",
            rawBody
        );

        console.log(
            "================================="
        );


        // ---------------------------------------------
        // Attendance logs
        // ---------------------------------------------

        if (table === "ATTLOG") {

            const result =
                await attendanceService
                    .processBiometricDeviceData({

                        rawBody,

                        serialNumber
                    });

            console.log(
                "BIOMETRIC RESULT:",
                result
            );
        }


        // ---------------------------------------------
        // Device expects plain text OK
        // ---------------------------------------------

        return res
            .status(200)
            .type("text/plain")
            .send("OK");

    } catch (error) {

        console.error(
            "Biometric push error:",
            error
        );

        // IMPORTANT:
        // Device should get a response instead
        // of hanging/retrying forever.
        return res
            .status(200)
            .type("text/plain")
            .send("OK");
    }
};


// =====================================================
// 6. DEVICE INITIALIZATION / HEARTBEAT
// GET /iclock/cdata
// =====================================================

export const biometricDeviceInitialization = async (
    req,
    res,
    next
) => {

    try {

        const serialNumber =
            req.query.SN ||
            req.query.sn ||
            "UNKNOWN";


        console.log(
            "Biometric device connected:",
            serialNumber
        );


        /*
         * Basic ADMS configuration.
         *
         * This tells the device to use
         * real-time transaction transfer.
         */

        const response = [
            `GET OPTION FROM: ${serialNumber}`,
            "Stamp=9999",
            `OpStamp=${Math.floor(Date.now() / 1000)}`,
            "ErrorDelay=30",
            "Delay=10",
            "TransInterval=1",
            "Realtime=1",
            "Encrypt=None"
        ].join("\n");


        return res
            .status(200)
            .type("text/plain")
            .send(response);

    } catch (error) {

        next(error);
    }
};


// =====================================================
// 7. DEVICE COMMAND POLLING
// =====================================================

export const biometricGetRequest = async (
    req,
    res,
    next
) => {

    try {

        const serialNumber =
            req.query.SN ||
            req.query.sn ||
            "";

        console.log(
            "Biometric device polling:",
            serialNumber
        );

        return res
            .status(200)
            .type("text/plain")
            .send("OK");

    } catch (error) {

        next(error);
    }
};


// =====================================================
// 8. DEVICE COMMAND RESULT
// =====================================================

export const biometricDeviceCommand = async (
    req,
    res,
    next
) => {

    try {

        console.log(
            "Biometric device command result:",
            req.query.SN ||
            req.query.sn ||
            ""
        );

        console.log(
            req.body
        );

        return res
            .status(200)
            .type("text/plain")
            .send("OK");

    } catch (error) {

        next(error);
    }
};