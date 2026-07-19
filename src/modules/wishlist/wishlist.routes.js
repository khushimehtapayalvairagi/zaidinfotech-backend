


import express from "express";


import {

    addToWishlist,
    getWishlist,
    removeFromWishlist

} from "./wishlist.controller.js";



import {

    addWishlistValidation,
    removeWishlistValidation

} from "./wishlist.validation.js";



import { validate } from "../../common/middleware/validate.middleware.js";



import { verifyToken } from "../../common/middleware/auth.middleware.js";



const router = express.Router();




// =======================================
// ADD PRODUCT TO WISHLIST
// =======================================

router.post(

    "/add",

    verifyToken,

    validate(addWishlistValidation),

    addToWishlist

);




// =======================================
// GET USER WISHLIST
// =======================================

router.get(

    "/",

    verifyToken,

    getWishlist

);




// =======================================
// REMOVE PRODUCT FROM WISHLIST
// =======================================

router.delete(

    "/remove/:productId",

    verifyToken,

    validate(removeWishlistValidation),

    removeFromWishlist

);



export default router;