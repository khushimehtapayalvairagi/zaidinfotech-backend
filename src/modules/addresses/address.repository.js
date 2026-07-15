import Address from "./address.model.js";


// =================================
// Create Address
// =================================

export const createAddressDB = async(data)=>{

    return await Address.create(data);

};





// =================================
// Get User Addresses
// =================================

export const getUserAddressesDB = async(userId)=>{


    return await Address.find({

        user:userId,

        isDeleted:false

    })
    .sort({

        isDefault:-1,

        createdAt:-1

    });


};





// =================================
// Get Single Address
// =================================

export const getAddressByIdDB = async(
    id,
    userId
)=>{


    return await Address.findOne({

        _id:id,

        user:userId,

        isDeleted:false

    });


};






// =================================
// Update Address
// =================================

export const updateAddressDB = async(

    id,

    userId,

    data

)=>{


    return await Address.findOneAndUpdate(

        {
            _id:id,

            user:userId,

            isDeleted:false
        },


        data,


        {
            new:true
        }

    );


};







// =================================
// Delete Address (Soft Delete)
// =================================

export const deleteAddressDB = async(

    id,

    userId

)=>{


    return await Address.findOneAndUpdate(

        {

            _id:id,

            user:userId

        },


        {

            isDeleted:true

        },


        {
            new:true
        }

    );


};







// =================================
// Remove Default Address
// =================================

export const removeDefaultAddressDB = async(
    userId
)=>{


    return await Address.updateMany(

        {
            user:userId
        },


        {

            isDefault:false

        }

    );


};







// =================================
// Set Default Address
// =================================

export const setDefaultAddressDB = async(

    id,

    userId

)=>{


    return await Address.findOneAndUpdate(

        {

            _id:id,

            user:userId,

            isDeleted:false

        },


        {

            isDefault:true

        },


        {

            new:true

        }

    );


};