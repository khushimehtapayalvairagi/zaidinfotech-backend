import Offer from "./offer.model.js";


// ================================
// Create Offer
// ================================

export const createOfferDB = async(data)=>{

    return await Offer.create(data);

};




// ================================
// Get All Offers
// ================================

export const getOffersDB = async()=>{

    return await Offer.find()

    .populate(
        "products",
        "name images pricing"
    )

    .sort({
        createdAt:-1
    });

};




// ================================
// Get Active Offers
// Homepage/Product ke liye
// ================================

export const getActiveOffersDB = async()=>{


    const today = new Date();


    return await Offer.find({

        status:"ACTIVE",

        startDate:{
            $lte:today
        },

        endDate:{
            $gte:today
        }

    })

    .populate(
        "products",
        "name images pricing"
    );


};




// ================================
// Get Single Offer
// ================================

export const getOfferByIdDB = async(id)=>{


    return await Offer.findById(id);


};




// ================================
// Update Offer
// ================================

export const updateOfferDB = async(
    id,
    data
)=>{


    return await Offer.findByIdAndUpdate(

        id,

        data,

        {
            new:true
        }

    );


};




// ================================
// Delete Offer
// ================================

export const deleteOfferDB = async(id)=>{


    return await Offer.findByIdAndDelete(id);


};