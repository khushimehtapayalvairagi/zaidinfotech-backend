import express from "express";


import {

createAddress,
getMyAddresses,
getAddressById,
updateAddress,
deleteAddress,
setDefaultAddress

} from "./address.controller.js";


import {

createAddressValidation,
updateAddressValidation

} from "./address.validation.js";


import {

validate

} from "../../common/middleware/validate.middleware.js";


import {

verifyToken

} from "../../common/middleware/auth.middleware.js";



const router = express.Router();




// =================================
// Customer Address Routes
// =================================


// Add New Address

router.post(

    "/",

    verifyToken,

    validate(createAddressValidation),

    createAddress

);






// Get All My Addresses

router.get(

    "/",

    verifyToken,

    getMyAddresses

);







// Get Single Address

router.get(

    "/:id",

    verifyToken,

    getAddressById

);








// Update Address

router.put(

    "/:id",

    verifyToken,

    validate(updateAddressValidation),

    updateAddress

);







// Delete Address

router.delete(

    "/:id",

    verifyToken,

    deleteAddress

);







// Set Default Address

router.patch(

    "/:id/default",

    verifyToken,

    setDefaultAddress

);





export default router;