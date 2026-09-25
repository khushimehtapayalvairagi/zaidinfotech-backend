// import Attendance from "./attendance.model.js";
// import User from "../users/user.model.js";

// export const markManualAttendance = async (data) => {

//     const checkInTime = data.checkIn || new Date();

//     // Find employee
//     const employee = await User.findById(data.user);

//     if (!employee) {
//         throw new Error("Employee not found");
//     }

//     // Employee ke assigned shift ko get karo
//     const shiftId = employee.shift || null;

//     const record = await Attendance.create({
//         user: data.user,
//         employeeId: data.employeeId,
//         date: data.date,
//         status: data.status,
//         attendanceMode: data.attendanceMode || "MANUAL",
//         checkIn: checkInTime,
//         remark: data.remark || "",
//         shift: shiftId
//     });

//     return await Attendance.findById(record._id)
//         .populate(
//             "user",
//             "firstName lastName employeeId biometricId department designation"
//         )
//         .populate(
//             "shift",
//             "name startTime endTime breakDuration lateAllowedMinutes"
//         );
// };

// export const getAttendanceRecords = async () => {
//     return await Attendance.find()
//         .populate("user", "firstName lastName email department")
//         .sort({ createdAt: -1 })
//         .lean();
// };

// export const markBiometricPunch = async ({ employeeId, biometricId, punchTime }) => {
//     const dateStr = new Date().toISOString().split("T")[0];

//     let existingRecord = await Attendance.findOne({ employeeId, date: dateStr });

//     if (!existingRecord) {
//         return await Attendance.create({
//             employeeId,
//             biometricId,
//             date: dateStr,
//             checkIn: punchTime || new Date(),
//             status: "PRESENT",
//             attendanceMode: "BIOMETRIC"
//         });
//     } else {
//         existingRecord.checkOut = punchTime || new Date();
//         return await existingRecord.save();
//     }
// };

// export const checkoutAttendance = async (userId, checkoutTime) => {
//     const dateStr = new Date().toISOString().split("T")[0];

//     const record = await Attendance.findOne({ user: userId, date: dateStr });
//     if (!record) {
//         throw new Error("No check-in record found for today.");
//     }

//     record.checkOut = checkoutTime || new Date();

//     // Calculate working hours if checkIn exists
//     if (record.checkIn) {
//         const diffMs = new Date(record.checkOut) - new Date(record.checkIn);
//         record.workingHours = Number((diffMs / (1000 * 60 * 60)).toFixed(2));
//     }

//     return await record.save();
// };


import Attendance from "./attendance.model.js";
import User from "../users/user.model.js";


// =====================================================
// HELPER
// Get start of attendance day
// =====================================================

const getStartOfDay = (date = new Date()) => {
    const d = new Date(date);

    d.setHours(0, 0, 0, 0);

    return d;
};


// =====================================================
// HELPER
// Get next day
// =====================================================

const getNextDay = (date = new Date()) => {
    const d = getStartOfDay(date);

    d.setDate(d.getDate() + 1);

    return d;
};


// =====================================================
// 1. MANUAL ATTENDANCE
// Existing functionality preserved
// =====================================================

export const markManualAttendance = async (data) => {

    const checkInTime =
        data.checkIn
            ? new Date(data.checkIn)
            : new Date();

    const employee = await User.findById(data.user);

    if (!employee) {
        throw new Error("Employee not found");
    }

    const shiftId = employee.shift || null;

    const attendanceDate =
        getStartOfDay(data.date || checkInTime);

    const record = await Attendance.findOneAndUpdate(
        {
            user: data.user,
            date: attendanceDate
        },
        {
            user: data.user,
            employeeId:
                data.employeeId ||
                employee.employeeId,

            date: attendanceDate,

            status:
                data.status ||
                "PRESENT",

            attendanceMode:
                data.attendanceMode ||
                "MANUAL",

            biometricId:
                data.biometricId ||
                employee.biometricId ||
                "",

            checkIn: checkInTime,

            remark:
                data.remark ||
                "",

            shift: shiftId
        },
        {
            new: true,
            upsert: true,
            setDefaultsOnInsert: true
        }
    );

    return await Attendance.findById(record._id)
        .populate(
            "user",
            "firstName lastName employeeId biometricId department designation"
        )
        .populate(
            "shift",
            "name startTime endTime breakDuration lateAllowedMinutes"
        );
};


// =====================================================
// 2. GET ALL ATTENDANCE
// Existing functionality preserved
// =====================================================

export const getAttendanceRecords = async () => {

    return await Attendance.find()
        .populate(
            "user",
            "firstName lastName email department employeeId biometricId"
        )
        .populate(
            "shift",
            "name startTime endTime lateAllowedMinutes"
        )
        .sort({
            date: -1,
            createdAt: -1
        })
        .lean();
};


// =====================================================
// 3. FIND USER FROM BIOMETRIC DATA
// =====================================================

const findEmployeeFromBiometric = async ({
    employeeId,
    biometricId
}) => {

    let employee = null;

    // First preference: employeeId
    if (employeeId) {

        employee = await User.findOne({
            employeeId: String(employeeId).trim()
        });
    }

    // Second preference: biometricId
    if (!employee && biometricId) {

        employee = await User.findOne({
            biometricId: String(biometricId).trim()
        });
    }

    return employee;
};


// =====================================================
// 4. BIOMETRIC PUNCH
// Used by JSON/API testing also
// =====================================================

export const markBiometricPunch = async ({
    employeeId,
    biometricId,
    punchTime,
    punchType,
    deviceSerialNumber,
    verifyMode
}) => {

    const actualPunchTime =
        punchTime
            ? new Date(punchTime)
            : new Date();

    if (Number.isNaN(actualPunchTime.getTime())) {
        throw new Error("Invalid punch time");
    }

    const employee =
        await findEmployeeFromBiometric({
            employeeId,
            biometricId
        });

    if (!employee) {
        throw new Error(
            `Employee not found for biometric ID / employee ID: ${employeeId || biometricId}`
        );
    }

    const attendanceDate =
        getStartOfDay(actualPunchTime);

    let record = await Attendance.findOne({
        user: employee._id,
        date: attendanceDate
    });

    // =================================================
    // FIRST PUNCH = CHECK IN
    // =================================================

    if (!record) {

        record = await Attendance.create({

            user: employee._id,

            employeeId:
                employee.employeeId,

            date:
                attendanceDate,

            attendanceMode:
                "BIOMETRIC",

            biometricId:
                employee.biometricId ||
                biometricId ||
                employee.employeeId,

            deviceSerialNumber:
                deviceSerialNumber ||
                "",

            checkIn:
                actualPunchTime,

            checkOut:
                null,

            status:
                "PRESENT",

            remark:
                verifyMode !== undefined
                    ? `Biometric verification mode: ${verifyMode}`
                    : ""
        });

        return await Attendance.findById(record._id)
            .populate(
                "user",
                "firstName lastName employeeId biometricId department designation"
            )
            .populate(
                "shift",
                "name startTime endTime lateAllowedMinutes"
            );
    }


    // =================================================
    // EXPLICIT CHECK-IN
    // =================================================

    if (punchType === "CHECK_IN") {

        if (!record.checkIn) {
            record.checkIn = actualPunchTime;
        }

        record.attendanceMode = "BIOMETRIC";

        await record.save();

        return record;
    }


    // =================================================
    // EXPLICIT CHECK-OUT
    // =================================================

    if (punchType === "CHECK_OUT") {

        record.checkOut = actualPunchTime;

        if (record.checkIn) {

            const diffMs =
                new Date(record.checkOut) -
                new Date(record.checkIn);

            record.workingHours =
                Number(
                    (
                        diffMs /
                        (1000 * 60 * 60)
                    ).toFixed(2)
                );
        }

        record.attendanceMode = "BIOMETRIC";

        await record.save();

        return record;
    }


    // =================================================
    // AUTO MODE
    // If no explicit punch type:
    //
    // checkIn exists + checkout empty
    // => checkout
    //
    // otherwise create/update check-in
    // =================================================

    if (
        record.checkIn &&
        !record.checkOut
    ) {

        record.checkOut =
            actualPunchTime;

        const diffMs =
            new Date(record.checkOut) -
            new Date(record.checkIn);

        record.workingHours =
            Number(
                (
                    diffMs /
                    (1000 * 60 * 60)
                ).toFixed(2)
            );

    } else if (!record.checkIn) {

        record.checkIn =
            actualPunchTime;
    }

    record.attendanceMode =
        "BIOMETRIC";

    await record.save();

    return await Attendance.findById(record._id)
        .populate(
            "user",
            "firstName lastName employeeId biometricId department designation"
        )
        .populate(
            "shift",
            "name startTime endTime lateAllowedMinutes"
        );
};


// =====================================================
// 5. CHECKOUT
// Existing functionality preserved
// =====================================================

export const checkoutAttendance = async (
    userId,
    checkoutTime
) => {

    const actualCheckoutTime =
        checkoutTime
            ? new Date(checkoutTime)
            : new Date();

    const attendanceDate =
        getStartOfDay(actualCheckoutTime);

    const record =
        await Attendance.findOne({
            user: userId,
            date: attendanceDate
        });

    if (!record) {
        throw new Error(
            "No check-in record found for today."
        );
    }

    record.checkOut =
        actualCheckoutTime;

    if (record.checkIn) {

        const diffMs =
            new Date(record.checkOut) -
            new Date(record.checkIn);

        record.workingHours =
            Number(
                (
                    diffMs /
                    (1000 * 60 * 60)
                ).toFixed(2)
            );
    }

    return await record.save();
};


// =====================================================
// 6. PROCESS RAW BIOMETRIC ATTLOG
// Device sends this through /iclock/cdata
// =====================================================

export const processBiometricDeviceData = async ({
    rawBody,
    serialNumber
}) => {

    if (!rawBody) {
        return {
            processed: 0,
            records: []
        };
    }

    const text =
        String(rawBody)
            .replace(/\r/g, "");

    const lines =
        text
            .split("\n")
            .map(line => line.trim())
            .filter(Boolean);

    const processedRecords = [];

    for (const line of lines) {

        // ---------------------------------------------
        // Ignore protocol metadata
        // ---------------------------------------------

        if (
            line === "ATTLOG" ||
            line.startsWith("ATTLOG ")
        ) {
            continue;
        }

        if (
            line.startsWith("USER ") ||
            line.startsWith("FP ") ||
            line.startsWith("OPLOG ")
        ) {
            continue;
        }


        // ---------------------------------------------
        // ADMS ATTLOG:
        //
        // PIN
        // DATE TIME
        // STATUS
        // VERIFY
        // WORKCODE
        // ---------------------------------------------

        const fields =
            line.split("\t");

        if (fields.length < 2) {
            continue;
        }

        const machineUserId =
            String(fields[0] || "").trim();

        const punchTimeString =
            String(fields[1] || "").trim();

        if (
            !machineUserId ||
            !punchTimeString
        ) {
            continue;
        }


        // ---------------------------------------------
        // Date
        // ---------------------------------------------

        const punchTime =
            new Date(
                punchTimeString.replace(
                    " ",
                    "T"
                )
            );

        if (
            Number.isNaN(
                punchTime.getTime()
            )
        ) {
            console.warn(
                "Invalid biometric punch time:",
                punchTimeString
            );

            continue;
        }


        // ---------------------------------------------
        // Device values
        // ---------------------------------------------

        const statusValue =
            fields[2] !== undefined
                ? String(fields[2]).trim()
                : "";

        const verifyMode =
            fields[3] !== undefined
                ? String(fields[3]).trim()
                : "";


        // ---------------------------------------------
        // Standard ADMS:
        //
        // STATUS 0 = CHECK IN
        // STATUS 1 = CHECK OUT
        //
        // But if device doesn't provide useful
        // status, AUTO mode is used.
        // ---------------------------------------------

        let punchType = null;

        if (statusValue === "0") {
            punchType = "CHECK_IN";
        }

        if (statusValue === "1") {
            punchType = "CHECK_OUT";
        }


        // ---------------------------------------------
        // Find employee
        // ---------------------------------------------

        const employee =
            await findEmployeeFromBiometric({
                employeeId:
                    machineUserId,

                biometricId:
                    machineUserId
            });

        if (!employee) {

            console.error(
                `Biometric employee not found: ${machineUserId}`
            );

            processedRecords.push({
                machineUserId,
                success: false,
                error:
                    "Employee not found"
            });

            continue;
        }


        // ---------------------------------------------
        // Mark attendance
        // ---------------------------------------------

        const attendance =
            await markBiometricPunch({

                employeeId:
                    employee.employeeId,

                biometricId:
                    employee.biometricId ||
                    machineUserId,

                punchTime,

                punchType,

                deviceSerialNumber:
                    serialNumber,

                verifyMode
            });


        processedRecords.push({

            machineUserId,

            employeeId:
                employee.employeeId,

            success: true,

            attendanceId:
                attendance._id,

            punchType,

            punchTime
        });
    }

    return {
        processed:
            processedRecords.filter(
                item => item.success
            ).length,

        records:
            processedRecords
    };
};