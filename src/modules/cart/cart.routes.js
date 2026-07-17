import express from "express";


import {

    addToCart,
    getCart,
    clearCart

} from "./cart.controller.js";


import {

    validate

} from "../../common/middleware/validate.middleware.js";


import {

    verifyToken

} from "../../common/middleware/auth.middleware.js";


import {

    addToCartValidation

} from "./cart.validation.js";



const router = express.Router();




// =================================
// Add Product To Cart
// =================================

router.post(

    "/add",

    verifyToken,

    validate(addToCartValidation),

    addToCart

);






// =================================
// Get My Cart
// =================================

router.get(

    "/",

    verifyToken,

    getCart

);






// =================================
// Clear Cart
// =================================

router.delete(

    "/clear",

    verifyToken,

    clearCart

);





export default router;