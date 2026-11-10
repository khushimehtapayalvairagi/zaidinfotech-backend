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

export const findAllInvoices = async (filters = {}) => {
  const query = {
    isDeleted: false,
  };

  // NON_GST = sirf non-gst
  // GST     = baaki sab (purane invoices bhi)
  if (filters.invoiceType === "NON_GST") {
    query.invoiceType = "NON_GST";
  } else if (filters.invoiceType === "GST") {
    query.invoiceType = { $ne: "NON_GST" };
  }

  return await Invoice.find(query)
    .populate("user")
    .populate("order")
    .populate("payment")
    .populate("soldBy")
    .populate("items.product")
    .sort({ createdAt: -1 });
};

// ==========================================
// INVOICES OF ONE USER
// Only limited user fields are returned
// ==========================================

export const findInvoicesByUser = async (userId) => {
  return await Invoice.find({
    user: userId,
    isDeleted: false,
  })
    .populate(
      "user",
      "firstName lastName email phone customerType businessDetails"
    )
    .populate("payment")
    .sort({ createdAt: -1 });
};

// ==========================================
// SOFT DELETE
// ==========================================

export const softDeleteInvoice = async (invoiceId) => {
  return await Invoice.findOneAndUpdate(
    {
      _id: invoiceId,
      isDeleted: false,
    },
    {
      isDeleted: true,
    },
    {
      new: true,
    }
  );
};

// ==========================================
// FIND DELETED INVOICE OF AN ORDER
// ==========================================

export const findDeletedInvoiceByOrderId = async (orderId) => {
  return await Invoice.findOne({
    order: orderId,
    isDeleted: true,
  });
};

// ==========================================
// RESTORE DELETED INVOICE
// ==========================================

export const restoreInvoice = async (invoiceId) => {
  return await Invoice.findOneAndUpdate(
    {
      _id: invoiceId,
    },
    {
      isDeleted: false,
    },
    {
      new: true,
    }
  )
    .populate("user")
    .populate("order")
    .populate("payment")
    .populate("soldBy")
    .populate("items.product");
};