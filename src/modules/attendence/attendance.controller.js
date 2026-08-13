import * as attendanceService from "./attendance.service.js";

// 1. Create Manual Attendance
export const createManualAttendance = async (req, res, next) => {
    try {
        const attendanceData = req.body;
        const result = await attendanceService.markManualAttendance(attendanceData);

        return res.status(201).json({
            success: true,
            message: "Attendance marked successfully",
            data: result
        });
    } catch (error) {
        next(error);
    }
};

// 2. Fetch All Attendance Records
export const getAllAttendance = async (req, res, next) => {
    try {
        const records = await attendanceService.getAttendanceRecords();

        return res.status(200).json({
            success: true,
            data: records
        });
    } catch (error) {
        next(error);
    }
};

// 3. Biometric Machine Punch
export const processBiometricPunch = async (req, res, next) => {
    try {
        const punchData = req.body;
        const result = await attendanceService.markBiometricPunch(punchData);

        return res.status(200).json({
            success: true,
            message: "Biometric punch recorded successfully",
            data: result
        });
    } catch (error) {
        next(error);
    }
};

// 4. Employee Checkout
export const processCheckout = async (req, res, next) => {
    try {
        const { user, checkoutTime } = req.body;
        const result = await attendanceService.checkoutAttendance(user, checkoutTime);

        return res.status(200).json({
            success: true,
            message: "Checkout recorded successfully",
            data: result
        });
    } catch (error) {
        next(error);
    }
};