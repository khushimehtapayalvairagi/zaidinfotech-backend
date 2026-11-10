import Inventory from "./inventory.model.js";
import StockTransfer from "./stockTransaction/stockTransfer.model.js";

import {
    calculateStatus,
    sendInventoryNotification,
    sendProductRestockedNotification
} from "./inventory.service.js";


const LOCATIONS = ["STORE", "WAREHOUSE"];


const toQty = (quantity) => {

    const qty = Number(quantity);

    if (!Number.isInteger(qty) || qty <= 0) {

        throw new Error(
            "Quantity must be a positive whole number"
        );

    }

    return qty;

};


// ======================================================
// TRANSFER STOCK (STORE <-> WAREHOUSE)
// ======================================================

export const transferStockService = async ({
    productId,
    quantity,
    from,
    to,
    note = "",
    userId
}) => {

    if (!productId) {
        throw new Error("Product ID is required");
    }

    const qty = toQty(quantity);

    from = String(from || "").toUpperCase();
    to = String(to || "").toUpperCase();

    if (!LOCATIONS.includes(from) || !LOCATIONS.includes(to)) {
        throw new Error("Invalid location. Use STORE or WAREHOUSE");
    }

    if (from === to) {
        throw new Error("Source and destination cannot be same");
    }

    const base = {
        product: productId,
        isDeleted: false
    };

    let filter;
    let update;

    if (from === "STORE") {

        // Store se sirf AVAILABLE stock (current - reserved) hi ja sakta hai
        filter = {
            ...base,
            $expr: {
                $gte: [
                    {
                        $subtract: [
                            { $ifNull: ["$currentStock", 0] },
                            { $ifNull: ["$reservedStock", 0] }
                        ]
                    },
                    qty
                ]
            }
        };

        update = {
            $inc: {
                currentStock: -qty,
                warehouseStock: qty
            }
        };

    }
    else {

        filter = {
            ...base,
            warehouseStock: { $gte: qty }
        };

        update = {
            $inc: {
                warehouseStock: -qty,
                currentStock: qty
            }
        };

    }

    if (userId) {
        update.$set = { lastUpdatedBy: userId };
    }

    // ATOMIC: check + update ek saath. new:false => purani values milengi
    const before = await Inventory.findOneAndUpdate(
        filter,
        update,
        { new: false }
    );

    if (!before) {

        const inventory = await Inventory.findOne(base);

        if (!inventory) {
            throw new Error("Inventory not found for this product");
        }

        if (from === "STORE") {

            const available = Math.max(
                Number(inventory.currentStock || 0) -
                Number(inventory.reservedStock || 0),
                0
            );

            throw new Error(
                `Not enough store stock. Available in store: ${available}`
            );

        }

        throw new Error(
            `Not enough warehouse stock. Available in warehouse: ${Number(inventory.warehouseStock || 0)}`
        );

    }

    const storeBefore = Number(before.currentStock || 0);
    const warehouseBefore = Number(before.warehouseStock || 0);

    const storeAfter =
        from === "STORE"
            ? storeBefore - qty
            : storeBefore + qty;

    const warehouseAfter =
        from === "STORE"
            ? warehouseBefore + qty
            : warehouseBefore - qty;

    // Status (store stock ke hisaab se)
    await Inventory.updateOne(
        { _id: before._id },
        {
            status: calculateStatus(
                storeAfter,
                before.minimumStock
            )
        }
    );

    // History
    try {

        await StockTransfer.create({

            product: before.product,
            inventory: before._id,
            movementType: "TRANSFER",
            fromLocation: from,
            toLocation: to,
            quantity: qty,
            storeStockBefore: storeBefore,
            storeStockAfter: storeAfter,
            warehouseStockBefore: warehouseBefore,
            warehouseStockAfter: warehouseAfter,
            note: String(note || "").trim(),
            transferredBy: userId

        });

    }
    catch (error) {

        console.error("STOCK TRANSFER HISTORY ERROR:", error);

    }

    // Notifications (ye khud error handle karte hain)
    await sendInventoryNotification({
        productId: before.product,
        currentStock: storeAfter,
        minimumStock: before.minimumStock
    });

    if (storeBefore === 0 && storeAfter > 0) {

        await sendProductRestockedNotification({
            productId: before.product
        });

    }

    return await Inventory.findById(before._id)
        .populate({ path: "product" });

};


// ======================================================
// ADD STOCK DIRECTLY TO WAREHOUSE
// ======================================================

export const addWarehouseStockService = async ({
    productId,
    quantity,
    note = "",
    userId
}) => {

    if (!productId) {
        throw new Error("Product ID is required");
    }

    const qty = toQty(quantity);

    const update = {
        $inc: { warehouseStock: qty }
    };

    if (userId) {
        update.$set = { lastUpdatedBy: userId };
    }

    const before = await Inventory.findOneAndUpdate(
        {
            product: productId,
            isDeleted: false
        },
        update,
        { new: false }
    );

    if (!before) {
        throw new Error("Inventory not found for this product");
    }

    const warehouseBefore = Number(before.warehouseStock || 0);
    const storeStock = Number(before.currentStock || 0);

    try {

        await StockTransfer.create({

            product: before.product,
            inventory: before._id,
            movementType: "WAREHOUSE_IN",
            fromLocation: "SUPPLIER",
            toLocation: "WAREHOUSE",
            quantity: qty,
            storeStockBefore: storeStock,
            storeStockAfter: storeStock,
            warehouseStockBefore: warehouseBefore,
            warehouseStockAfter: warehouseBefore + qty,
            note: String(note || "").trim(),
            transferredBy: userId

        });

    }
    catch (error) {

        console.error("WAREHOUSE HISTORY ERROR:", error);

    }

    return await Inventory.findById(before._id)
        .populate({ path: "product" });

};


// ======================================================
// TRANSFER HISTORY
// ======================================================

export const getTransferHistoryService = async (productId) => {

    const filter = productId ? { product: productId } : {};

    return await StockTransfer.find(filter)
        .populate({
            path: "product",
            select: "name sku"
        })
        .populate({
            path: "transferredBy",
            select: "firstName lastName name email"
        })
        .sort({ createdAt: -1 })
        .limit(300);

};