import express from "express";


import {

createInventory,
getAllInventory,
getInventoryById,
updateInventory,
deleteInventory,
addStock,
removeStock,
reserveStock,
releaseReservedStock,
returnStock

}
from "./inventory.controller.js";



import {
verifyToken
}
from "../../common/middleware/auth.middleware.js";


import {
allowRoles
}
from "../../common/middleware/role.middleware.js";



const router = express.Router();




const inventoryRoles = [

"ADMIN",

"INVENTORY"

];





router.post(
"/",
verifyToken,
allowRoles(...inventoryRoles),
createInventory
);
router.patch(
"/return-stock",
verifyToken,
allowRoles(...inventoryRoles),
returnStock
);


router.get(
"/",
verifyToken,
allowRoles(...inventoryRoles),
getAllInventory
);



router.get(
"/:id",
verifyToken,
allowRoles(...inventoryRoles),
getInventoryById
);



router.put(
"/:id",
verifyToken,
allowRoles(...inventoryRoles),
updateInventory
);



router.delete(
"/:id",
verifyToken,
allowRoles(...inventoryRoles),
deleteInventory
);





router.patch(
"/add-stock",
verifyToken,
allowRoles(...inventoryRoles),
addStock
);




router.patch(
"/remove-stock",
verifyToken,
allowRoles(...inventoryRoles),
removeStock
);





// Order Pending

router.patch(
"/reserve-stock",
verifyToken,
allowRoles(...inventoryRoles),
reserveStock
);




// Order Cancel

router.patch(
"/release-stock",
verifyToken,
allowRoles(...inventoryRoles),
releaseReservedStock
);




export default router;