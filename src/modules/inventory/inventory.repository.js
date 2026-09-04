// import Inventory from "./inventory.model.js";

// // =======================================
// // CREATE INVENTORY
// // =======================================

// // export const createInventory = async (data) => {
// //   return await Inventory.create(data);
// // };

// export const createInventory = async (data) => {
//   const inventory = await Inventory.create(data);

//   await inventory.populate({
//     path: "product",
//     select: "name sku",
//   });

//   await sendStockNotification(inventory);

//   return inventory;
// };

// // =======================================
// // GET ALL INVENTORY
// // =======================================

// export const getAllInventory = async () => {

//     return await Inventory.find()

//         .populate({
//             path: "product",
//             populate: [
//                 {
//                     path: "brand",
//                     select: "name"
//                 },
//                 {
//                     path: "category",
//                     select: "name"
//                 }
//             ]
//         })

//         .sort({
//             createdAt: -1
//         });

// };

// // =======================================
// // GET INVENTORY BY ID
// // =======================================

// export const getInventoryById = async (id) => {
//   return await Inventory.findOne({
//     _id: id,
//     isDeleted: false,
//   })

//     .populate(
//       "product",
//       "name sku images pricing brand category"
//     )

//     .populate(
//       "lastUpdatedBy",
//       "name firstName lastName email role"
//     );
// };

// // =======================================
// // GET INVENTORY BY PRODUCT ID
// // =======================================

// export const getInventoryByProductId = async (
//   productId
// ) => {
//   return await Inventory.findOne({
//     product: productId,
//     isDeleted: false,
//   });
// };

// // =======================================
// // UPDATE INVENTORY
// // =======================================

// // export const updateInventory = async (
// //   id,
// //   data
// // ) => {
// //   return await Inventory.findByIdAndUpdate(
// //     id,
// //     data,
// //     {
// //       new: true,
// //     }
// //   );
// // };

// export const updateInventory = async (
//   id,
//   data
// ) => {

//   const oldInventory =
//     await Inventory.findById(id);

//   if (!oldInventory) {
//     throw new Error(
//       "Inventory not found"
//     );
//   }

//   const oldStock =
//     Number(oldInventory.currentStock || 0);

//   const inventory =
//     await Inventory.findByIdAndUpdate(
//       id,
//       data,
//       {
//         new: true,
//       }
//     );

//   if (!inventory) {
//     throw new Error(
//       "Inventory update failed"
//     );
//   }

//   await inventory.populate({
//     path: "product",
//     select: "name sku",
//   });

//   const newStock =
//     Number(inventory.currentStock || 0);

//   // =====================================
//   // ONLY WHEN STOCK CHANGES
//   // =====================================

//   if (oldStock !== newStock) {

//     await sendStockNotification(
//       inventory
//     );

//   }

//   return inventory;
// };


// // =======================================
// // DELETE INVENTORY
// // =======================================

// export const deleteInventory = async (id) => {
//   return await Inventory.findByIdAndUpdate(
//     id,
//     {
//       isDeleted: true,
//     },
//     {
//       new: true,
//     }
//   );
// };
import Inventory from "./inventory.model.js";


// =======================================
// CREATE INVENTORY
// =======================================

export const createInventory = async (data) => {

    const inventory =
        await Inventory.create(data);


    await inventory.populate({
        path: "product",
        select: "name sku",
    });


    return inventory;

};


// =======================================
// GET ALL INVENTORY
// =======================================

export const getAllInventory = async () => {

    return await Inventory.find({
        isDeleted: false
    })

        .populate({
            path: "product",

            populate: [

                {
                    path: "brand",
                    select: "name"
                },

                {
                    path: "category",
                    select: "name"
                }

            ]
        })

        .populate({
            path: "lastUpdatedBy",
            select:
                "name firstName lastName email role"
        })

        .sort({
            createdAt: -1
        });

};


// =======================================
// GET INVENTORY BY ID
// =======================================

export const getInventoryById = async (id) => {

    return await Inventory.findOne({

        _id: id,

        isDeleted: false

    })

        .populate(
            "product",
            "name sku images pricing brand category"
        )

        .populate(
            "lastUpdatedBy",
            "name firstName lastName email role"
        );

};


// =======================================
// GET INVENTORY BY PRODUCT ID
// =======================================

export const getInventoryByProductId = async (
    productId
) => {

    return await Inventory.findOne({

        product: productId,

        isDeleted: false

    });

};


// =======================================
// UPDATE INVENTORY
// =======================================

export const updateInventory = async (
    id,
    data
) => {

    const inventory =
        await Inventory.findByIdAndUpdate(

            id,

            data,

            {
                new: true,
                runValidators: true
            }

        );


    if (!inventory) {

        throw new Error(
            "Inventory update failed"
        );

    }


    await inventory.populate({

        path: "product",

        select: "name sku"

    });


    return inventory;

};


// =======================================
// DELETE INVENTORY
// =======================================

export const deleteInventory = async (id) => {

    return await Inventory.findByIdAndUpdate(

        id,

        {
            isDeleted: true
        },

        {
            new: true
        }

    );

};