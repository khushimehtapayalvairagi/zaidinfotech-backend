import * as offerService from "./offer.service.js";



// ================================
// Create Offer
// ================================

export const createOffer = async(req,res)=>{


try{


const offer =

await offerService.createOfferService(

    req.body,

    req.user._id

);



res.status(201).json({

    success:true,

    message:"Offer created successfully",

    offer

});


}

catch(error){


res.status(400).json({

    success:false,

    message:error.message

});


}


};





// ================================
// Get All Offers
// ================================

export const getOffers = async(req,res)=>{


try{


const offers =

await offerService.getOffersService();



res.status(200).json({

success:true,

offers

});


}

catch(error){

res.status(400).json({

success:false,

message:error.message

});


}


};





// ================================
// Homepage Offers
// ================================

export const getActiveOffers = async(req,res)=>{


try{


const offers =

await offerService.getActiveOffersService();



res.status(200).json({

success:true,

offers

});


}

catch(error){


res.status(400).json({

success:false,

message:error.message

});


}


};





// ================================
// Update Offer
// ================================

export const updateOffer = async(req,res)=>{


try{


const offer =

await offerService.updateOfferService(

req.params.id,

req.body

);



res.status(200).json({

success:true,

message:"Offer updated",

offer

});


}

catch(error){


res.status(400).json({

success:false,

message:error.message

});


}


};





// ================================
// Delete Offer
// ================================

export const deleteOffer = async(req,res)=>{


try{


await offerService.deleteOfferService(

req.params.id

);



res.status(200).json({

success:true,

message:"Offer deleted"

});


}

catch(error){


res.status(400).json({

success:false,

message:error.message

});


}


};