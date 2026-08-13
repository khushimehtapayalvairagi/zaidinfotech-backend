import mongoose from "mongoose";


const attendanceSchema = new mongoose.Schema(

    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },


        employeeId: {
            type: String,
            required: true
        },


        date: {
            type: Date,
            required: true
        },


        attendanceMode: {
            type: String,
            enum: [
                "MANUAL",
                "BIOMETRIC"
            ],
            default: "MANUAL"
        },


        biometricId: {
            type: String,
            default: ""
        },


        checkIn: {
            type: Date,
            default: null
        },


        checkOut: {
            type: Date,
            default: null
        },


        status: {
            type: String,
            enum: [
                "PRESENT",
                "ABSENT",
                "HALF_DAY",
                "LEAVE",
                "LATE"
            ],
            default: "PRESENT"
        },


        workingHours: {
            type: Number,
            default: 0
        },


        lateMinutes: {
            type: Number,
            default: 0
        },


        overtime: {
            type: Number,
            default: 0
        },


        remark: {
            type: String,
            default: ""
        },
        shift: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Shift",
            default: null
        },

        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }

    },

    {
        timestamps: true
    }

);



attendanceSchema.index(
    {
        user: 1,
        date: 1
    },
    {
        unique: true
    }
);



export default mongoose.model(
    "Attendance",
    attendanceSchema
);