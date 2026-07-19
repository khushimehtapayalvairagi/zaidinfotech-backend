import * as wishlistService from "./wishlist.service.js";



// =======================================
// ADD PRODUCT TO WISHLIST
// =======================================

export const addToWishlist = async(req,res)=>{


    try{


        const userId = req.user._id;


        const { productId } = req.body;



        const wishlist =

        await wishlistService.addProductToWishlist(

            userId,

            productId

        );



        res.status(200).json({

            success:true,

            message:
            "Product added to wishlist",

            wishlist

        });



    }

    catch(error){


        res.status(400).json({

            success:false,

            message:error.message

        });


    }


};




// =======================================
// GET USER WISHLIST
// =======================================

export const getWishlist = async(req,res)=>{


    try{


        const userId = req.user._id;



        const wishlist =

        await wishlistService.getUserWishlist(

            userId

        );



        res.status(200).json({

            success:true,

            wishlist

        });



    }

    catch(error){


        res.status(400).json({

            success:false,

            message:error.message

        });


    }


};




// =======================================
// REMOVE PRODUCT FROM WISHLIST
// =======================================

export const removeFromWishlist = async(
    req,
    res
)=>{


    try{


        const userId = req.user._id;


        const {productId} = req.params;



        const wishlist =

        await wishlistService.removeProductFromWishlist(

            userId,

            productId

        );



        res.status(200).json({

            success:true,

            message:
            "Product removed from wishlist",

            wishlist

        });



    }

    catch(error){


        res.status(400).json({

            success:false,

            message:error.message

        });


    }


};