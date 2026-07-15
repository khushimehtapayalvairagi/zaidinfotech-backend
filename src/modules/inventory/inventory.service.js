import * as inventoryRepository 
from "./inventory.repository.js";


import {
    INVENTORY_STATUS
}
from "../../common/constants/inventoryStatus.js";

import {
    createStockTransactionService
}
from "./stockTransaction/stockTransaction.service.js";

// ==============================
// Calculate Inventory Status
// ==============================

const calculateStatus = (
    currentStock,
    minimumStock
)=>{


    if(currentStock <= 0){

        return INVENTORY_STATUS.OUT_OF_STOCK;

    }


    if(currentStock <= minimumStock){

        return INVENTORY_STATUS.LOW_STOCK;

    }


    return INVENTORY_STATUS.IN_STOCK;

};





// ==============================
// Create Inventory
// ==============================

export const createInventoryService = async(data)=>{


    const existingInventory =
    await inventoryRepository
    .getInventoryByProductId(
        data.product
    );



    if(existingInventory){

        throw new Error(
            "Inventory already exists"
        );

    }



    data.status =
    calculateStatus(
        data.currentStock,
        data.minimumStock
    );



    return await inventoryRepository
    .createInventory(data);


};







// ==============================
// Get All Inventory
// ==============================

export const getAllInventoryService =
async()=>{


    return await inventoryRepository
    .getAllInventory();


};








// ==============================
// Get Inventory By Id
// ==============================

export const getInventoryByIdService =
async(id)=>{


    const inventory =
    await inventoryRepository
    .getInventoryById(id);



    if(!inventory){

        throw new Error(
            "Inventory not found"
        );

    }



    return inventory;

};









// ==============================
// Update Inventory
// ==============================

export const updateInventoryService =
async(
    id,
    data
)=>{


    const inventory =
    await inventoryRepository
    .getInventoryById(id);



    if(!inventory){

        throw new Error(
            "Inventory not found"
        );

    }




    const stock =
    data.currentStock ??
    inventory.currentStock;



    const minimumStock =
    data.minimumStock ??
    inventory.minimumStock;



    data.status =
    calculateStatus(
        stock,
        minimumStock
    );




    return await inventoryRepository
    .updateInventory(
        id,
        data
    );


};









// ==============================
// Delete Inventory
// ==============================

export const deleteInventoryService =
async(id)=>{


    return await inventoryRepository
    .deleteInventory(id);


};









// ==============================
// Add Stock
// ==============================
export const addStockService =
async(
    productId,
    quantity,
    userId
)=>{


    const inventory =
    await inventoryRepository
    .getInventoryByProductId(
        productId
    );


    if(!inventory){

        throw new Error(
            "Inventory not found"
        );

    }



    const previousStock =
    inventory.currentStock;



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

            currentStock:updatedStock,

            status,

            lastUpdatedBy:userId

        }

    );





    // Create Stock History

    await createStockTransactionService({

        product:inventory.product,

        inventory:inventory._id,

        type:"STOCK_IN",

        quantity:quantity,

        previousStock:previousStock,

        updatedStock:updatedStock,

        description:
        "Stock added by Inventory Manager",

        createdBy:userId

    });





    return updatedInventory;


};








// ==============================
// Remove Stock
// Order / Repair use
// ==============================

export const removeStockService =
async(
    productId,
    quantity,
    userId,
    transactionType="STOCK_OUT",
    description="Stock removed"
)=>{


    const inventory =
    await inventoryRepository
    .getInventoryByProductId(
        productId
    );



    if(!inventory){

        throw new Error(
            "Inventory not found"
        );

    }




    const availableStock =
    inventory.currentStock -
    inventory.reservedStock;



    if(
        availableStock < quantity
    ){

        throw new Error(
            "Not enough stock available"
        );

    }




    const previousStock =
    inventory.currentStock;



    const updatedStock =
    previousStock - quantity;




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

            currentStock:updatedStock,

            status,

            lastUpdatedBy:userId

        }

    );






    // Automatic History

    await createStockTransactionService({

        product:inventory.product,

        inventory:inventory._id,


        type:transactionType,


        quantity:quantity,


        previousStock:previousStock,


        updatedStock:updatedStock,


        description:description,


        createdBy:userId

    });





    return updatedInventory;


};

// ==============================
// Return Stock
// Order Return / Rental Return
// ==============================


export const returnStockService =
async(
    productId,
    quantity,
    userId,
    description="Stock returned"
)=>{


    const inventory =
    await inventoryRepository
    .getInventoryByProductId(
        productId
    );



    if(!inventory){

        throw new Error(
            "Inventory not found"
        );

    }




    const previousStock =
    inventory.currentStock;



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

            currentStock:updatedStock,

            status,

            lastUpdatedBy:userId

        }

    );






    // Create History

    await createStockTransactionService({

        product:inventory.product,

        inventory:inventory._id,

        type:"RETURN",

        quantity:quantity,

        previousStock:previousStock,

        updatedStock:updatedStock,

        description:description,

        createdBy:userId

    });






    return updatedInventory;


};









// ==============================
// Reserve Stock
// Order Pending
// ==============================

export const reserveStockService =
async(
    productId,
    quantity,
    userId
)=>{


    const inventory =
    await inventoryRepository
    .getInventoryByProductId(
        productId
    );



    if(!inventory){

        throw new Error(
            "Inventory not found"
        );

    }



    const availableStock =
    inventory.currentStock -
    inventory.reservedStock;




    if(
        availableStock < quantity
    ){

        throw new Error(
            "Product not available"
        );

    }




    return await inventoryRepository
    .updateInventory(

        inventory._id,

        {

            $inc:{

                reservedStock:quantity

            },

            lastUpdatedBy:userId

        }

    );


};









// ==============================
// Release Reserved Stock
// Order Cancel
// ==============================

export const releaseReservedStockService =
async(
    productId,
    quantity,
    userId
)=>{


    const inventory =
    await inventoryRepository
    .getInventoryByProductId(
        productId
    );



    if(!inventory){

        throw new Error(
            "Inventory not found"
        );

    }




    return await inventoryRepository
    .updateInventory(

        inventory._id,

        {

            $inc:{

                reservedStock:-quantity

            },


            lastUpdatedBy:userId

        }

    );


};