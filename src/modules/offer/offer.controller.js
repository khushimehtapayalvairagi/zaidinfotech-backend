// import * as offerService from "./offer.service.js";



// // ================================
// // Create Offer
// // ================================

// export const createOffer = async(req,res)=>{


// try{


// const offer =

// await offerService.createOfferService(

//     req.body,

//     req.user._id

// );



// res.status(201).json({

//     success:true,

//     message:"Offer created successfully",

//     offer

// });


// }

// catch(error){


// res.status(400).json({

//     success:false,

//     message:error.message

// });


// }


// };





// // ================================
// // Get All Offers
// // ================================

// export const getOffers = async(req,res)=>{


// try{


// const offers =

// await offerService.getOffersService();



// res.status(200).json({

// success:true,

// offers

// });


// }

// catch(error){

// res.status(400).json({

// success:false,

// message:error.message

// });


// }


// };





// // ================================
// // Homepage Offers
// // ================================

// export const getActiveOffers = async(req,res)=>{


// try{


// const offers =

// await offerService.getActiveOffersService();



// res.status(200).json({

// success:true,

// offers

// });


// }

// catch(error){


// res.status(400).json({

// success:false,

// message:error.message

// });


// }


// };





// // ================================
// // Update Offer
// // ================================

// export const updateOffer = async(req,res)=>{


// try{


// const offer =

// await offerService.updateOfferService(

// req.params.id,

// req.body

// );



// res.status(200).json({

// success:true,

// message:"Offer updated",

// offer

// });


// }

// catch(error){


// res.status(400).json({

// success:false,

// message:error.message

// });


// }


// };





// // ================================
// // Delete Offer
// // ================================

// export const deleteOffer = async(req,res)=>{


// try{


// await offerService.deleteOfferService(

// req.params.id

// );



// res.status(200).json({

// success:true,

// message:"Offer deleted"

// });


// }

// catch(error){


// res.status(400).json({

// success:false,

// message:error.message

// });


// }


// };

// // ================================
// // Get Single Offer
// // ================================

// export const getOfferById = async(req,res)=>{

// try{

//     const offer =
//     await offerService.getOfferByIdService(
//         req.params.id
//     );

//     res.status(200).json({
//         success:true,
//         offer
//     });

// }
// catch(error){

//     res.status(404).json({
//         success:false,
//         message:error.message
//     });

// }

// };
// // =====================================================
// // PUBLIC ACTIVE OFFERS
// // HOME PAGE
// // =====================================================

// export const getActiveOffersPublic = async (req, res) => {

//     try {

//         const offers =
//             await getActiveOffersPublicService();

//         return res.status(200).json({

//             success: true,

//             message: "Active offers fetched successfully",

//             data: offers

//         });

//     } catch (error) {

//         console.error(
//             "PUBLIC ACTIVE OFFERS ERROR:",
//             error
//         );

//         return res.status(500).json({

//             success: false,

//             message: error.message,

//             data: []

//         });

//     }

// };



import * as offerService from "./offer.service.js";


// ================================
// Create Offer
// ================================

export const createOffer = async (req, res) => {

    try {

        const offer =
            await offerService.createOfferService(
                req.body,
                req.user._id
            );


        return res.status(201).json({

            success: true,

            message: "Offer created successfully",

            offer

        });

    }

    catch (error) {

        console.error(
            "CREATE OFFER ERROR:",
            error
        );

        return res.status(400).json({

            success: false,

            message: error.message

        });

    }

};



// ================================
// Get All Offers
// ADMIN ONLY
// ================================

export const getOffers = async (req, res) => {

    try {

        const offers =
            await offerService.getOffersService();


        return res.status(200).json({

            success: true,

            offers

        });

    }

    catch (error) {

        console.error(
            "GET OFFERS ERROR:",
            error
        );

        return res.status(400).json({

            success: false,

            message: error.message

        });

    }

};



// =====================================================
// PUBLIC ACTIVE OFFERS
// HOME PAGE
//
// NO LOGIN REQUIRED
//
// GET /api/offers/active
// =====================================================

export const getActiveOffersPublic = async (
    req,
    res
) => {

    try {

        console.log(
            "================================="
        );

        console.log(
            "PUBLIC ACTIVE OFFERS API"
        );

        console.log(
            "================================="
        );


        const offers =
            await offerService.getActiveOffersPublicService();


        console.log(
            "ACTIVE OFFERS COUNT:",
            offers.length
        );


        return res.status(200).json({

            success: true,

            message:
                "Active offers fetched successfully",

            data: offers,

            // Keep this also so existing
            // frontend/admin code doesn't break.
            offers: offers

        });

    }

    catch (error) {

        console.error(
            "PUBLIC ACTIVE OFFERS ERROR:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                error.message ||
                "Failed to fetch active offers",

            data: [],

            offers: []

        });

    }

};



// ================================
// Existing Homepage Active Offers
// ================================
//
// Keep this function because it may
// already be used somewhere else.
//
// ================================

export const getActiveOffers = async (
    req,
    res
) => {

    try {

        const offers =
            await offerService.getActiveOffersService();


        return res.status(200).json({

            success: true,

            offers

        });

    }

    catch (error) {

        console.error(
            "GET ACTIVE OFFERS ERROR:",
            error
        );

        return res.status(400).json({

            success: false,

            message: error.message,

            offers: []

        });

    }

};



// ================================
// Update Offer
// ================================

export const updateOffer = async (
    req,
    res
) => {

    try {

        const offer =
            await offerService.updateOfferService(
                req.params.id,
                req.body
            );


        return res.status(200).json({

            success: true,

            message: "Offer updated",

            offer

        });

    }

    catch (error) {

        console.error(
            "UPDATE OFFER ERROR:",
            error
        );

        return res.status(400).json({

            success: false,

            message: error.message

        });

    }

};



// ================================
// Delete Offer
// ================================

export const deleteOffer = async (
    req,
    res
) => {

    try {

        await offerService.deleteOfferService(
            req.params.id
        );


        return res.status(200).json({

            success: true,

            message: "Offer deleted"

        });

    }

    catch (error) {

        console.error(
            "DELETE OFFER ERROR:",
            error
        );

        return res.status(400).json({

            success: false,

            message: error.message

        });

    }

};



// ================================
// Get Single Offer
// ================================

export const getOfferById = async (
    req,
    res
) => {

    try {

        const offer =
            await offerService.getOfferByIdService(
                req.params.id
            );


        return res.status(200).json({

            success: true,

            offer

        });

    }

    catch (error) {

        console.error(
            "GET OFFER BY ID ERROR:",
            error
        );

        return res.status(404).json({

            success: false,

            message: error.message

        });

    }

};