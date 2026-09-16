
import Purchase from "./purchase.model.js";
import Product from "../products/product.model.js";


// ======================================================
// CREATE PURCHASE
// Procurement creates purchase record
// ======================================================

export const createPurchaseService = async (
  data,
  userId
) => {

  if (
    !data.vendorName ||
    !data.items ||
    !Array.isArray(data.items) ||
    data.items.length === 0
  ) {
    throw new Error(
      "Vendor and purchase items are required"
    );
  }


  const items = [];

  let subtotal = 0;
  let gstAmount = 0;


  for (const item of data.items) {

    const product =
      await Product.findById(item.product);

    if (!product) {
      throw new Error(
        `Product not found: ${item.product}`
      );
    }


    const quantity =
      Number(item.quantity);

    if (
      !Number.isInteger(quantity) ||
      quantity <= 0
    ) {
      throw new Error(
        `Invalid quantity for ${product.name}`
      );
    }


    const purchasePrice =
      Number(
        item.purchasePrice ??
        product.pricing?.purchasePrice ??
        0
      );


    if (purchasePrice < 0) {
      throw new Error(
        `Invalid purchase price for ${product.name}`
      );
    }


    const gst =
      Number(
        item.gst ??
        product.pricing?.gst ??
        0
      );


    const itemBaseAmount =
      purchasePrice * quantity;


    const itemGstAmount =
      itemBaseAmount * gst / 100;


    const itemTotal =
      itemBaseAmount + itemGstAmount;


    subtotal += itemBaseAmount;

    gstAmount += itemGstAmount;


    items.push({
      product: product._id,

      productName:
        product.name,

      quantity,

      purchasePrice,

      gst,

      totalAmount:
        itemTotal
    });
  }


  const totalAmount =
    subtotal + gstAmount;


  const purchase =
    await Purchase.create({

      vendorName:
        data.vendorName,

      vendorPhone:
        data.vendorPhone || "",

      vendorEmail:
        data.vendorEmail || "",

      vendorInvoiceNumber:
        data.vendorInvoiceNumber || "",

      invoiceDate:
        data.invoiceDate || new Date(),

      items,

      subtotal,

      gstAmount,

      totalAmount,

      paidAmount:
        0,

      pendingAmount:
        totalAmount,

      paymentStatus:
        "PENDING",

      verified:
        false,

      notes:
        data.notes || "",

      createdBy:
        userId
    });


  return purchase;
};


// ======================================================
// GET PURCHASE
// ======================================================

export const getPurchaseService =
  async (purchaseId) => {

    const purchase =
      await Purchase.findOne({
        _id: purchaseId,
        isDeleted: false
      })
        .populate(
          "items.product",
          "name sku pricing"
        )
        .populate(
          "createdBy",
          "firstName lastName email"
        )
        .populate(
          "verifiedBy",
          "firstName lastName email"
        );


    if (!purchase) {
      throw new Error(
        "Purchase not found"
      );
    }


    return purchase;
  };


// ======================================================
// GET ALL PURCHASES
// ======================================================

export const getAllPurchasesService =
  async (filters = {}) => {

    const query = {
      isDeleted: false
    };


    if (filters.paymentStatus) {
      query.paymentStatus =
        filters.paymentStatus;
    }


    if (
      filters.verified !== undefined
    ) {
      query.verified =
        filters.verified === "true";
    }


    return await Purchase.find(query)
      .populate(
        "createdBy",
        "firstName lastName"
      )
      .populate(
        "verifiedBy",
        "firstName lastName"
      )
      .sort({
        createdAt: -1
      });
  };


// ======================================================
// VERIFY PURCHASE
// Accountant verifies purchase amount/invoice
// ======================================================

export const verifyPurchaseService =
  async (
    purchaseId,
    userId
  ) => {

    const purchase =
      await Purchase.findOne({
        _id: purchaseId,
        isDeleted: false
      });


    if (!purchase) {
      throw new Error(
        "Purchase not found"
      );
    }


    if (purchase.verified) {
      throw new Error(
        "Purchase is already verified"
      );
    }


    purchase.verified =
      true;

    purchase.verifiedBy =
      userId;

    purchase.verifiedAt =
      new Date();


    await purchase.save();


    return purchase;
  };


// ======================================================
// RECORD VENDOR PAYMENT
// ======================================================

export const recordVendorPaymentService =
  async (
    purchaseId,
    data
  ) => {

    const purchase =
      await Purchase.findOne({
        _id: purchaseId,
        isDeleted: false
      });


    if (!purchase) {
      throw new Error(
        "Purchase not found"
      );
    }


    if (!purchase.verified) {
      throw new Error(
        "Purchase must be verified before payment"
      );
    }


    const paymentAmount =
      Number(data.amount);


    if (
      !Number.isFinite(paymentAmount) ||
      paymentAmount <= 0
    ) {
      throw new Error(
        "Valid payment amount is required"
      );
    }


    const currentPaid =
      Number(purchase.paidAmount || 0);


    const pending =
      Number(purchase.totalAmount) -
      currentPaid;


    if (paymentAmount > pending) {
      throw new Error(
        "Payment cannot be greater than pending amount"
      );
    }


    purchase.paidAmount =
      currentPaid + paymentAmount;


    purchase.pendingAmount =
      Math.max(
        purchase.totalAmount -
        purchase.paidAmount,
        0
      );


    if (
      purchase.pendingAmount === 0
    ) {
      purchase.paymentStatus =
        "PAID";
    } else {
      purchase.paymentStatus =
        "PARTIAL";
    }


    // Payment information is stored
    // in purchase notes for now.
    // Later this can be connected
    // to the shared Payment collection.

    const paymentNote =
      `Vendor Payment: ₹${paymentAmount} | ` +
      `Mode: ${data.paymentMode || "CASH"} | ` +
      `Date: ${data.paymentDate || new Date().toISOString()}`;


    purchase.notes =
      purchase.notes
        ? `${purchase.notes}\n${paymentNote}`
        : paymentNote;


    await purchase.save();


    return purchase;
  };


// ======================================================
// PENDING VENDOR PAYMENTS
// ======================================================

export const getPendingVendorPaymentsService =
  async () => {

    return await Purchase.find({
      isDeleted: false,

      pendingAmount: {
        $gt: 0
      }
    })
      .populate(
        "createdBy",
        "firstName lastName"
      )
      .sort({
        createdAt: -1
      });
  };


// ======================================================
// DELETE PURCHASE
// ======================================================

export const deletePurchaseService =
  async (purchaseId) => {

    const purchase =
      await Purchase.findOne({
        _id: purchaseId,
        isDeleted: false
      });


    if (!purchase) {
      throw new Error(
        "Purchase not found"
      );
    }


    purchase.isDeleted =
      true;


    await purchase.save();


    return purchase;
  };

