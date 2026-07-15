import express from "express";


import {

createTransaction,

getTransactions

}
from "./stockTransaction.controller.js";


import {
verifyToken
}
from "../../../common/middleware/auth.middleware.js";


import {
allowRoles
}
from "../../../common/middleware/role.middleware.js";



const router = express.Router();



router.post(
"/",
verifyToken,
allowRoles(
"ADMIN",
"INVENTORY"
),
createTransaction
);



router.get(
"/product/:productId",
verifyToken,
allowRoles(
"ADMIN",
"INVENTORY"
),
getTransactions
);



export default router;