import {

createAddressService,
getUserAddressesService,
getAddressService,
updateAddressService,
deleteAddressService,
setDefaultAddressService

} from "./address.service.js";


import {

successResponse,
errorResponse

} from "../../common/utils/apiResponse.js";





// =================================
// Create Address
// =================================

export const createAddress = async(req,res)=>{

    try{


        const address =

        await createAddressService(

            req.user.id,

            req.body

        );



        return successResponse(

            res,

            201,

            "Address created successfully",

            address

        );


    }
    catch(error){


        return errorResponse(

            res,

            400,

            error.message

        );


    }

};







// =================================
// Get My Addresses
// =================================

export const getMyAddresses = async(req,res)=>{


    try{


        const addresses =

        await getUserAddressesService(

            req.user.id

        );



        return successResponse(

            res,

            200,

            "Addresses fetched successfully",

            addresses

        );


    }
    catch(error){


        return errorResponse(

            res,

            500,

            error.message

        );


    }


};








// =================================
// Get Single Address
// =================================

export const getAddressById = async(req,res)=>{


    try{


        const address =

        await getAddressService(

            req.params.id,

            req.user.id

        );



        return successResponse(

            res,

            200,

            "Address fetched successfully",

            address

        );


    }
    catch(error){


        return errorResponse(

            res,

            404,

            error.message

        );


    }


};








// =================================
// Update Address
// =================================

export const updateAddress = async(req,res)=>{


    try{


        const address =

        await updateAddressService(

            req.params.id,

            req.user.id,

            req.body

        );



        return successResponse(

            res,

            200,

            "Address updated successfully",

            address

        );


    }
    catch(error){


        return errorResponse(

            res,

            400,

            error.message

        );


    }


};








// =================================
// Delete Address
// =================================

export const deleteAddress = async(req,res)=>{


    try{


        await deleteAddressService(

            req.params.id,

            req.user.id

        );



        return successResponse(

            res,

            200,

            "Address deleted successfully"

        );


    }
    catch(error){


        return errorResponse(

            res,

            400,

            error.message

        );


    }


};








// =================================
// Set Default Address
// =================================

export const setDefaultAddress = async(req,res)=>{


    try{


        const address =

        await setDefaultAddressService(

            req.params.id,

            req.user.id

        );



        return successResponse(

            res,

            200,

            "Default address updated successfully",

            address

        );


    }
    catch(error){


        return errorResponse(

            res,

            400,

            error.message

        );


    }


};