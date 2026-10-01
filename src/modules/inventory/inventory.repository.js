// import Invoice from "../invoices/invoice.model.js";

// // ==========================================
// // CREATE
// // ==========================================

// export const createInvoice = async (invoiceData) => {
//   return await Invoice.create(invoiceData);
// };

// // ==========================================
// // FIND BY ID
// // ==========================================

// export const findInvoiceById = async (invoiceId) => {
//   return await Invoice.findOne({
//     _id: invoiceId,
//     isDeleted: false,
//   })
//     .populate("user")
//     .populate("order")
//     .populate("payment")
//     .populate("soldBy")
//     .populate("items.product");
// };

// // ==========================================
// // FIND BY ORDER
// // ==========================================

// export const findInvoiceByOrderId = async (orderId) => {
//   return await Invoice.findOne({
//     order: orderId,
//     isDeleted: false,
//   })
//     .populate("user")
//     .populate("order")
//     .populate("payment")
//     .populate("soldBy")
//     .populate("items.product");
// };

// // ==========================================
// // ALL INVOICES
// // ==========================================

// export const findAllInvoices = async () => {
//   return await Invoice.find({
//     isDeleted: false,
//   })
//     .populate("user")
//     .populate("order")
//     .populate("payment")
//     .populate("soldBy")
//     .populate("items.product")
//     .sort({ createdAt: -1 });
// };

// // ==========================================
// // INVOICES OF ONE USER
// // Only limited user fields are returned
// // ==========================================

// export const findInvoicesByUser = async (userId) => {
//   return await Invoice.find({
//     user: userId,
//     isDeleted: false,
//   })
//     .populate(
//       "user",
//       "firstName lastName email phone customerType businessDetails"
//     )
//     .populate("payment")
//     .sort({ createdAt: -1 });
// };

// // ======================================================
// // GET INVENTORY BY PRODUCT ID
// // ======================================================

// export const getInventoryByProductId = async (productId) => {
//     return await Inventory.findOne({
//         product: productId,
//         isDeleted: false
//     });
// };



import Inventory from "./inventory.model.js";


// ======================================================
// CREATE INVENTORY
// ======================================================

export const createInventory = async (inventoryData) => {

    return await Inventory.create(
        inventoryData
    );

};


// ======================================================
// GET ALL INVENTORY
// ======================================================

export const getAllInventory = async () => {

    return await Inventory.find({
        isDeleted: false
    })
        .populate({
            path: "product"
        })
        .populate({
            path: "lastUpdatedBy",
            select: "firstName lastName email role"
        })
        .sort({
            createdAt: -1
        });

};


// ======================================================
// GET INVENTORY BY ID
// ======================================================

export const getInventoryById = async (
    inventoryId
) => {

    return await Inventory.findOne({

        _id: inventoryId,

        isDeleted: false

    })
        .populate({
            path: "product"
        })
        .populate({
            path: "lastUpdatedBy",
            select: "firstName lastName email role"
        });

};


// ======================================================
// GET INVENTORY BY PRODUCT ID
// ======================================================

export const getInventoryByProductId = async (
    productId
) => {

    return await Inventory.findOne({

        product: productId,

        isDeleted: false

    });

};


// ======================================================
// UPDATE INVENTORY
// ======================================================

export const updateInventory = async (
    inventoryId,
    updateData
) => {

    return await Inventory.findOneAndUpdate(

        {
            _id: inventoryId,

            isDeleted: false
        },

        updateData,

        {
            new: true,

            runValidators: true
        }

    )
        .populate({
            path: "product"
        })
        .populate({
            path: "lastUpdatedBy",
            select: "firstName lastName email role"
        });

};


// ======================================================
// DELETE INVENTORY
// SOFT DELETE
// ======================================================

export const deleteInventory = async (
    inventoryId
) => {

    return await Inventory.findOneAndUpdate(

        {
            _id: inventoryId,

            isDeleted: false
        },

        {
            isDeleted: true
        },

        {
            new: true
        }

    );

};