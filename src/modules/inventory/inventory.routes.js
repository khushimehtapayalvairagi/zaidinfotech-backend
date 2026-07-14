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
} from "../../common/middlewares/auth.middleware.js";


import {
    allowRoles
} from "../../common/middlewares/role.middleware.js";



const router = express.Router();



// Create Inventory
// Only ADMIN

router.post(
    "/",
    verifyToken,
    allowRoles("ADMIN"),
    createInventory
);



// Get All Inventory

router.get(
    "/",
    verifyToken,
    allowRoles("ADMIN"),
    getAllInventory
);



// Get Single Inventory

router.get(
    "/:id",
    verifyToken,
    allowRoles("ADMIN"),
    getInventoryById
);



// Update Inventory

router.put(
    "/:id",
    verifyToken,
    allowRoles("ADMIN"),
    updateInventory
);



// Delete Inventory

router.delete(
    "/:id",
    verifyToken,
    allowRoles("ADMIN"),
    deleteInventory
);



// Add Stock

router.patch(
    "/add-stock",
    verifyToken,
    allowRoles("ADMIN"),
    addStock
);



// Remove Stock

router.patch(
    "/remove-stock",
    verifyToken,
    allowRoles("ADMIN"),
    removeStock
);



export default router;