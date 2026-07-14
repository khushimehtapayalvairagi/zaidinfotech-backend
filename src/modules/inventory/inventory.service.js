import * as inventoryRepository from "./inventory.repository.js";

import {
    INVENTORY_STATUS
} from "../../common/constants/inventoryStatus.js";



// Create Inventory

export const createInventoryService = async(data)=>{


    const existingInventory =
        await inventoryRepository.getInventoryByProductId(
            data.product
        );


    if(existingInventory){

        throw new Error(
            "Inventory already exists for this product"
        );

    }



    if(data.currentStock > data.minimumStock){

        data.status = INVENTORY_STATUS.IN_STOCK;

    }
    else if(data.currentStock > 0){

        data.status = INVENTORY_STATUS.LOW_STOCK;

    }
    else{

        data.status = INVENTORY_STATUS.OUT_OF_STOCK;

    }



    return await inventoryRepository.createInventory(
        data
    );

};





// Get All Inventory

export const getAllInventoryService = async()=>{


    return await inventoryRepository.getAllInventory();

};





// Get Inventory By Id

export const getInventoryByIdService = async(id)=>{


    const inventory =
        await inventoryRepository.getInventoryById(id);



    if(!inventory){

        throw new Error(
            "Inventory not found"
        );

    }


    return inventory;

};





// Update Inventory

export const updateInventoryService = async(
    id,
    data
)=>{


    const inventory =
        await inventoryRepository.getInventoryById(id);



    if(!inventory){

        throw new Error(
            "Inventory not found"
        );

    }



    if(data.currentStock !== undefined){


        if(
            data.currentStock >
            (data.minimumStock || inventory.minimumStock)
        ){

            data.status =
            INVENTORY_STATUS.IN_STOCK;

        }
        else if(data.currentStock > 0){

            data.status =
            INVENTORY_STATUS.LOW_STOCK;

        }
        else{

            data.status =
            INVENTORY_STATUS.OUT_OF_STOCK;

        }

    }



    return await inventoryRepository.updateInventory(
        id,
        data
    );

};





// Delete Inventory

export const deleteInventoryService = async(id)=>{


    const inventory =
        await inventoryRepository.getInventoryById(id);



    if(!inventory){

        throw new Error(
            "Inventory not found"
        );

    }


    return await inventoryRepository.deleteInventory(id);

};





// Add Stock

export const addStockService = async(
    productId,
    quantity,
    userId
)=>{


    const inventory =
        await inventoryRepository
        .getInventoryByProductId(productId);



    if(!inventory){

        throw new Error(
            "Inventory not found"
        );

    }



    const newStock =
        inventory.currentStock + quantity;



    let status;



    if(newStock > inventory.minimumStock){

        status =
        INVENTORY_STATUS.IN_STOCK;

    }
    else if(newStock > 0){

        status =
        INVENTORY_STATUS.LOW_STOCK;

    }
    else{

        status =
        INVENTORY_STATUS.OUT_OF_STOCK;

    }



    return await inventoryRepository.updateInventory(

        inventory._id,

        {

            currentStock:newStock,

            status,

            lastUpdatedBy:userId

        }

    );

};





// Remove Stock

export const removeStockService = async(
    productId,
    quantity,
    userId
)=>{


    const inventory =
        await inventoryRepository
        .getInventoryByProductId(productId);



    if(!inventory){

        throw new Error(
            "Inventory not found"
        );

    }



    if(
        inventory.currentStock < quantity
    ){

        throw new Error(
            "Insufficient stock"
        );

    }



    const newStock =
        inventory.currentStock - quantity;



    let status;



    if(newStock > inventory.minimumStock){

        status =
        INVENTORY_STATUS.IN_STOCK;

    }
    else if(newStock > 0){

        status =
        INVENTORY_STATUS.LOW_STOCK;

    }
    else{

        status =
        INVENTORY_STATUS.OUT_OF_STOCK;

    }




    return await inventoryRepository.updateInventory(

        inventory._id,

        {

            currentStock:newStock,

            status,

            lastUpdatedBy:userId

        }

    );


};