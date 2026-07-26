import * as offerRepository from "./offer.repository.js";




// ================================
// Create Offer
// ================================

export const createOfferService = async(
    data,
    userId
)=>{


    data.createdBy = userId;


    return await offerRepository.createOfferDB(
        data
    );


};





// ================================
// Get Offers
// ================================

export const getOffersService = async()=>{


    return await offerRepository.getOffersDB();


};





// ================================
// Homepage Active Offers
// ================================

export const getActiveOffersService = async()=>{


    return await offerRepository.getActiveOffersDB();


};





// ================================
// Update Offer
// ================================

export const updateOfferService = async(
    id,
    data
)=>{


    const offer =
    await offerRepository.getOfferByIdDB(id);



    if(!offer){

        throw new Error(
            "Offer not found"
        );

    }



    return await offerRepository.updateOfferDB(
        id,
        data
    );


};





// ================================
// Delete Offer
// ================================

export const deleteOfferService = async(id)=>{


    const offer =
    await offerRepository.deleteOfferDB(id);



    if(!offer){

        throw new Error(
            "Offer not found"
        );

    }


    return offer;

};