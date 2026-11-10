import Invoice from "./invoice.model.js";
import * as invoiceRepository from "./invoice.repository.js";

import Order from "../orders/order.model.js";
import Payment from "../payments/payment.model.js";



// ==========================================
// INVOICE TYPE HELPERS (GST / NON_GST)
// ==========================================

const round2 = (value) =>
  Number(Number(value || 0).toFixed(2));

const normalizeInvoiceType = (value) => {
  if (
    value === undefined ||
    value === null ||
    value === ""
  ) {
    return null;
  }

  const text = String(value)
    .trim()
    .toUpperCase()
    .replace(/[\s-]+/g, "_");

  if (
    ["NON_GST", "NONGST", "WITHOUT_GST", "NO_GST"].includes(text)
  ) {
    return "NON_GST";
  }

  if (
    ["GST", "WITH_GST", "TAX_INVOICE"].includes(text)
  ) {
    return "GST";
  }

  return null;
};

const invoiceTypeFromOrder = (order) => {
  if (!order) {
    return null;
  }

  const fromField = normalizeInvoiceType(
    order.invoiceType ??
      order.gstType ??
      order.billType
  );

  if (fromField) {
    return fromField;
  }

  if (
    order.isNonGst === true ||
    order.isNonGST === true ||
    order.nonGst === true ||
    order.isGst === false ||
    order.isGST === false ||
    order.gstApplicable === false
  ) {
    return "NON_GST";
  }

  return null;
};

// Priority: order > request body > GST
const resolveInvoiceType = (order, requested) =>
  invoiceTypeFromOrder(order) ||
  normalizeInvoiceType(requested) ||
  "GST";
// ==========================================
// GENERATE INVOICE NUMBER
// ==========================================

const generateInvoiceNumber = async () => {
  const year = new Date().getFullYear();

  const count = await Invoice.countDocuments();

  const nextNumber = count + 1;

  return `INV${year}${String(nextNumber).padStart(6, "0")}`;
};

// ==========================================
// CREATE INVOICE FROM ORDER
// ==========================================

export const createInvoiceFromOrder = async (
  orderId,
  options = {}
) => {
    console.log("=================================");
  console.log("CREATE INVOICE STARTED");
  console.log("ORDER ID:", orderId);

  // ==========================================
  // 1. CHECK EXISTING INVOICE
  // ==========================================

  const existingInvoice =
    await invoiceRepository.findInvoiceByOrderId(orderId);

  if (existingInvoice) {
    console.log(
      "INVOICE ALREADY EXISTS:",
      existingInvoice.invoiceNumber
    );

    return existingInvoice;
  }

  
  // ==========================================
  // 1A. DELETED INVOICE EXISTS? -> RESTORE
  // (order pe unique index hai, naya nahi ban sakta)
  // ==========================================

  const deletedInvoice =
    await invoiceRepository.findDeletedInvoiceByOrderId(
      orderId
    );

  if (deletedInvoice) {
    console.log(
      "DELETED INVOICE RESTORED:",
      deletedInvoice.invoiceNumber
    );

    return await invoiceRepository.restoreInvoice(
      deletedInvoice._id
    );
  }
  // ==========================================
  // 2. FIND ORDER
  // ==========================================

  const order = await Order.findById(orderId)
    .populate("user")
    .populate("soldBy")
    .populate("orderItems.product");

  if (!order) {
    throw new Error("Order not found");
  }

  console.log("ORDER FOUND:", order._id);
  console.log("ORDER SOURCE:", order.orderSource);
  console.log("ORDER PAYMENT STATUS:", order.paymentStatus);
  console.log("ORDER PAID AMOUNT:", order.paidAmount);

  // ==========================================
  // 3. USER VALIDATION
  // ==========================================

  if (!order.user?._id) {
    throw new Error(
      "Customer/user is missing from order"
    );
  }

  // ==========================================
  // 4. ORDER MUST BE PAID
  // ==========================================

  if (order.paymentStatus !== "PAID") {
    throw new Error(
      `Invoice can only be generated for paid order. Current status: ${order.paymentStatus}`
    );
  }

  // ==========================================
  // 5. FIND SUCCESSFUL PAYMENT
  // ==========================================

  const payment = await Payment.findOne({
    referenceId: order._id,
    paymentFor: "ORDER",
    paymentStatus: "SUCCESS",
    isDeleted: false,
  })
    .sort({
      createdAt: -1,
    });

  console.log(
    "SUCCESSFUL PAYMENT FOUND:",
    payment
  );

  // ==========================================
  // IMPORTANT
  //
  // Walk-in payment may not have a Payment
  // document.
  //
  // Therefore DO NOT force payment to exist.
  // ==========================================

  // ==========================================
  // 6. ITEMS
  // ==========================================


  // ==========================================
  // 6. ITEMS
  //
  // Each invoice item is built from the order item.
  // The product is populated (.populate("orderItems.product")),
  // so we copy the HSN code from the product into the item.
  // This way the invoice keeps the HSN that was valid
  // on the invoice date, even if the product is edited later.
  // ==========================================

  const items = (order.orderItems || []).map(
    (item) => {
      // Populated product document (or empty object if only an ID)
      const productDoc =
        item.product && typeof item.product === "object"
          ? item.product
          : {};

      return {
        itemType: "PRODUCT",

        referenceId:
          item.product?._id ||
          item.product ||
          null,

        product:
          item.product?._id ||
          item.product ||
          null,

        title:
          item.title ||
          productDoc.name ||
          "Product",

        description:
          item.description ||
          "",

        // ==========================================
        // HSN CODE
        // Copied from the product at invoice creation
        // ==========================================

        hsnCode:
          productDoc.hsnCode ||
          "",

        quantity:
          Number(item.quantity || 1),

        originalPrice:
          Number(item.originalPrice || 0),

        discountAmount:
          Number(item.discountAmount || 0),

        price:
          Number(item.price || 0),

        total:
          Number(item.price || 0) *
          Number(item.quantity || 1),

        imageUrl:
          item.imageUrl ||
          "",
      };
    }
  );

  // ==========================================
  // 7. SUBTOTAL
  // ==========================================

  const subtotal = items.reduce(
    (sum, item) => {
      return (
        sum +
        Number(item.originalPrice || 0) *
        Number(item.quantity || 1)
      );
    },
    0
  );

  // ==========================================
  // 8. DISCOUNT
  // ==========================================

  const discount = items.reduce(
    (sum, item) => {
      return (
        sum +
        Number(item.discountAmount || 0) *
        Number(item.quantity || 1)
      );
    },
    0
  );

  // ==========================================
  // 9. TOTAL
  // ==========================================

  // const totalAmount =
  //   Number(order.totalAmount || 0);

  // ==========================================
  // 9. TOTAL
  // ==========================================

  // order.totalAmount = product/offer ke baad amount
  // order.finalAmount = GST + coupon + shipping ke baad
  // actual payable amount

  const totalAmount =
    Number(
      order.finalAmount ??
      order.totalAmount ??
      0
    );


  // ==========================================
  // 9A. FINANCIAL BREAKDOWN
  // ==========================================

  const orderSubtotal =
    Number(
      order.subtotal ??
      subtotal ??
      0
    );

  const orderOfferDiscount =
    Number(
      order.offerDiscount ??
      discount ??
      0
    );

  const couponDiscount =
    Number(
      order.couponDiscount ??
      0
    );

  const taxableAmount =
    Number(
      order.taxableAmount ??
      Math.max(
        Number(order.totalAmount || 0) -
        couponDiscount,
        0
      )
    );

  // const gstPercentage =
  //   Number(
  //     order.gstPercentage ??
  //     18
  //   );

  // const gstAmount =
  //   Number(
  //     order.gstAmount ??
  //     (
  //       taxableAmount *
  //       gstPercentage
  //     ) / 100
  //   );

    const invoiceType = resolveInvoiceType(
    order,
    options.invoiceType
  );

  const isNonGst = invoiceType === "NON_GST";

  const gstPercentage = isNonGst
    ? 0
    : Number(
        order.gstPercentage ??
        18
      );

  const gstAmount = isNonGst
    ? 0
    : Number(
        order.gstAmount ??
        (
          taxableAmount *
          gstPercentage
        ) / 100
      );

  const shippingCharge =
    Number(
      order.shippingCharge ??
      0
    );

  const otherCharges =
    Number(
      order.otherCharges ??
      0
    );

  const finalAmount =
    Number(
      order.finalAmount ??
      (
        taxableAmount +
        gstAmount +
        shippingCharge +
        otherCharges
      )
    );

  // ==========================================
  // 10. PAID AMOUNT
  // ==========================================

  let paidAmount =
    Number(order.paidAmount || 0);

  // ==========================================
  // ONLINE PAYMENT FALLBACK
  //
  // If order.paidAmount is 0 but successful
  // Razorpay payment exists, use payment amount.
  // ==========================================

  if (
    paidAmount <= 0 &&
    payment
  ) {
    paidAmount =
      Number(
        payment.amount ||
        payment.paidAmount ||
        0
      );
  }

  // ==========================================
  // 11. BALANCE
  // ==========================================

  const balanceAmount = Math.max(
    totalAmount - paidAmount,
    0
  );

  // ==========================================
  // 12. ORDER SOURCE
  // ==========================================

  const orderSource =
    order.orderSource === "WALK_IN"
      ? "WALK_IN"
      : "ONLINE";

  // ==========================================
  // 13. PAYMENT METHOD
  // ==========================================

  let paymentMethod =
    payment?.paymentMethod ||
    order.paymentMethod ||
    "";

  // ==========================================
  // WALK-IN FALLBACK
  // ==========================================

  if (
    orderSource === "WALK_IN" &&
    !paymentMethod
  ) {
    paymentMethod = "CASH";
  }

  // ==========================================
  // 14. CREATE INVOICE
  // ==========================================

  // const invoiceData = {
  //   invoiceNumber:
  //     await generateInvoiceNumber(),

  //   order:
  //     order._id,

  //   user:
  //     order.user._id,

  //   invoiceFor:
  //     "ORDER",

  //   referenceId:
  //     order._id,

  //   orderSource,

  //   soldBy:
  //     order.soldBy?._id ||
  //     null,

  //   items,

  //   subtotal,

  //   discount,

  //   totalAmount,

  //   paidAmount,

  //   balanceAmount,

  //   paymentStatus:
  //     order.paymentStatus,

  //   paymentMethod,

  //   payment:
  //     payment?._id ||
  //     null,

  //   billingAddress:
  //     order.shippingAddress || {},

  //   invoiceDate:
  //     new Date(),
  // };

  const invoiceData = {
    invoiceNumber:
      await generateInvoiceNumber(),

    order:
      order._id,

    user:
      order.user._id,

    invoiceFor:
      "ORDER",

    referenceId:
      order._id,

    orderSource,

    soldBy:
      order.soldBy?._id ||
      null,

    items,

    // =========================================
    // FINANCIAL BREAKDOWN
    // =========================================

    subtotal:
      orderSubtotal,

    // Offer / product discount
    discount:
      orderOfferDiscount,

    // Coupon discount
    couponDiscount:
      couponDiscount,

    // Amount after coupon
    taxableAmount:
      taxableAmount,

      invoiceType,

    // GST
    gstPercentage:
      gstPercentage,

    gstAmount:
      gstAmount,

    // Shipping
    shippingCharge:
      shippingCharge,

    // Other charges
    otherCharges:
      otherCharges,

    // Original order amount after offer
    // Keep this for backward compatibility
    productTotalAmount:
      Number(order.totalAmount || 0),

    // FINAL CUSTOMER PAYABLE
    totalAmount:
      finalAmount,

    finalAmount:
      finalAmount,

    paidAmount,

    balanceAmount,

    paymentStatus:
      order.paymentStatus,

    paymentMethod,

    payment:
      payment?._id ||
      null,

    billingAddress:
      order.shippingAddress || {},

    invoiceDate:
      new Date(),
  };

  console.log(
    "FINAL INVOICE DATA:",
    invoiceData
  );

  // ==========================================
  // 15. CREATE
  // ==========================================

  const invoice =
    await invoiceRepository.createInvoice(
      invoiceData
    );

  console.log(
    "INVOICE CREATED SUCCESSFULLY:",
    invoice._id
  );

  return invoice;
};

// ==========================================
// GET BY ID
// ==========================================

export const getInvoiceById = async (
  invoiceId
) => {
  const invoice =
    await invoiceRepository.findInvoiceById(
      invoiceId
    );

  if (!invoice) {
    throw new Error(
      "Invoice not found"
    );
  }

  return invoice;
};

// ==========================================
// GET BY ORDER
// ==========================================

export const getInvoiceByOrderId = async (
  orderId
) => {
  const invoice =
    await invoiceRepository.findInvoiceByOrderId(
      orderId
    );

  if (!invoice) {
    throw new Error(
      "Invoice not found"
    );
  }

  return invoice;
};

// ==========================================
// GET ALL
// ==========================================

// export const getAllInvoices = async () => {
//   return await invoiceRepository.findAllInvoices();
// };

export const getAllInvoices = async (filters = {}) => {
  return await invoiceRepository.findAllInvoices(filters);
};

// ==========================================
// GET MY INVOICES
// Logged-in user only
// ==========================================

export const getMyInvoices = async (userId) => {
  return await invoiceRepository.findInvoicesByUser(userId);
};


// ==========================================
// UPDATE INVOICE
//
// Allowed: invoiceType, gstPercentage,
// shippingCharge, otherCharges, notes,
// invoiceDate, paymentMethod, billingAddress
// ==========================================

export const updateInvoice = async (
  invoiceId,
  data = {}
) => {
  const invoice = await Invoice.findOne({
    _id: invoiceId,
    isDeleted: false,
  });

  if (!invoice) {
    throw new Error("Invoice not found");
  }

  const toAmount = (value, label) => {
    const number = Number(value);

    if (!Number.isFinite(number) || number < 0) {
      throw new Error(
        `${label} must be a valid number (0 or more)`
      );
    }

    return round2(number);
  };

  // -------------------------------------------
  // SIMPLE FIELDS
  // -------------------------------------------

  if (data.notes !== undefined) {
    invoice.notes = String(data.notes);
  }

  if (data.paymentMethod !== undefined) {
    invoice.paymentMethod = String(
      data.paymentMethod
    ).trim();
  }

  if (data.invoiceDate !== undefined) {
    const date = new Date(data.invoiceDate);

    if (Number.isNaN(date.getTime())) {
      throw new Error("Invalid invoice date");
    }

    invoice.invoiceDate = date;
  }

  if (
    data.billingAddress &&
    typeof data.billingAddress === "object"
  ) {
    [
      "fullName",
      "phone",
      "addressLine",
      "city",
      "state",
      "pincode",
      "country",
      "landmark",
    ].forEach((key) => {
      if (data.billingAddress[key] !== undefined) {
        invoice.billingAddress[key] = String(
          data.billingAddress[key]
        );
      }
    });
  }

  // -------------------------------------------
  // GST / NON-GST + AMOUNTS
  // -------------------------------------------

  let moneyChanged = false;

  let newType = null;

  if (data.invoiceType !== undefined) {
    newType = normalizeInvoiceType(
      data.invoiceType
    );

    if (!newType) {
      throw new Error(
        "Invalid invoice type. Use GST or NON_GST"
      );
    }

    invoice.invoiceType = newType;

    moneyChanged = true;
  }

  if (data.gstPercentage !== undefined) {
    invoice.gstPercentage = toAmount(
      data.gstPercentage,
      "GST percentage"
    );

    moneyChanged = true;
  }

  if (data.shippingCharge !== undefined) {
    invoice.shippingCharge = toAmount(
      data.shippingCharge,
      "Shipping charge"
    );

    moneyChanged = true;
  }

  if (data.otherCharges !== undefined) {
    invoice.otherCharges = toAmount(
      data.otherCharges,
      "Other charges"
    );

    moneyChanged = true;
  }

  if (moneyChanged) {
    const taxable = Number(
      invoice.taxableAmount || 0
    );

    if (invoice.invoiceType === "NON_GST") {
      invoice.gstPercentage = 0;
      invoice.gstAmount = 0;
    } else {
      // NON_GST se GST me wapas aaye aur % 0 hai -> 18
      if (
        newType === "GST" &&
        data.gstPercentage === undefined &&
        !(Number(invoice.gstPercentage) > 0)
      ) {
        invoice.gstPercentage = 18;
      }

      invoice.gstAmount = round2(
        (taxable *
          Number(invoice.gstPercentage || 0)) /
          100
      );
    }

    const finalAmount = round2(
      taxable +
        Number(invoice.gstAmount || 0) +
        Number(invoice.shippingCharge || 0) +
        Number(invoice.otherCharges || 0)
    );

    const paid = Number(invoice.paidAmount || 0);

    invoice.finalAmount = finalAmount;
    invoice.totalAmount = finalAmount;
    invoice.balanceAmount = Math.max(
      round2(finalAmount - paid),
      0
    );

    if (
      ["PENDING", "PAID", "PARTIAL"].includes(
        invoice.paymentStatus
      )
    ) {
      if (paid >= finalAmount) {
        invoice.paymentStatus = "PAID";
      } else if (paid > 0) {
        invoice.paymentStatus = "PARTIAL";
      } else {
        invoice.paymentStatus = "PENDING";
      }
    }
  }

  await invoice.save();

  // Payment record me bhi type same rakho
  if (newType && invoice.payment) {
    await Payment.updateOne(
      { _id: invoice.payment },
      { invoiceType: newType }
    );
  }

  return await invoiceRepository.findInvoiceById(
    invoice._id
  );
};


// ==========================================
// DELETE INVOICE (SOFT DELETE)
// ==========================================

export const deleteInvoice = async (invoiceId) => {
  const invoice =
    await invoiceRepository.softDeleteInvoice(
      invoiceId
    );

  if (!invoice) {
    throw new Error("Invoice not found");
  }

  return invoice;
};