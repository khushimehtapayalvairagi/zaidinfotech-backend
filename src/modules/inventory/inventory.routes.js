import express from "express";

import {
    createInventory,
    getAllInventory,
    getInventoryById,
    updateInventory,
    deleteInventory,
    addStock,
    removeStock
} from "./inventory.controller.js";


import {
    verifyToken
} from "../../common/middleware/auth.middleware.js";


import {
    allowRoles
} from "../../common/middleware/role.middleware.js";



const router = express.Router();



// Create Inventory
// Only ADMIN

router.post(
    "/",
    verifyToken,
    allowRoles("ADMIN",INVENTORY),
    createInventory
);



// Get All Inventory

router.get(
    "/",
    verifyToken,
    allowRoles("ADMIN",INVENTORY),
    getAllInventory
);



// Get Single Inventory

router.get(
    "/:id",
    verifyToken,
    allowRoles("ADMIN",INVENTORY),
    getInventoryById
);



// Update Inventory

router.put(
    "/:id",
    verifyToken,
    allowRoles("ADMIN",INVENTORY),
    updateInventory
);



// Delete Inventory

router.delete(
    "/:id",
    verifyToken,
    allowRoles("ADMIN",INVENTORY),
    deleteInventory
);



// Add Stock

router.patch(
    "/add-stock",
    verifyToken,
    allowRoles("ADMIN",INVENTORY),
    addStock
);



// Remove Stock

router.patch(
    "/remove-stock",
    verifyToken,
    allowRoles("ADMIN",INVENTORY),
    removeStock
);



export default router;