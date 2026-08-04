export const verifyBiometricKey = (
    req,
    res,
    next
)=>{

try{


const apiKey =
req.headers["x-api-key"];



if(!apiKey){

return res.status(401).json({

success:false,

message:"Biometric API key missing"

});

}



if(
apiKey !== process.env.BIOMETRIC_API_KEY
){

return res.status(401).json({

success:false,

message:"Invalid biometric device"

});

}



next();


}
catch(error){


return res.status(500).json({

success:false,

message:error.message

});


}

};