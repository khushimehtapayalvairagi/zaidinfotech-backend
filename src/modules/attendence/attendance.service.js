import User from "../users/user.model.js";

import * as attendanceRepository 
from "./attendance.repository.js";


// ==================================================
// Helper: Calculate Late Minutes
// ==================================================

const calculateLateMinutes = (
    checkIn,
    shift
)=>{

    if(!shift || !checkIn){
        return 0;
    }


    const shiftStart =
    new Date(checkIn);


    const [hours,minutes] =
    shift.startTime.split(":");


    shiftStart.setHours(
        Number(hours),
        Number(minutes),
        0
    );


    const difference =
    (checkIn - shiftStart)
    /
    (1000 * 60);



    if(
        difference > shift.lateAllowedMinutes
    ){
        return Math.floor(difference);
    }


    return 0;

};




// ==================================================
// Helper: Calculate Working Hours
// ==================================================

const calculateWorkingHours = (
    checkIn,
    checkOut
)=>{


    if(!checkIn || !checkOut){
        return 0;
    }


    const diff =
    (checkOut - checkIn)
    /
    (1000 * 60 * 60);


    return Number(
        diff.toFixed(2)
    );

};




// ==================================================
// Manual Attendance
// ==================================================

export const createManualAttendance = async(data)=>{


    const user =
    await User.findById(data.user)
    .populate("shift");



    if(!user){

        throw new Error(
            "Employee not found"
        );

    }



    const todayStart =
    new Date();

    todayStart.setHours(
        0,0,0,0
    );


    const todayEnd =
    new Date();

    todayEnd.setHours(
        23,59,59,999
    );



    const existing =
    await attendanceRepository.findOneAttendanceDB({

        user:user._id,

        date:{
            $gte:todayStart,
            $lte:todayEnd
        }

    });



    if(existing){

        throw new Error(
            "Attendance already marked for today"
        );

    }



    const attendance =
    await attendanceRepository.createAttendanceDB({

        user:user._id,

        employeeId:user.employeeId,

        shift:user.shift?._id,

        date:new Date(),

        attendanceMode:"MANUAL",

        status:data.status,

        remark:data.remark || ""

    });



    return attendance;

};




// ==================================================
// Biometric Attendance
// ==================================================

export const createBiometricAttendance = async(data)=>{


    const user =
    await User.findOne({

        biometricId:data.biometricId

    })
    .populate("shift");



    if(!user){

        throw new Error(
            "Biometric employee not found"
        );

    }



    const checkIn =
    new Date(data.punchTime);



    const lateMinutes =
    calculateLateMinutes(
        checkIn,
        user.shift
    );



    const attendance =
    await attendanceRepository.createAttendanceDB({

        user:user._id,

        employeeId:user.employeeId,

        shift:user.shift?._id,

        biometricId:user.biometricId,

        date:new Date(),

        attendanceMode:"BIOMETRIC",

        checkIn,

        status:
        lateMinutes > 0
        ?
        "LATE"
        :
        "PRESENT",


        lateMinutes

    });



    return attendance;

};




// ==================================================
// Check Out
// ==================================================

export const checkoutAttendance = async(data)=>{


    const attendance =
    await attendanceRepository
    .findOneAttendanceDB({

        user:data.user,

        date:{
            $gte:new Date(
                new Date()
                .setHours(0,0,0,0)
            ),

            $lte:new Date(
                new Date()
                .setHours(23,59,59,999)
            )
        }

    });



    if(!attendance){

        throw new Error(
            "Today's attendance not found"
        );

    }



    const checkOut =
    new Date();



    const workingHours =
    calculateWorkingHours(
        attendance.checkIn,
        checkOut
    );



    return attendanceRepository.updateAttendanceDB(
        attendance._id,
        {
            checkOut,
            workingHours
        }
    );


};




// ==================================================
// Get Attendance
// ==================================================

export const getAllAttendance = async(filter)=>{


    return attendanceRepository.findAttendanceDB(
        filter
    );

};