import {

createAddressDB,
getUserAddressesDB,
getAddressByIdDB,
updateAddressDB,
deleteAddressDB,
removeDefaultAddressDB,
setDefaultAddressDB

} from "./address.repository.js";




// =================================
// Create Address
// =================================

export const createAddressService = async(

    userId,

    data

)=>{


    // अगर पहला address है तो default बना दो

    const existingAddresses =
    await getUserAddressesDB(userId);



    if(existingAddresses.length === 0){

        data.isDefault = true;

    }



    data.user = userId;



    return await createAddressDB(data);


};







// =================================
// Get My Addresses
// =================================

export const getUserAddressesService = async(

    userId

)=>{


    return await getUserAddressesDB(
        userId
    );


};







// =================================
// Get Single Address
// =================================

export const getAddressService = async(

    id,

    userId

)=>{


    const address =
    await getAddressByIdDB(
        id,
        userId
    );



    if(!address){

        throw new Error(
            "Address not found"
        );

    }



    return address;


};







// =================================
// Update Address
// =================================

export const updateAddressService = async(

    id,

    userId,

    data

)=>{


    const address =
    await updateAddressDB(

        id,

        userId,

        data

    );



    if(!address){

        throw new Error(
            "Address not found"
        );

    }



    return address;


};







// =================================
// Delete Address
// =================================

export const deleteAddressService = async(

    id,

    userId

)=>{


    const address =
    await deleteAddressDB(

        id,

        userId

    );



    if(!address){

        throw new Error(
            "Address not found"
        );

    }



    return address;


};







// =================================
// Set Default Address
// =================================

export const setDefaultAddressService = async(

    id,

    userId

)=>{


    // Remove old default

    await removeDefaultAddressDB(
        userId
    );



    // Set new default

    const address =
    await setDefaultAddressDB(

        id,

        userId

    );



    if(!address){

        throw new Error(
            "Address not found"
        );

    }



    return address;


};