// import express from "express";


// import {

// createInventory,
// getAllInventory,
// getInventoryById,
// updateInventory,
// deleteInventory,
// addStock,
// removeStock,
// reserveStock,
// releaseReservedStock,
// returnStock,
// getShopInventory

// }
// from "./inventory.controller.js";



// import {
// verifyToken
// }
// from "../../common/middleware/auth.middleware.js";


// import {
// allowRoles
// }
// from "../../common/middleware/role.middleware.js";



// const router = express.Router();




// const inventoryRoles = [

// "ADMIN",

// "INVENTORY"

// ];


// // ======================================================
// // PUBLIC SHOP INVENTORY
// // Customer bina login stock dekh sakta hai
// // ======================================================

// router.get(
//     "/shop",
//     getShopInventory
// );


// router.post(
// "/",
// verifyToken,
// allowRoles(...inventoryRoles),
// createInventory
// );
// router.patch(
// "/return-stock",
// verifyToken,
// allowRoles(...inventoryRoles),
// returnStock
// );


// router.get(
// "/",
// verifyToken,
// allowRoles(...inventoryRoles),
// getAllInventory
// );



// router.get(
// "/:id",
// verifyToken,
// allowRoles(...inventoryRoles),
// getInventoryById
// );



// router.put(
// "/:id",
// verifyToken,
// allowRoles(...inventoryRoles),
// updateInventory
// );



// router.delete(
// "/:id",
// verifyToken,
// allowRoles(...inventoryRoles),
// deleteInventory
// );





// router.patch(
// "/add-stock",
// verifyToken,
// allowRoles(...inventoryRoles),
// addStock
// );




// router.patch(
// "/remove-stock",
// verifyToken,
// allowRoles(...inventoryRoles),
// removeStock
// );





// // Order Pending

// router.patch(
// "/reserve-stock",
// verifyToken,
// allowRoles(...inventoryRoles),
// reserveStock
// );




// // Order Cancel

// router.patch(
// "/release-stock",
// verifyToken,
// allowRoles(...inventoryRoles),
// releaseReservedStock
// );




// export default router;

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

    returnStock,

    getShopInventory

} from "./inventory.controller.js";


import {
    verifyToken
} from "../../common/middleware/auth.middleware.js";


import {
    allowRoles
} from "../../common/middleware/role.middleware.js";


const router = express.Router();


const inventoryRoles = [

    "ADMIN",

    "INVENTORY"

];


// ======================================================
// PUBLIC SHOP INVENTORY
// ======================================================

router.get(
    "/shop",
    getShopInventory
);


// ======================================================
// CREATE
// ======================================================

router.post(
    "/",
    verifyToken,
    allowRoles(...inventoryRoles),
    createInventory
);


// ======================================================
// RETURN STOCK
// ======================================================

router.patch(
    "/return-stock",
    verifyToken,
    allowRoles(...inventoryRoles),
    returnStock
);


// ======================================================
// ADD STOCK
// ======================================================

router.patch(
    "/add-stock",
    verifyToken,
    allowRoles(...inventoryRoles),
    addStock
);


// ======================================================
// REMOVE STOCK
// ======================================================

router.patch(
    "/remove-stock",
    verifyToken,
    allowRoles(...inventoryRoles),
    removeStock
);


// ======================================================
// RESERVE STOCK
// ======================================================

router.patch(
    "/reserve-stock",
    verifyToken,
    allowRoles(...inventoryRoles),
    reserveStock
);


// ======================================================
// RELEASE RESERVED STOCK
// ======================================================

router.patch(
    "/release-stock",
    verifyToken,
    allowRoles(...inventoryRoles),
    releaseReservedStock
);


// ======================================================
// GET ALL
// ======================================================

router.get(
    "/",
    verifyToken,
    allowRoles(...inventoryRoles),
    getAllInventory
);


// ======================================================
// GET BY ID
// ======================================================

router.get(
    "/:id",
    verifyToken,
    allowRoles(...inventoryRoles),
    getInventoryById
);


// ======================================================
// UPDATE
// ======================================================

router.put(
    "/:id",
    verifyToken,
    allowRoles(...inventoryRoles),
    updateInventory
);


// ======================================================
// DELETE
// ======================================================

router.delete(
    "/:id",
    verifyToken,
    allowRoles(...inventoryRoles),
    deleteInventory
);


export default router;