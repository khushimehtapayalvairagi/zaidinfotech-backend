// import Invoice from "./invoice.model.js";

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
//     .sort({ createdAt: -1 });
// };





import Invoice from "./invoice.model.js";

// ==========================================
// CREATE
// ==========================================

export const createInvoice = async (invoiceData) => {
  return await Invoice.create(invoiceData);
};

// ==========================================
// FIND BY ID
// ==========================================

export const findInvoiceById = async (invoiceId) => {
  return await Invoice.findOne({
    _id: invoiceId,
    isDeleted: false,
  })
    .populate("user")
    .populate("order")
    .populate("payment")
    .populate("soldBy")
    .populate("items.product");
};

// ==========================================
// FIND BY ORDER
// ==========================================

export const findInvoiceByOrderId = async (orderId) => {
  return await Invoice.findOne({
    order: orderId,
    isDeleted: false,
  })
    .populate("user")
    .populate("order")
    .populate("payment")
    .populate("soldBy")
    .populate("items.product");
};

// ==========================================
// ALL INVOICES
// ==========================================

export const findAllInvoices = async () => {
  return await Invoice.find({
    isDeleted: false,
  })
    .populate("user")
    .populate("order")
    .populate("payment")
    .populate("soldBy")
    .populate("items.product")
    .sort({ createdAt: -1 });
};