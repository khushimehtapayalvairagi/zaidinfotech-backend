// import * as inventoryService 
// from "./inventory.service.js";


// import {
// successResponse,
// errorResponse
// }
// from "../../common/utils/apiResponse.js";


// import Inventory from "./inventory.model.js";

// // ======================================================
// // PUBLIC SHOP INVENTORY
// // Customer ke liye stock dekhne ka API
// // ======================================================

// export const getShopInventory = async (req, res) => {
//     try {

//         const inventory = await Inventory.find({
//             isDeleted: false
//         })
//         .populate({
//             path: "product",
//             select: "_id name sku"
//         })
//         .lean();

//         const data = inventory.map((item) => {

//             const currentStock =
//                 Number(item.currentStock || 0);

//             const reservedStock =
//                 Number(item.reservedStock || 0);

//             const availableStock =
//                 Math.max(
//                     currentStock - reservedStock,
//                     0
//                 );

//             let status = "OUT_OF_STOCK";

//             if (availableStock > 0) {

//                 if (
//                     item.minimumStock !== undefined &&
//                     availableStock <= Number(item.minimumStock)
//                 ) {

//                     status = "LOW_STOCK";

//                 } else {

//                     status = "IN_STOCK";

//                 }

//             }

//             return {

//                 _id: item._id,

//                 product: item.product,

//                 currentStock,

//                 reservedStock,

//                 availableStock,

//                 minimumStock:
//                     Number(item.minimumStock || 0),

//                 maximumStock:
//                     Number(item.maximumStock || 0),

//                 status

//             };

//         });

//         return res.status(200).json({

//             success: true,

//             message:
//                 "Shop inventory fetched successfully",

//             data

//         });

//     }

//     catch (error) {

//         console.error(
//             "SHOP INVENTORY ERROR:",
//             error
//         );

//         return res.status(500).json({

//             success: false,

//             message:
//                 "Failed to fetch shop inventory",

//             error:
//                 error.message

//         });

//     }
// };

// // ==============================
// // Create Inventory
// // ==============================

// export const createInventory = async(req,res)=>{

//     try{


//         const inventory =
//         await inventoryService
//         .createInventoryService({

//             ...req.body,

//             lastUpdatedBy:req.user.id

//         });



//         return successResponse(

//             res,

//             201,

//             "Inventory created successfully",

//             inventory

//         );


//     }
//     catch(error){

//         return errorResponse(

//             res,

//             400,

//             error.message

//         );

//     }

// };







// // ==============================
// // Get All Inventory
// // ==============================

// export const getAllInventory = async(req,res)=>{

//     try{


//         const inventory =
//         await inventoryService
//         .getAllInventoryService();



//         return successResponse(

//             res,

//             200,

//             "Inventory fetched successfully",

//             inventory

//         );


//     }
//     catch(error){


//         return errorResponse(

//             res,

//             500,

//             error.message

//         );


//     }

// };








// // ==============================
// // Get Inventory By ID
// // ==============================

// export const getInventoryById = async(req,res)=>{


//     try{


//         const inventory =
//         await inventoryService
//         .getInventoryByIdService(
//             req.params.id
//         );



//         return successResponse(

//             res,

//             200,

//             "Inventory fetched successfully",

//             inventory

//         );


//     }
//     catch(error){

//         return errorResponse(

//             res,

//             404,

//             error.message

//         );

//     }


// };










// // ==============================
// // Update Inventory
// // ==============================

// export const updateInventory = async(req,res)=>{


//     try{


//         const inventory =
//         await inventoryService
//         .updateInventoryService(

//             req.params.id,

//             {

//             ...req.body,

//             lastUpdatedBy:req.user.id

//             }

//         );



//         return successResponse(

//             res,

//             200,

//             "Inventory updated successfully",

//             inventory

//         );



//     }
//     catch(error){


//         return errorResponse(

//             res,

//             400,

//             error.message

//         );


//     }


// };









// // ==============================
// // Delete Inventory
// // ==============================

// export const deleteInventory = async(req,res)=>{


//     try{


//         await inventoryService
//         .deleteInventoryService(
//             req.params.id
//         );



//         return successResponse(

//             res,

//             200,

//             "Inventory deleted successfully"

//         );


//     }
//     catch(error){


//         return errorResponse(

//             res,

//             400,

//             error.message

//         );

//     }


// };









// // ==============================
// // Add Stock
// // ==============================

// export const addStock = async(req,res)=>{


//     try{


//         const {

//             productId,

//             quantity

//         } = req.body;




//         const inventory =
//         await inventoryService
//         .addStockService(

//             productId,

//             quantity,

//             req.user.id

//         );



//         return successResponse(

//             res,

//             200,

//             "Stock added successfully",

//             inventory

//         );



//     }
//     catch(error){


//         return errorResponse(

//             res,

//             400,

//             error.message

//         );


//     }


// };









// // ==============================
// // Remove Stock
// // ==============================

// export const removeStock = async(req,res)=>{


//     try{


//         const {

//             productId,

//             quantity

//         } = req.body;




//         const inventory =
//         await inventoryService
//         .removeStockService(

//             productId,

//             quantity,

//             req.user.id

//         );



//         return successResponse(

//             res,

//             200,

//             "Stock removed successfully",

//             inventory

//         );


//     }
//     catch(error){

//         return errorResponse(

//             res,

//             400,

//             error.message

//         );

//     }

// };









// // ==============================
// // Reserve Stock
// // Order Pending
// // ==============================

// export const reserveStock = async(req,res)=>{


//     try{


//         const {

//             productId,

//             quantity

//         } = req.body;



//         const inventory =
//         await inventoryService
//         .reserveStockService(

//             productId,

//             quantity,

//             req.user.id

//         );



//         return successResponse(

//             res,

//             200,

//             "Stock reserved successfully",

//             inventory

//         );


//     }
//     catch(error){


//         return errorResponse(

//             res,

//             400,

//             error.message

//         );


//     }


// };









// // ==============================
// // Release Reserved Stock
// // Order Cancel
// // ==============================

// export const releaseReservedStock = async(req,res)=>{


//     try{


//         const {

//             productId,

//             quantity

//         } = req.body;



//         const inventory =
//         await inventoryService
//         .releaseReservedStockService(

//             productId,

//             quantity,

//             req.user.id

//         );



//         return successResponse(

//             res,

//             200,

//             "Reserved stock released",

//             inventory

//         );


//     }
//     catch(error){


//         return errorResponse(

//             res,

//             400,

//             error.message

//         );


//     }


// };

// // ==============================
// // Return Stock
// // ==============================


// export const returnStock = async(req,res)=>{


// try{


// const {

// productId,

// quantity,

// description

// }=req.body;




// const inventory =
// await inventoryService
// .returnStockService(

// productId,

// quantity,

// req.user.id,

// description

// );




// return successResponse(

// res,

// 200,

// "Stock returned successfully",

// inventory

// );



// }
// catch(error){


// return errorResponse(

// res,

// 400,

// error.message

// );


// }



// };
import * as inventoryService
    from "./inventory.service.js";

import {
    successResponse,
    errorResponse
} from "../../common/utils/apiResponse.js";

import Inventory from "./inventory.model.js";


// ======================================================
// PUBLIC SHOP INVENTORY
// ======================================================

export const getShopInventory = async (
    req,
    res
) => {

    try {

        const inventory =
            await Inventory.find({

                isDeleted: false

            })

            .populate({

                path: "product",

                select: "_id name sku"

            })

            .lean();


        const data =
            inventory.map((item) => {

                const currentStock =
                    Number(
                        item.currentStock || 0
                    );


                const reservedStock =
                    Number(
                        item.reservedStock || 0
                    );


                const availableStock =
                    Math.max(

                        currentStock -
                        reservedStock,

                        0

                    );


                let status =
                    "OUT_OF_STOCK";


                if (
                    availableStock > 0
                ) {

                    if (
                        item.minimumStock !== undefined &&
                        availableStock <=
                        Number(
                            item.minimumStock
                        )
                    ) {

                        status =
                            "LOW_STOCK";

                    }
                    else {

                        status =
                            "IN_STOCK";

                    }

                }


                return {

                    _id:
                        item._id,

                    product:
                        item.product,

                    currentStock,

                    reservedStock,

                    availableStock,

                    minimumStock:
                        Number(
                            item.minimumStock || 0
                        ),

                    maximumStock:
                        Number(
                            item.maximumStock || 0
                        ),

                    status

                };

            });


        return res.status(200).json({

            success: true,

            message:
                "Shop inventory fetched successfully",

            data

        });

    }
    catch (error) {

        console.error(
            "SHOP INVENTORY ERROR:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Failed to fetch shop inventory",

            error:
                error.message

        });

    }

};


// ======================================================
// CREATE INVENTORY
// ======================================================

export const createInventory =
async (
    req,
    res
) => {

    try {

        const userId =
            req.user?.id ||
            req.user?._id;


        const inventory =
            await inventoryService
                .createInventoryService({

                    ...req.body,

                    lastUpdatedBy:
                        userId

                });


        return successResponse(

            res,

            201,

            "Inventory created successfully",

            inventory

        );

    }
    catch (error) {

        return errorResponse(

            res,

            400,

            error.message

        );

    }

};


// ======================================================
// GET ALL INVENTORY
// ======================================================

export const getAllInventory =
async (
    req,
    res
) => {

    try {

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
    catch (error) {

        return errorResponse(

            res,

            500,

            error.message

        );

    }

};


// ======================================================
// GET INVENTORY BY ID
// ======================================================

export const getInventoryById =
async (
    req,
    res
) => {

    try {

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
    catch (error) {

        return errorResponse(

            res,

            404,

            error.message

        );

    }

};


// ======================================================
// UPDATE INVENTORY
// ======================================================

export const updateInventory =
async (
    req,
    res
) => {

    try {

        const userId =
            req.user?.id ||
            req.user?._id;


        const inventory =
            await inventoryService
                .updateInventoryService(

                    req.params.id,

                    {

                        ...req.body,

                        lastUpdatedBy:
                            userId

                    }

                );


        return successResponse(

            res,

            200,

            "Inventory updated successfully",

            inventory

        );

    }
    catch (error) {

        return errorResponse(

            res,

            400,

            error.message

        );

    }

};


// ======================================================
// DELETE INVENTORY
// ======================================================

export const deleteInventory =
async (
    req,
    res
) => {

    try {

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
    catch (error) {

        return errorResponse(

            res,

            400,

            error.message

        );

    }

};


// ======================================================
// ADD STOCK
// ======================================================

export const addStock =
async (
    req,
    res
) => {

    try {

        const {
            productId,
            quantity
        } = req.body;


        if (!productId) {

            return errorResponse(

                res,

                400,

                "Product ID is required"

            );

        }


        if (
            quantity === undefined ||
            quantity === null ||
            quantity === ""
        ) {

            return errorResponse(

                res,

                400,

                "Quantity is required"

            );

        }


        const userId =
            req.user?.id ||
            req.user?._id;


        const inventory =
            await inventoryService
                .addStockService(

                    productId,

                    quantity,

                    userId

                );


        return successResponse(

            res,

            200,

            "Stock added successfully",

            inventory

        );

    }
    catch (error) {

        console.error(
            "ADD STOCK ERROR:",
            error
        );


        return errorResponse(

            res,

            400,

            error.message

        );

    }

};


// ======================================================
// REMOVE STOCK
// ======================================================

export const removeStock =
async (
    req,
    res
) => {

    try {

        const {
            productId,
            quantity
        } = req.body;


        const userId =
            req.user?.id ||
            req.user?._id;


        const inventory =
            await inventoryService
                .removeStockService(

                    productId,

                    quantity,

                    userId

                );


        return successResponse(

            res,

            200,

            "Stock removed successfully",

            inventory

        );

    }
    catch (error) {

        return errorResponse(

            res,

            400,

            error.message

        );

    }

};


// ======================================================
// RESERVE STOCK
// ======================================================

export const reserveStock =
async (
    req,
    res
) => {

    try {

        const {
            productId,
            quantity
        } = req.body;


        const userId =
            req.user?.id ||
            req.user?._id;


        const inventory =
            await inventoryService
                .reserveStockService(

                    productId,

                    quantity,

                    userId

                );


        return successResponse(

            res,

            200,

            "Stock reserved successfully",

            inventory

        );

    }
    catch (error) {

        return errorResponse(

            res,

            400,

            error.message

        );

    }

};


// ======================================================
// RELEASE RESERVED STOCK
// ======================================================

export const releaseReservedStock =
async (
    req,
    res
) => {

    try {

        const {
            productId,
            quantity
        } = req.body;


        const userId =
            req.user?.id ||
            req.user?._id;


        const inventory =
            await inventoryService
                .releaseReservedStockService(

                    productId,

                    quantity,

                    userId

                );


        return successResponse(

            res,

            200,

            "Reserved stock released",

            inventory

        );

    }
    catch (error) {

        return errorResponse(

            res,

            400,

            error.message

        );

    }

};


// ======================================================
// RETURN STOCK
// ======================================================

export const returnStock =
async (
    req,
    res
) => {

    try {

        const {
            productId,
            quantity,
            description
        } = req.body;


        const userId =
            req.user?.id ||
            req.user?._id;


        const inventory =
            await inventoryService
                .returnStockService(

                    productId,

                    quantity,

                    userId,

                    description

                );


        return successResponse(

            res,

            200,

            "Stock returned successfully",

            inventory

        );

    }
    catch (error) {

        return errorResponse(

            res,

            400,

            error.message

        );

    }

};