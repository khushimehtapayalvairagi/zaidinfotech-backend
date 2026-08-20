// import * as offerRepository from "./offer.repository.js";




// // ================================
// // Create Offer
// // ================================

// export const createOfferService = async(
//     data,
//     userId
// )=>{


//     data.createdBy = userId;


//     return await offerRepository.createOfferDB(
//         data
//     );


// };





// // ================================
// // Get Offers
// // ================================

// export const getOffersService = async()=>{


//     return await offerRepository.getOffersDB();


// };





// // ================================
// // Homepage Active Offers
// // ================================

// export const getActiveOffersService = async()=>{


//     return await offerRepository.getActiveOffersDB();


// };





// // ================================
// // Update Offer
// // ================================

// export const updateOfferService = async(
//     id,
//     data
// )=>{


//     const offer =
//     await offerRepository.getOfferByIdDB(id);



//     if(!offer){

//         throw new Error(
//             "Offer not found"
//         );

//     }



//     return await offerRepository.updateOfferDB(
//         id,
//         data
//     );


// };





// // ================================
// // Delete Offer
// // ================================

// export const deleteOfferService = async(id)=>{


//     const offer =
//     await offerRepository.deleteOfferDB(id);



//     if(!offer){

//         throw new Error(
//             "Offer not found"
//         );

//     }


//     return offer;

// };
// // ================================
// // Get Single Offer
// // ================================

// export const getOfferByIdService = async(id)=>{

//     const offer =
//     await offerRepository.getOfferByIdDB(id);

//     if(!offer){
//         throw new Error("Offer not found");
//     }

//     return offer;

// };
// // =====================================================
// // PUBLIC ACTIVE OFFERS
// // =====================================================

// export const getActiveOffersPublicService = async () => {

//     return await getActiveOffersPublicDB();

// };

import * as offerRepository from "./offer.repository.js";



// ================================
// Create Offer
// ================================

export const createOfferService = async (
    data,
    userId
) => {

    data.createdBy = userId;


    return await offerRepository.createOfferDB(
        data
    );

};



// ================================
// Get Offers
// ADMIN
// ================================

export const getOffersService = async () => {

    return await offerRepository.getOffersDB();

};



// ================================
// Existing Active Offers
// Keep existing function
// ================================

export const getActiveOffersService = async () => {

    return await offerRepository.getActiveOffersDB();

};



// =====================================================
// PUBLIC ACTIVE OFFERS
// HOME PAGE
//
// NO LOGIN REQUIRED
// =====================================================

export const getActiveOffersPublicService = async () => {

    return await offerRepository.getActiveOffersPublicDB();

};



// ================================
// Update Offer
// ================================

export const updateOfferService = async (
    id,
    data
) => {

    const offer =
        await offerRepository.getOfferByIdDB(
            id
        );


    if (!offer) {

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

export const deleteOfferService = async (
    id
) => {

    const offer =
        await offerRepository.deleteOfferDB(
            id
        );


    if (!offer) {

        throw new Error(
            "Offer not found"
        );

    }


    return offer;

};



// ================================
// Get Single Offer
// ================================

export const getOfferByIdService = async (
    id
) => {

    const offer =
        await offerRepository.getOfferByIdDB(
            id
        );


    if (!offer) {

        throw new Error(
            "Offer not found"
        );

    }


    return offer;

};