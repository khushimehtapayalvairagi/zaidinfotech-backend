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
    transferStock,
    addWarehouseStock,
    getTransferHistory
} from "./inventoryLocation.controller.js";

import {
    verifyToken
} from "../../common/middleware/auth.middleware.js";

import {
    allowRoles
} from "../../common/middleware/role.middleware.js";


const router = express.Router();


const inventoryRoles = [
    "ADMIN",
    "INVENTORY",
    "SALES"
];

const warehouseRoles = [
    "ADMIN",
    "INVENTORY"
];


// PUBLIC SHOP INVENTORY
router.get("/shop", getShopInventory);


// CREATE
router.post(
    "/",
    verifyToken,
    allowRoles(...inventoryRoles),
    createInventory
);


// ======================================================
// NEW: STORE / WAREHOUSE
// ======================================================

router.patch(
    "/transfer-stock",
    verifyToken,
    allowRoles(...warehouseRoles),
    transferStock
);

router.patch(
    "/add-warehouse-stock",
    verifyToken,
    allowRoles(...warehouseRoles),
    addWarehouseStock
);

router.get(
    "/transfers",
    verifyToken,
    allowRoles(...warehouseRoles),
    getTransferHistory
);


// RETURN STOCK
router.patch(
    "/return-stock",
    verifyToken,
    allowRoles(...inventoryRoles),
    returnStock
);

// ADD STOCK
router.patch(
    "/add-stock",
    verifyToken,
    allowRoles(...inventoryRoles),
    addStock
);

// REMOVE STOCK
router.patch(
    "/remove-stock",
    verifyToken,
    allowRoles(...inventoryRoles),
    removeStock
);

// RESERVE STOCK
router.patch(
    "/reserve-stock",
    verifyToken,
    allowRoles(...inventoryRoles),
    reserveStock
);

// RELEASE RESERVED STOCK
router.patch(
    "/release-stock",
    verifyToken,
    allowRoles(...inventoryRoles),
    releaseReservedStock
);

// GET ALL
router.get(
    "/",
    verifyToken,
    allowRoles(...inventoryRoles),
    getAllInventory
);

// GET BY ID
router.get(
    "/:id",
    verifyToken,
    allowRoles(...inventoryRoles),
    getInventoryById
);

// UPDATE
router.put(
    "/:id",
    verifyToken,
    allowRoles(...inventoryRoles),
    updateInventory
);

// DELETE
router.delete(
    "/:id",
    verifyToken,
    allowRoles(...inventoryRoles),
    deleteInventory
);


export default router;