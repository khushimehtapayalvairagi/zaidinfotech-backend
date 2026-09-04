import * as inventoryRepository from "./inventory.repository.js";

import Product from "../products/product.model.js";
import User from "../users/user.model.js";
import Notification from "../notification/notification.model.js";

import {
    INVENTORY_STATUS
} from "../../common/constants/inventoryStatus.js";

import {
    createStockTransactionService
} from "./stockTransaction/stockTransaction.service.js";

import StockTransaction from "./stockTransaction/stockTransaction.model.js";
import Inventory from "./inventory.model.js";


// ======================================================
// CALCULATE INVENTORY STATUS
// ======================================================

const calculateStatus = (
    currentStock,
    minimumStock
) => {

    currentStock = Number(currentStock || 0);
    minimumStock = Number(minimumStock || 0);

    if (currentStock <= 0) {

        return INVENTORY_STATUS.OUT_OF_STOCK;

    }

    if (currentStock <= minimumStock) {

        return INVENTORY_STATUS.LOW_STOCK;

    }

    return INVENTORY_STATUS.IN_STOCK;

};


// ======================================================
// SEND INVENTORY NOTIFICATION
//
// 0          -> OUT OF STOCK
// 1,2,3,4,5 -> LOW STOCK
//
// ADMIN + INVENTORY
// ======================================================

const sendInventoryNotification = async ({
    productId,
    currentStock,
    minimumStock
}) => {

    try {

        currentStock = Number(currentStock || 0);
        minimumStock = Number(minimumStock || 5);

        // ==========================================
        // PRODUCT
        // ==========================================

        const product = await Product
            .findById(productId)
            .select("name sku");

        if (!product) {

            console.log(
                "Inventory notification: product not found",
                productId
            );

            return;

        }


        // ==========================================
        // STATUS
        // ==========================================

        let notificationType = null;
        let title = "";
        let message = "";


        // ==========================================
        // OUT OF STOCK
        // ==========================================

        if (currentStock <= 0) {

            notificationType = "STOCK_OUT";

            title = "🚨 Product Out of Stock";

            message =
                `${product.name} (${product.sku || "No SKU"}) is out of stock. Immediate restocking required.`;

        }

        // ==========================================
        // LOW STOCK
        //
        // 1,2,3,4,5
        // ==========================================

        else if (currentStock <= 5) {

            notificationType = "STOCK_LOW";

            title = "⚠️ Low Stock Alert";

            message =
                `${product.name} (${product.sku || "No SKU"}) has only ${currentStock} item${currentStock === 1 ? "" : "s"} left in stock.`;

        }

        // ==========================================
        // STOCK ABOVE 5
        // No notification
        // ==========================================

        else {

            return;

        }


        // ==========================================
        // FIND ADMIN + INVENTORY USERS
        // ==========================================

        const users = await User
            .find({
                role: {
                    $in: [
                        "ADMIN",
                        "INVENTORY"
                    ]
                }
            })
            .select("_id role");


        if (!users.length) {

            console.log(
                "No ADMIN or INVENTORY users found for stock notification"
            );

            return;

        }


        // ==========================================
        // CREATE NOTIFICATIONS
        // ==========================================

        const notifications = users.map((user) => ({

            user: user._id,

            type: notificationType,

            title,

            message,

            relatedId: product._id,

            relatedModel: "Product",

            isRead: false

        }));


        // ==========================================
        // SAVE
        // ==========================================

        await Notification.insertMany(
            notifications
        );


        console.log(
            `STOCK NOTIFICATION SENT: ${notificationType} -> ${users.length} users`
        );

    }
    catch (error) {

        // IMPORTANT:
        // Notification fail hone par
        // stock operation fail nahi hoga.

        console.error(
            "INVENTORY NOTIFICATION ERROR:",
            error
        );

    }

};


// ======================================================
// CUSTOMER PRODUCT RESTOCK NOTIFICATION
// ======================================================

const sendProductRestockedNotification = async ({
    productId
}) => {

    try {

        const product =
            await Product
                .findById(productId)
                .select("name sku");

        if (!product) {

            console.log(
                "Restock notification product not found:",
                productId
            );

            return;

        }


        // ==========================================
        // CUSTOMERS
        // ==========================================

        const customers =
            await User
                .find({
                    role: "CUSTOMER"
                })
                .select("_id");


        if (!customers.length) {

            console.log(
                "No customers found for restock notification"
            );

            return;

        }


        // ==========================================
        // CREATE NOTIFICATIONS
        // ==========================================

        const notifications =
            customers.map((customer) => ({

                user: customer._id,

                type: "PRODUCT_RESTOCKED",

                title:
                    "🛍️ Product Back in Stock",

                message:
                    `${product.name} is now back in stock and available to purchase.`,

                relatedId:
                    product._id,

                relatedModel:
                    "Product",

                isRead: false

            }));


        await Notification.insertMany(
            notifications
        );


        console.log(
            `RESTOCK NOTIFICATION SENT TO ${notifications.length} CUSTOMERS`
        );

    }
    catch (error) {

        console.error(
            "CUSTOMER RESTOCK NOTIFICATION ERROR:",
            error
        );

    }

};


// ======================================================
// CREATE INVENTORY
// ======================================================

export const createInventoryService = async (
    data
) => {

    const existingInventory =
        await inventoryRepository
            .getInventoryByProductId(
                data.product
            );


    if (existingInventory) {

        throw new Error(
            "Inventory already exists"
        );

    }


    data.currentStock =
        Number(data.currentStock || 0);

    data.minimumStock =
        Number(data.minimumStock || 0);


    data.status =
        calculateStatus(
            data.currentStock,
            data.minimumStock
        );


    const inventory =
        await inventoryRepository
            .createInventory(data);


    // ==========================================
    // INITIAL STOCK ALERT
    // ==========================================

    await sendInventoryNotification({

        productId:
            data.product,

        currentStock:
            data.currentStock,

        minimumStock:
            data.minimumStock

    });


    return inventory;

};


// ======================================================
// GET ALL INVENTORY
// ======================================================

export const getAllInventoryService =
async () => {

    return await inventoryRepository
        .getAllInventory();

};


// ======================================================
// GET INVENTORY BY ID
// ======================================================

export const getInventoryByIdService =
async (id) => {

    const inventory =
        await inventoryRepository
            .getInventoryById(id);


    if (!inventory) {

        throw new Error(
            "Inventory not found"
        );

    }


    return inventory;

};


// ======================================================
// UPDATE INVENTORY
// ======================================================

export const updateInventoryService =
async (
    id,
    data
) => {

    const inventory =
        await inventoryRepository
            .getInventoryById(id);


    if (!inventory) {

        throw new Error(
            "Inventory not found"
        );

    }


    const stock =
        data.currentStock !== undefined
            ? Number(data.currentStock)
            : Number(inventory.currentStock || 0);


    const minimumStock =
        data.minimumStock !== undefined
            ? Number(data.minimumStock)
            : Number(inventory.minimumStock || 0);


    data.currentStock = stock;

    data.minimumStock = minimumStock;

    data.status =
        calculateStatus(
            stock,
            minimumStock
        );


    const updatedInventory =
        await inventoryRepository
            .updateInventory(
                id,
                data
            );


    // ==========================================
    // STOCK NOTIFICATION
    // ==========================================

    await sendInventoryNotification({

        productId:
            inventory.product,

        currentStock:
            stock,

        minimumStock:
            minimumStock

    });


    return updatedInventory;

};


// ======================================================
// DELETE INVENTORY
// ======================================================

export const deleteInventoryService =
async (id) => {

    return await inventoryRepository
        .deleteInventory(id);

};


// ======================================================
// ADD STOCK
// ======================================================

export const addStockService =
async (
    productId,
    quantity,
    userId
) => {

    // ==========================================
    // IMPORTANT:
    // Frontend se quantity string aa sakti hai
    // "5" -> 5
    // ==========================================

    quantity = Number(quantity);


    // ==========================================
    // VALIDATE
    // ==========================================

    if (
        !Number.isInteger(quantity) ||
        quantity <= 0
    ) {

        throw new Error(
            "Quantity must be a positive whole number"
        );

    }


    // ==========================================
    // FIND INVENTORY
    // ==========================================

    const inventory =
        await inventoryRepository
            .getInventoryByProductId(
                productId
            );


    if (!inventory) {

        throw new Error(
            "Inventory not found for this product"
        );

    }


    // ==========================================
    // PREVIOUS STOCK
    // ==========================================

    const previousStock =
        Number(
            inventory.currentStock || 0
        );


    // ==========================================
    // UPDATED STOCK
    // ==========================================

    const updatedStock =
        previousStock + quantity;


    // ==========================================
    // STATUS
    // ==========================================

    const status =
        calculateStatus(
            updatedStock,
            inventory.minimumStock
        );


    // ==========================================
    // UPDATE
    // ==========================================

    const updatedInventory =
        await inventoryRepository
            .updateInventory(

                inventory._id,

                {

                    currentStock:
                        updatedStock,

                    status,

                    lastUpdatedBy:
                        userId

                }

            );


    // ==========================================
    // STOCK HISTORY
    // ==========================================

    await createStockTransactionService({

        product:
            inventory.product,

        inventory:
            inventory._id,

        type:
            "STOCK_IN",

        quantity:
            quantity,

        previousStock:
            previousStock,

        updatedStock:
            updatedStock,

        description:
            "Stock added by Inventory Manager",

        createdBy:
            userId

    });


    // ==========================================
    // STOCK ALERT
    // ==========================================

    await sendInventoryNotification({

        productId:

            inventory.product,

        currentStock:
            updatedStock,

        minimumStock:
            inventory.minimumStock

    });


    // ==========================================
    // RESTOCK CUSTOMER NOTIFICATION
    //
    // Sirf jab previous stock 0 tha
    // aur stock add hua.
    // ==========================================

    if (previousStock === 0 && updatedStock > 0) {

        await sendProductRestockedNotification({

            productId:
                inventory.product

        });

    }


    return updatedInventory;

};


// ======================================================
// REMOVE STOCK
// ======================================================

export const removeStockService =
async (
    productId,
    quantity,
    userId,
    transactionType = "STOCK_OUT",
    description = "Stock removed"
) => {

    quantity = Number(quantity);


    // ==========================================
    // VALIDATE
    // ==========================================

    if (
        !Number.isInteger(quantity) ||
        quantity <= 0
    ) {

        throw new Error(
            "Quantity must be a positive whole number"
        );

    }


    // ==========================================
    // FIND
    // ==========================================

    const inventory =
        await inventoryRepository
            .getInventoryByProductId(
                productId
            );


    if (!inventory) {

        throw new Error(
            "Inventory not found"
        );

    }


    // ==========================================
    // AVAILABLE STOCK
    // ==========================================

    const availableStock =
        Number(inventory.currentStock || 0) -
        Number(inventory.reservedStock || 0);


    if (
        availableStock < quantity
    ) {

        throw new Error(
            `Not enough stock available. Available stock: ${Math.max(availableStock, 0)}`
        );

    }


    // ==========================================
    // PREVIOUS
    // ==========================================

    const previousStock =
        Number(
            inventory.currentStock || 0
        );


    // ==========================================
    // UPDATED
    // ==========================================

    const updatedStock =
        previousStock - quantity;


    // ==========================================
    // STATUS
    // ==========================================

    const status =
        calculateStatus(
            updatedStock,
            inventory.minimumStock
        );


    // ==========================================
    // UPDATE
    // ==========================================

    const updatedInventory =
        await inventoryRepository
            .updateInventory(

                inventory._id,

                {

                    currentStock:
                        updatedStock,

                    status,

                    lastUpdatedBy:
                        userId

                }

            );


    // ==========================================
    // HISTORY
    // ==========================================

    await createStockTransactionService({

        product:
            inventory.product,

        inventory:
            inventory._id,

        type:
            transactionType,

        quantity,

        previousStock,

        updatedStock,

        description,

        createdBy:
            userId

    });


    // ==========================================
    // NOTIFICATION
    // ==========================================

    await sendInventoryNotification({

        productId:
            inventory.product,

        currentStock:
            updatedStock,

        minimumStock:
            inventory.minimumStock

    });


    return updatedInventory;

};


// ======================================================
// USE STOCK FOR REPAIR
// ======================================================

export const useStockForRepairService =
async (
    productId,
    quantity,
    userId,
    repairId
) => {

    quantity = Number(quantity);


    if (
        !Number.isInteger(quantity) ||
        quantity <= 0
    ) {

        throw new Error(
            "Quantity must be a positive whole number"
        );

    }


    const inventory =
        await Inventory.findOne({

            product:
                productId,

            isDeleted:
                false

        });


    if (!inventory) {

        throw new Error(
            "Inventory not found for this product"
        );

    }


    const availableStock =
        Number(inventory.currentStock || 0) -
        Number(inventory.reservedStock || 0);


    if (
        availableStock < quantity
    ) {

        throw new Error(
            `Insufficient stock. Available stock: ${availableStock}`
        );

    }


    const previousStock =
        Number(
            inventory.currentStock || 0
        );


    inventory.currentStock =
        previousStock - quantity;


    inventory.status =
        calculateStatus(

            inventory.currentStock,

            inventory.minimumStock

        );


    inventory.lastUpdatedBy =
        userId;


    await inventory.save();


    // ==========================================
    // HISTORY
    // ==========================================

    await StockTransaction.create({

        product:
            productId,

        inventory:
            inventory._id,

        repair:
            repairId,

        type:
            "REPAIR_USAGE",

        quantity,

        previousStock,

        updatedStock:
            inventory.currentStock,

        salePrice:
            0,

        totalAmount:
            0,

        orderSource:
            "MANUAL",

        description:
            "Spare part used in repair",

        createdBy:
            userId

    });


    // ==========================================
    // NOTIFICATION
    // ==========================================

    await sendInventoryNotification({

        productId,

        currentStock:
            inventory.currentStock,

        minimumStock:
            inventory.minimumStock

    });


    return inventory;

};


// ======================================================
// RETURN STOCK
// ======================================================

export const returnStockService =
async (
    productId,
    quantity,
    userId,
    description = "Stock returned"
) => {

    quantity = Number(quantity);


    if (
        !Number.isInteger(quantity) ||
        quantity <= 0
    ) {

        throw new Error(
            "Quantity must be a positive whole number"
        );

    }


    const inventory =
        await inventoryRepository
            .getInventoryByProductId(
                productId
            );


    if (!inventory) {

        throw new Error(
            "Inventory not found"
        );

    }


    const previousStock =
        Number(
            inventory.currentStock || 0
        );


    const updatedStock =
        previousStock + quantity;


    const status =
        calculateStatus(
            updatedStock,
            inventory.minimumStock
        );


    const updatedInventory =
        await inventoryRepository
            .updateInventory(

                inventory._id,

                {

                    currentStock:
                        updatedStock,

                    status,

                    lastUpdatedBy:
                        userId

                }

            );


    await createStockTransactionService({

        product:
            inventory.product,

        inventory:
            inventory._id,

        type:
            "RETURN",

        quantity,

        previousStock,

        updatedStock,

        description,

        createdBy:
            userId

    });


    // ==========================================
    // NOTIFICATION
    // ==========================================

    await sendInventoryNotification({

        productId:
            inventory.product,

        currentStock:
            updatedStock,

        minimumStock:
            inventory.minimumStock

    });


    return updatedInventory;

};


// ======================================================
// RESERVE STOCK
// ======================================================

export const reserveStockService =
async (
    productId,
    quantity,
    userId
) => {

    quantity = Number(quantity);


    if (
        !Number.isInteger(quantity) ||
        quantity <= 0
    ) {

        throw new Error(
            "Quantity must be a positive whole number"
        );

    }


    const inventory =
        await inventoryRepository
            .getInventoryByProductId(
                productId
            );


    if (!inventory) {

        throw new Error(
            "Inventory not found"
        );

    }


    const availableStock =
        Number(inventory.currentStock || 0) -
        Number(inventory.reservedStock || 0);


    if (
        availableStock < quantity
    ) {

        throw new Error(
            `Product not available. Available stock: ${availableStock}`
        );

    }


    const updatedInventory =
        await inventoryRepository
            .updateInventory(

                inventory._id,

                {

                    $inc: {

                        reservedStock:
                            quantity

                    },

                    lastUpdatedBy:
                        userId

                }

            );


    // IMPORTANT:
    // currentStock change nahi hua,
    // isliye LOW/OUT current-stock notification
    // duplicate nahi bhejenge.

    return updatedInventory;

};


// ======================================================
// RELEASE RESERVED STOCK
// ======================================================

export const releaseReservedStockService =
async (
    productId,
    quantity,
    userId
) => {

    quantity = Number(quantity);


    if (
        !Number.isInteger(quantity) ||
        quantity <= 0
    ) {

        throw new Error(
            "Quantity must be a positive whole number"
        );

    }


    const inventory =
        await inventoryRepository
            .getInventoryByProductId(
                productId
            );


    if (!inventory) {

        throw new Error(
            "Inventory not found"
        );

    }


    const reservedStock =
        Number(
            inventory.reservedStock || 0
        );


    if (
        reservedStock < quantity
    ) {

        throw new Error(
            "Cannot release more than reserved stock"
        );

    }


    return await inventoryRepository
        .updateInventory(

            inventory._id,

            {

                $inc: {

                    reservedStock:
                        -quantity

                },

                lastUpdatedBy:
                    userId

            }

        );

};