import Attendance from "./attendance.model.js";


// Create Attendance

export const createAttendanceDB = (data) => {

    return Attendance.create(data);

};



// Find Attendance List

export const findAttendanceDB = (filter = {}) => {

    return Attendance.find(filter)
        .populate(
            "user",
            "firstName lastName employeeId biometricId department designation"
        )
        .populate(
            "shift",
            "name startTime endTime lateAllowedMinutes"
        )
        .sort({
            date: -1
        });

};



// Find Single Attendance

export const findOneAttendanceDB = (filter) => {

    return Attendance.findOne(filter)
        .populate(
            "user",
            "firstName lastName employeeId"
        )
        .populate(
            "shift",
            "name startTime endTime lateAllowedMinutes"
        );

};



// Update Attendance

export const updateAttendanceDB = (id, data) => {

    return Attendance.findByIdAndUpdate(
        id,
        data,
        {
            new:true
        }
    );

};



// Delete Attendance

export const deleteAttendanceDB = (id) => {

    return Attendance.findByIdAndDelete(id);

};



// Monthly Attendance Report

export const monthlyAttendanceDB = (filter) => {

    return Attendance.aggregate(filter);

};