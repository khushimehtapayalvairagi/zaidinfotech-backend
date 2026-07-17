import {

    addToCartService,
    getCartService,
    clearCartService

} from "./cart.service.js";


import {

    successResponse,
    errorResponse

} from "../../common/utils/apiResponse.js";




// =================================
// Add Product To Cart
// =================================

export const addToCart = async(req,res)=>{

    try{


        const cart =

        await addToCartService(

            req.user.id,

            req.body

        );



        return successResponse(

            res,

            200,

            "Product added to cart successfully",

            cart

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
// Get My Cart
// =================================

export const getCart = async(req,res)=>{


    try{


        const cart =

        await getCartService(

            req.user.id

        );



        return successResponse(

            res,

            200,

            "Cart fetched successfully",

            cart

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
// Clear Cart
// =================================

export const clearCart = async(req,res)=>{


    try{


        const cart =

        await clearCartService(

            req.user.id

        );



        return successResponse(

            res,

            200,

            "Cart cleared successfully",

            cart

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