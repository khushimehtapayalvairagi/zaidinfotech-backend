import * as inventoryRepository 
from "./inventory.repository.js";

import Product from "../products/product.model.js";   
import {
    notifyAdminsService
} from "../notification/notification.service.js";
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


// ======================================================
// INVENTORY ALERT NOTIFICATION
// Admin ko Low Stock / Out of Stock notification
// ======================================================

const sendInventoryNotification = async ({
    productId,
    currentStock,
    minimumStock,
    status
}) => {

    try {

        // ==========================================
        // Sirf Low Stock / Out of Stock par alert
        // ==========================================

        if (
            status !== INVENTORY_STATUS.LOW_STOCK &&
            status !== INVENTORY_STATUS.OUT_OF_STOCK
        ) {

            return;

        }

        // ==========================================
        // Product find
        // ==========================================

        const product =
            await Product
                .findById(productId)
                .select("name sku");

        if (!product) {

            console.log(
                "Inventory notification product not found:",
                productId
            );

            return;

        }

        // ==========================================
        // OUT OF STOCK
        // ==========================================

        if (
            status ===
            INVENTORY_STATUS.OUT_OF_STOCK
        ) {

            await notifyAdminsService({

                type: "STOCK_OUT",

                title:
                    "🚨 Product Out of Stock",

                message:
                    `${product.name} (${product.sku || "No SKU"}) is OUT OF STOCK. Current stock: 0.`,

                relatedId:
                    product._id,

                relatedModel:
                    "Product"

            });

            return;

        }

        // ==========================================
        // LOW STOCK
        // ==========================================

        if (
            status ===
            INVENTORY_STATUS.LOW_STOCK
        ) {

            await notifyAdminsService({

                type: "STOCK_LOW",

                title:
                    "⚠️ Low Stock Alert",

                message:
                    `${product.name} (${product.sku || "No SKU"}) is low in stock. Current stock: ${currentStock}, minimum stock: ${minimumStock}.`,

                relatedId:
                    product._id,

                relatedModel:
                    "Product"

            });

        }

    }
    catch (error) {

        // Notification fail hone par
        // inventory operation fail nahi hoga

        console.error(
            "INVENTORY NOTIFICATION ERROR:",
            error
        );

    }

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

// export const updateInventoryService =
// async(
//     id,
//     data
// )=>{


//     const inventory =
//     await inventoryRepository
//     .getInventoryById(id);



//     if(!inventory){

//         throw new Error(
//             "Inventory not found"
//         );

//     }




//     const stock =
//     data.currentStock ??
//     inventory.currentStock;



//     const minimumStock =
//     data.minimumStock ??
//     inventory.minimumStock;



//     data.status =
//     calculateStatus(
//         stock,
//         minimumStock
//     );




//     return await inventoryRepository
//     .updateInventory(
//         id,
//         data
//     );


// };

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
        data.currentStock ??
        inventory.currentStock;

    const minimumStock =
        data.minimumStock ??
        inventory.minimumStock;

    const status =
        calculateStatus(
            stock,
            minimumStock
        );

    data.status =
        status;

    const updatedInventory =
        await inventoryRepository
            .updateInventory(
                id,
                data
            );

    // =====================================
    // INVENTORY NOTIFICATION
    // =====================================

    await sendInventoryNotification({

        productId:
            inventory.product,

        currentStock:
            stock,

        minimumStock:
            minimumStock,

        status:
            status

    });

    return updatedInventory;

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
// export const addStockService =
// async(
//     productId,
//     quantity,
//     userId
// )=>{


//     const inventory =
//     await inventoryRepository
//     .getInventoryByProductId(
//         productId
//     );


//     if(!inventory){

//         throw new Error(
//             "Inventory not found"
//         );

//     }



//     const previousStock =
//     inventory.currentStock;



//     const updatedStock =
//     previousStock + quantity;



//     const status =
//     calculateStatus(
//         updatedStock,
//         inventory.minimumStock
//     );




//     const updatedInventory =
//     await inventoryRepository
//     .updateInventory(

//         inventory._id,

//         {

//             currentStock:updatedStock,

//             status,

//             lastUpdatedBy:userId

//         }

//     );





//     // Create Stock History

//     await createStockTransactionService({

//         product:inventory.product,

//         inventory:inventory._id,

//         type:"STOCK_IN",

//         quantity:quantity,

//         previousStock:previousStock,

//         updatedStock:updatedStock,

//         description:
//         "Stock added by Inventory Manager",

//         createdBy:userId

//     });





//     return updatedInventory;


// };



// ==============================
// Add Stock
// ==============================

export const addStockService =
async (
    productId,
    quantity,
    userId
) => {

    // =====================================
    // VALIDATE QUANTITY
    // =====================================

    if (
        !Number.isInteger(quantity) ||
        quantity <= 0
    ) {

        throw new Error(
            "Quantity must be greater than 0"
        );

    }

    // =====================================
    // FIND INVENTORY
    // =====================================

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

    // =====================================
    // PREVIOUS STOCK
    // =====================================

    const previousStock =
        Number(
            inventory.currentStock || 0
        );

    // =====================================
    // UPDATED STOCK
    // =====================================

    const updatedStock =
        previousStock + Number(quantity);

    // =====================================
    // STATUS
    // =====================================

    const status =
        calculateStatus(
            updatedStock,
            inventory.minimumStock
        );

    // =====================================
    // UPDATE INVENTORY
    // =====================================

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

    // =====================================
    // STOCK HISTORY
    // =====================================

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

    // =====================================
    // INVENTORY NOTIFICATION
    // =====================================

    await sendInventoryNotification({

        productId,

        currentStock:
            updatedStock,

        minimumStock:
            inventory.minimumStock,

        status

    });

    return updatedInventory;

};




// ==============================
// Remove Stock
// Order / Repair use
// ==============================

// =======================================
// Remove Stock
// Walk-in / Online / Repair / Rental
// =======================================

// export const removeStockService = async (
//   productId,
//   quantity,
//   userId,
//   transactionType = "STOCK_OUT",
//   description = "Stock removed"
// ) => {

//   // =====================================
//   // VALIDATE QUANTITY
//   // =====================================

//   if (
//     !Number.isInteger(quantity) ||
//     quantity <= 0
//   ) {
//     throw new Error(
//       "Quantity must be greater than 0"
//     );
//   }

//   // =====================================
//   // FIND INVENTORY
//   // =====================================

//   const inventory =
//     await inventoryRepository
//       .getInventoryByProductId(
//         productId
//       );

//   if (!inventory) {
//     throw new Error(
//       "Inventory not found"
//     );
//   }

//   // =====================================
//   // AVAILABLE STOCK
//   // =====================================

//   const availableStock =
//     inventory.currentStock -
//     inventory.reservedStock;

//   // =====================================
//   // STOCK CHECK
//   // =====================================

//   if (
//     availableStock < quantity
//   ) {
//     throw new Error(
//       "Not enough stock available"
//     );
//   }

//   // =====================================
//   // PREVIOUS STOCK
//   // =====================================

//   const previousStock =
//     inventory.currentStock;

//   // =====================================
//   // DECREASE STOCK
//   // =====================================

//   const updatedStock =
//     previousStock - quantity;

//   // =====================================
//   // STATUS
//   // =====================================

//   const status =
//     calculateStatus(
//       updatedStock,
//       inventory.minimumStock
//     );

//   // =====================================
//   // UPDATE INVENTORY
//   // =====================================

//   const updatedInventory =
//     await inventoryRepository
//       .updateInventory(

//         inventory._id,

//         {
//           currentStock: updatedStock,

//           status,

//           lastUpdatedBy: userId,
//         }
//       );


      
//   // =====================================
//   // STOCK HISTORY
//   // =====================================

//   await createStockTransactionService({

//     product: inventory.product,

//     inventory: inventory._id,

//     type: transactionType,

//     quantity: quantity,

//     previousStock: previousStock,

//     updatedStock: updatedStock,

//     description: description,

//     createdBy: userId,

//   });


// try {

//     if (
//       status === INVENTORY_STATUS.OUT_OF_STOCK ||
//       status === INVENTORY_STATUS.LOW_STOCK
//     ) {

//       const productData =
//         await Product.findById(productId).select("name");

//       const productName =
//         productData?.name || "Product";


//       if (status === INVENTORY_STATUS.OUT_OF_STOCK) {

//         await notifyAdminsService({
//           type: "STOCK_OUT",
//           title: "Product Out of Stock",
//           message: `${productName} is now OUT OF STOCK.`,
//           relatedId: productId,
//           relatedModel: "Product"
//         });

//       }
//       else if (status === INVENTORY_STATUS.LOW_STOCK) {

//         await notifyAdminsService({
//           type: "STOCK_LOW",
//           title: "Low Stock Alert",
//           message: `${productName} stock is low — only ${updatedStock} left.`,
//           relatedId: productId,
//           relatedModel: "Product"
//         });

//       }

//     }

//   }
//   catch (notifError) {
//     console.error("STOCK NOTIFICATION ERROR:", notifError);
//   }
//   return updatedInventory;
// };

// =======================================
// Remove Stock
// Walk-in / Online / Repair / Rental
// =======================================

// export const removeStockService = async (
//     productId,
//     quantity,
//     userId,
//     transactionType = "STOCK_OUT",
//     description = "Stock removed"
// ) => {

//     // =====================================
//     // VALIDATE QUANTITY
//     // =====================================

//     if (
//         !Number.isInteger(quantity) ||
//         quantity <= 0
//     ) {

//         throw new Error(
//             "Quantity must be greater than 0"
//         );

//     }

//     // =====================================
//     // FIND INVENTORY
//     // =====================================

//     const inventory =
//         await inventoryRepository
//             .getInventoryByProductId(
//                 productId
//             );

//     if (!inventory) {

//         throw new Error(
//             "Inventory not found"
//         );

//     }

//     // =====================================
//     // AVAILABLE STOCK
//     // =====================================

//     const availableStock =
//         Number(inventory.currentStock || 0) -
//         Number(inventory.reservedStock || 0);

//     // =====================================
//     // STOCK CHECK
//     // =====================================

//     if (
//         availableStock < quantity
//     ) {

//         throw new Error(
//             "Not enough stock available"
//         );

//     }

//     // =====================================
//     // PREVIOUS STOCK
//     // =====================================

//     const previousStock =
//         Number(
//             inventory.currentStock || 0
//         );

//         const previousStatus =
//     inventory.status;

//     // =====================================
//     // UPDATED STOCK
//     // =====================================

//     const updatedStock =
//         previousStock - Number(quantity);

//     // =====================================
//     // STATUS
//     // =====================================

//     const status =
//         calculateStatus(
//             updatedStock,
//             inventory.minimumStock
//         );

//         const shouldNotify =
//     status !== previousStatus &&
//     (
//         status === INVENTORY_STATUS.LOW_STOCK ||
//         status === INVENTORY_STATUS.OUT_OF_STOCK
//     );

//     // =====================================
//     // UPDATE INVENTORY
//     // =====================================

//     const updatedInventory =
//         await inventoryRepository
//             .updateInventory(

//                 inventory._id,

//                 {

//                     currentStock:
//                         updatedStock,

//                     status,

//                     lastUpdatedBy:
//                         userId

//                 }

//             );

//     // =====================================
//     // STOCK HISTORY
//     // =====================================

//     await createStockTransactionService({

//         product:
//             inventory.product,

//         inventory:
//             inventory._id,

//         type:
//             transactionType,

//         quantity:
//             quantity,

//         previousStock:
//             previousStock,

//         updatedStock:
//             updatedStock,

//         description:
//             description,

//         createdBy:
//             userId

//     });

//     // =====================================
//     // INVENTORY NOTIFICATION
//     // =====================================

    
//   if (shouldNotify) {

//     await sendInventoryNotification({

//         productId,

//         currentStock:
//             updatedStock,

//         minimumStock:
//             inventory.minimumStock,

//         status

//     });

// }

//     return updatedInventory;

// };


export const removeStockService = async (
    productId,
    quantity,
    userId,
    transactionType = "STOCK_OUT",
    description = "Stock removed"
) => {

    // =====================================
    // VALIDATE QUANTITY
    // =====================================

    if (
        !Number.isInteger(quantity) ||
        quantity <= 0
    ) {

        throw new Error(
            "Quantity must be greater than 0"
        );

    }

    // =====================================
    // FIND INVENTORY
    // =====================================

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

    // =====================================
    // AVAILABLE STOCK
    // =====================================

    const availableStock =
        Number(inventory.currentStock || 0) -
        Number(inventory.reservedStock || 0);

    // =====================================
    // STOCK CHECK
    // =====================================

    if (
        availableStock < quantity
    ) {

        throw new Error(
            "Not enough stock available"
        );

    }

    // =====================================
    // PREVIOUS STOCK
    // =====================================

    const previousStock =
        Number(
            inventory.currentStock || 0
        );

    // =====================================
    // PREVIOUS STATUS
    // =====================================

    const previousStatus =
        inventory.status;

    // =====================================
    // UPDATED STOCK
    // =====================================

    const updatedStock =
        previousStock -
        Number(quantity);

    // =====================================
    // NEW STATUS
    // =====================================

    const status =
        calculateStatus(
            updatedStock,
            inventory.minimumStock
        );

    // =====================================
    // SHOULD SEND ALERT?
    // =====================================

    const shouldNotify =
        status !== previousStatus &&
        (
            status === INVENTORY_STATUS.LOW_STOCK ||
            status === INVENTORY_STATUS.OUT_OF_STOCK
        );

    // =====================================
    // UPDATE INVENTORY
    // =====================================

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

    // =====================================
    // STOCK HISTORY
    // =====================================

    await createStockTransactionService({

        product:
            inventory.product,

        inventory:
            inventory._id,

        type:
            transactionType,

        quantity:
            quantity,

        previousStock:
            previousStock,

        updatedStock:
            updatedStock,

        description:
            description,

        createdBy:
            userId

    });

    // =====================================
    // INVENTORY NOTIFICATION
    // =====================================

    if (shouldNotify) {

        await sendInventoryNotification({

            productId,

            currentStock:
                updatedStock,

            minimumStock:
                inventory.minimumStock,

            status

        });

    }

    return updatedInventory;

};

// ==============================
// Return Stock
// Order Return / Rental Return
// ==============================


// export const returnStockService =
// async(
//     productId,
//     quantity,
//     userId,
//     description="Stock returned"
// )=>{


//     const inventory =
//     await inventoryRepository
//     .getInventoryByProductId(
//         productId
//     );



//     if(!inventory){

//         throw new Error(
//             "Inventory not found"
//         );

//     }




//     const previousStock =
//     inventory.currentStock;



//     const updatedStock =
//     previousStock + quantity;



//     const status =
//     calculateStatus(
//         updatedStock,
//         inventory.minimumStock
//     );





//     const updatedInventory =
//     await inventoryRepository
//     .updateInventory(

//         inventory._id,

//         {

//             currentStock:updatedStock,

//             status,

//             lastUpdatedBy:userId

//         }

//     );






//     // Create History

//     await createStockTransactionService({

//         product:inventory.product,

//         inventory:inventory._id,

//         type:"RETURN",

//         quantity:quantity,

//         previousStock:previousStock,

//         updatedStock:updatedStock,

//         description:description,

//         createdBy:userId

//     });






//     return updatedInventory;


// };



export const returnStockService =
async (
    productId,
    quantity,
    userId,
    description = "Stock returned"
) => {

    if (
        !Number.isInteger(quantity) ||
        quantity <= 0
    ) {

        throw new Error(
            "Quantity must be greater than 0"
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
        previousStock +
        Number(quantity);

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

        quantity:
            quantity,

        previousStock:
            previousStock,

        updatedStock:
            updatedStock,

        description:
            description,

        createdBy:
            userId

    });

    // Usually return ke baad LOW/OUT nahi hoga,
    // lekin future-safe notification check.

    await sendInventoryNotification({

        productId,

        currentStock:
            updatedStock,

        minimumStock:
            inventory.minimumStock,

        status

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