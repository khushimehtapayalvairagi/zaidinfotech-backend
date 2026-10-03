


import {

    addToCartService,

    getCartService,

    updateCartQuantityService,

    removeCartItemService,

    clearCartService

} from "./cart.service.js";


import {

    successResponse,

    errorResponse

} from "../../common/utils/apiResponse.js";



// ======================================================
// ADD TO CART
// ======================================================

export const addToCart = async (
    req,
    res
) => {

    try {

        console.log(
            "ADD TO CART USER:",
            req.user
        );


        console.log(
            "ADD TO CART BODY:",
            req.body
        );


       const cart =
    await addToCartService(
        req.user.id,
        req.body,
        req.user.customerType
    );


        return successResponse(

            res,

            200,

            "Product added to cart successfully",

            cart

        );

    }

    catch (error) {

        console.error(
            "ADD TO CART ERROR:",
            error
        );


        return errorResponse(

            res,

            400,

            error.message

        );

    }

};



// ======================================================
// GET CART
// ======================================================

export const getCart = async (
    req,
    res
) => {

    try {

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

    catch (error) {

        console.error(
            "GET CART ERROR:",
            error
        );


        return errorResponse(

            res,

            500,

            error.message

        );

    }

};



// ======================================================
// UPDATE QUANTITY
// ======================================================

export const updateCartQuantity = async (
    req,
    res
) => {

    try {

        const {
            productId
        } = req.params;


        const {
            quantity
        } = req.body;


        const cart =
            await updateCartQuantityService(

                req.user.id,

                productId,

                Number(quantity)

            );


        return successResponse(

            res,

            200,

            "Cart quantity updated successfully",

            cart

        );

    }

    catch (error) {

        console.error(
            "UPDATE CART ERROR:",
            error
        );


        return errorResponse(

            res,

            400,

            error.message

        );

    }

};



// ======================================================
// REMOVE ITEM
// ======================================================

export const removeCartItem = async (
    req,
    res
) => {

    try {

        const {
            productId
        } = req.params;


        const cart =
            await removeCartItemService(

                req.user.id,

                productId

            );


        return successResponse(

            res,

            200,

            "Product removed from cart successfully",

            cart

        );

    }

    catch (error) {

        console.error(
            "REMOVE CART ITEM ERROR:",
            error
        );


        return errorResponse(

            res,

            400,

            error.message

        );

    }

};



// ======================================================
// CLEAR CART
// ======================================================

export const clearCart = async (
    req,
    res
) => {

    try {

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

    catch (error) {

        console.error(
            "CLEAR CART ERROR:",
            error
        );


        return errorResponse(

            res,

            500,

            error.message

        );

    }

};