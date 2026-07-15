import * as inventoryService 
from "./inventory.service.js";


import {
successResponse,
errorResponse
}
from "../../common/utils/apiResponse.js";




// ==============================
// Create Inventory
// ==============================

export const createInventory = async(req,res)=>{

    try{


        const inventory =
        await inventoryService
        .createInventoryService({

            ...req.body,

            lastUpdatedBy:req.user.id

        });



        return successResponse(

            res,

            201,

            "Inventory created successfully",

            inventory

        );


    }
    catch(error){

        return errorResponse(

            res,

            400,

            error.message

        );

    }

};







// ==============================
// Get All Inventory
// ==============================

export const getAllInventory = async(req,res)=>{

    try{


        const inventory =
        await inventoryService
        .getAllInventoryService();



        return successResponse(

            res,

            200,

            "Inventory fetched successfully",

            inventory

        );


    }
    catch(error){


        return errorResponse(

            res,

            500,

            error.message

        );


    }

};








// ==============================
// Get Inventory By ID
// ==============================

export const getInventoryById = async(req,res)=>{


    try{


        const inventory =
        await inventoryService
        .getInventoryByIdService(
            req.params.id
        );



        return successResponse(

            res,

            200,

            "Inventory fetched successfully",

            inventory

        );


    }
    catch(error){

        return errorResponse(

            res,

            404,

            error.message

        );

    }


};










// ==============================
// Update Inventory
// ==============================

export const updateInventory = async(req,res)=>{


    try{


        const inventory =
        await inventoryService
        .updateInventoryService(

            req.params.id,

            {

            ...req.body,

            lastUpdatedBy:req.user.id

            }

        );



        return successResponse(

            res,

            200,

            "Inventory updated successfully",

            inventory

        );



    }
    catch(error){


        return errorResponse(

            res,

            400,

            error.message

        );


    }


};









// ==============================
// Delete Inventory
// ==============================

export const deleteInventory = async(req,res)=>{


    try{


        await inventoryService
        .deleteInventoryService(
            req.params.id
        );



        return successResponse(

            res,

            200,

            "Inventory deleted successfully"

        );


    }
    catch(error){


        return errorResponse(

            res,

            400,

            error.message

        );

    }


};









// ==============================
// Add Stock
// ==============================

export const addStock = async(req,res)=>{


    try{


        const {

            productId,

            quantity

        } = req.body;




        const inventory =
        await inventoryService
        .addStockService(

            productId,

            quantity,

            req.user.id

        );



        return successResponse(

            res,

            200,

            "Stock added successfully",

            inventory

        );



    }
    catch(error){


        return errorResponse(

            res,

            400,

            error.message

        );


    }


};









// ==============================
// Remove Stock
// ==============================

export const removeStock = async(req,res)=>{


    try{


        const {

            productId,

            quantity

        } = req.body;




        const inventory =
        await inventoryService
        .removeStockService(

            productId,

            quantity,

            req.user.id

        );



        return successResponse(

            res,

            200,

            "Stock removed successfully",

            inventory

        );


    }
    catch(error){

        return errorResponse(

            res,

            400,

            error.message

        );

    }

};









// ==============================
// Reserve Stock
// Order Pending
// ==============================

export const reserveStock = async(req,res)=>{


    try{


        const {

            productId,

            quantity

        } = req.body;



        const inventory =
        await inventoryService
        .reserveStockService(

            productId,

            quantity,

            req.user.id

        );



        return successResponse(

            res,

            200,

            "Stock reserved successfully",

            inventory

        );


    }
    catch(error){


        return errorResponse(

            res,

            400,

            error.message

        );


    }


};









// ==============================
// Release Reserved Stock
// Order Cancel
// ==============================

export const releaseReservedStock = async(req,res)=>{


    try{


        const {

            productId,

            quantity

        } = req.body;



        const inventory =
        await inventoryService
        .releaseReservedStockService(

            productId,

            quantity,

            req.user.id

        );



        return successResponse(

            res,

            200,

            "Reserved stock released",

            inventory

        );


    }
    catch(error){


        return errorResponse(

            res,

            400,

            error.message

        );


    }


};

// ==============================
// Return Stock
// ==============================


export const returnStock = async(req,res)=>{


try{


const {

productId,

quantity,

description

}=req.body;




const inventory =
await inventoryService
.returnStockService(

productId,

quantity,

req.user.id,

description

);




return successResponse(

res,

200,

"Stock returned successfully",

inventory

);



}
catch(error){


return errorResponse(

res,

400,

error.message

);


}



};