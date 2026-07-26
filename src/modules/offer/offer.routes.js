import express from "express";


import {

createOffer,
getOffers,
getActiveOffers,
updateOffer,
deleteOffer

} from "./offer.controller.js";


import {
verifyToken
} from "../../common/middleware/auth.middleware.js";


import {
allowRoles
} from "../../common/middleware/role.middleware.js";


const router = express.Router();



// Admin Create Offer

router.post(

"/",

verifyToken,

allowRoles(
"SUPER_ADMIN",
"ADMIN"
),

createOffer

);




// Admin All Offers

router.get(

"/",

verifyToken,

allowRoles(
"SUPER_ADMIN",
"ADMIN"
),

getOffers

);





// Customer Homepage

router.get(

"/active",

getActiveOffers

);





// Update Offer

router.put(

"/:id",

verifyToken,

allowRoles(
"SUPER_ADMIN",
"ADMIN"
),

updateOffer

);





// Delete Offer

router.delete(

"/:id",

verifyToken,

allowRoles(
"SUPER_ADMIN",
"ADMIN"
),

deleteOffer

);



export default router;