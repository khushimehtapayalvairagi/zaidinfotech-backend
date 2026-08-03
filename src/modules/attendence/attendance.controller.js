import {

createManualAttendance,

createBiometricAttendance,

checkoutAttendance,

getAllAttendance

}
from "./attendance.service.js";




// ==================================================
// Manual Attendance
// ==================================================

export const manualAttendance = async(req,res)=>{

try{


const attendance =
await createManualAttendance(
    req.body
);



res.status(201).json({

    success:true,

    message:
    "Manual attendance marked successfully",

    data:attendance

});


}
catch(error){


res.status(400).json({

    success:false,

    message:error.message

});


}

};





// ==================================================
// Biometric Attendance
// ==================================================

export const biometricAttendance = async(req,res)=>{

try{


const attendance =
await createBiometricAttendance(
    req.body
);



res.status(201).json({

    success:true,

    message:
    "Biometric attendance received",

    data:attendance

});


}
catch(error){


res.status(400).json({

    success:false,

    message:error.message

});


}

};






// ==================================================
// Check Out
// ==================================================

export const checkout = async(req,res)=>{


try{


const attendance =
await checkoutAttendance(
    req.body
);



res.json({

    success:true,

    message:
    "Checkout successful",

    data:attendance

});


}
catch(error){


res.status(400).json({

    success:false,

    message:error.message

});


}


};






// ==================================================
// Get Attendance List
// ==================================================

export const getAttendance = async(req,res)=>{


try{


const attendance =
await getAllAttendance(
    req.query
);



res.json({

success:true,

data:attendance

});


}
catch(error){


res.status(500).json({

success:false,

message:error.message

});


}


};