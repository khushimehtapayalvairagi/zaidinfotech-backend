import Attendance from "./attendance.model.js";

export const markManualAttendance = async (data) => {
    const checkInTime = data.checkIn || new Date();

    const record = await Attendance.create({
        user: data.user,
        employeeId: data.employeeId,
        date: data.date,
        status: data.status,
        attendanceMode: data.attendanceMode || "MANUAL",
        checkIn: checkInTime,
        remark: data.remark || ""
    });

    return record;
};

export const getAttendanceRecords = async () => {
    return await Attendance.find()
        .populate("user", "firstName lastName email department")
        .sort({ createdAt: -1 })
        .lean();
};

export const markBiometricPunch = async ({ employeeId, biometricId, punchTime }) => {
    const dateStr = new Date().toISOString().split("T")[0];

    let existingRecord = await Attendance.findOne({ employeeId, date: dateStr });

    if (!existingRecord) {
        return await Attendance.create({
            employeeId,
            biometricId,
            date: dateStr,
            checkIn: punchTime || new Date(),
            status: "PRESENT",
            attendanceMode: "BIOMETRIC"
        });
    } else {
        existingRecord.checkOut = punchTime || new Date();
        return await existingRecord.save();
    }
};

export const checkoutAttendance = async (userId, checkoutTime) => {
    const dateStr = new Date().toISOString().split("T")[0];

    const record = await Attendance.findOne({ user: userId, date: dateStr });
    if (!record) {
        throw new Error("No check-in record found for today.");
    }

    record.checkOut = checkoutTime || new Date();

    // Calculate working hours if checkIn exists
    if (record.checkIn) {
        const diffMs = new Date(record.checkOut) - new Date(record.checkIn);
        record.workingHours = Number((diffMs / (1000 * 60 * 60)).toFixed(2));
    }

    return await record.save();
};