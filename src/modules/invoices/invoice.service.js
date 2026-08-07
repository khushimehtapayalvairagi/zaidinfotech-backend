import Invoice from "./invoice.model.js";

import * as invoiceRepository
  from "./invoice.repository.js";

import Order from "../orders/order.model.js";
import Payment from "../payments/payment.model.js";

// ==========================================
// GENERATE INVOICE NUMBER
// ==========================================

const generateInvoiceNumber = async () => {

  const count =
    await Invoice.countDocuments();

  const nextNumber =
    count + 1;

  return `INV${new Date().getFullYear()}${String(
    nextNumber
  ).padStart(6, "0")}`;
};


// ==========================================
// CREATE INVOICE FROM ORDER
// ==========================================

export const createInvoiceFromOrder =
async (orderId) => {

  // ----------------------------------------
  // CHECK EXISTING INVOICE
  // ----------------------------------------

  const existingInvoice =
    await invoiceRepository.findInvoiceByOrderId(
      orderId
    );

  if (existingInvoice) {
    return existingInvoice;
  }


  // ----------------------------------------
  // FIND ORDER
  // ----------------------------------------

  const order =
    await Order.findById(orderId)
      .populate("user")
      .populate("soldBy")
      .populate("orderItems.product");


  if (!order) {
    throw new Error("Order not found");
  }


  // ----------------------------------------
  // ORDER MUST BE PAID
  // ----------------------------------------

  if (
    order.paymentStatus !== "PAID"
  ) {
    throw new Error(
      "Invoice can only be generated for paid order"
    );
  }


  // ----------------------------------------
  // FIND SUCCESSFUL PAYMENT
  // ----------------------------------------

  const payment =
    await Payment.findOne({

      referenceId: order._id,

      paymentFor: "ORDER",

      paymentStatus: "SUCCESS",

      isDeleted: false,

    }).sort({
      createdAt: -1,
    });


  // ----------------------------------------
  // ITEMS
  // ----------------------------------------

  const items =
    order.orderItems.map((item) => {

      return {

        product:
          item.product?._id ||
          item.product ||
          null,

        title:
          item.title,

        quantity:
          item.quantity,

        originalPrice:
          item.originalPrice,

        discountAmount:
          item.discountAmount || 0,

        price:
          item.price,

        total:
          item.price *
          item.quantity,

        imageUrl:
          item.imageUrl || "",

      };

    });


  // ----------------------------------------
  // SUBTOTAL
  // ----------------------------------------

  const subtotal =
    order.orderItems.reduce(
      (sum, item) => {

        return (
          sum +
          (
            item.originalPrice *
            item.quantity
          )
        );

      },
      0
    );


  // ----------------------------------------
  // DISCOUNT
  // ----------------------------------------

  const discount =
    order.orderItems.reduce(
      (sum, item) => {

        return (
          sum +
          (
            (item.discountAmount || 0) *
            item.quantity
          )
        );

      },
      0
    );


  // ----------------------------------------
  // PAID AMOUNT
  // ----------------------------------------

  const paidAmount =
    Number(order.paidAmount || 0);


  // ----------------------------------------
  // BALANCE
  // ----------------------------------------

  const balanceAmount =
    Math.max(
      Number(order.totalAmount) -
      paidAmount,
      0
    );


  // ----------------------------------------
  // CREATE INVOICE
  // ----------------------------------------

  const invoice =
    await invoiceRepository.createInvoice({

      invoiceNumber:
        await generateInvoiceNumber(),

      order:
        order._id,

      user:
        order.user._id,

      orderSource:
        order.orderSource,

      soldBy:
        order.soldBy?._id || null,

      items,

      subtotal,

      discount,

      totalAmount:
        order.totalAmount,

      paidAmount,

      balanceAmount,

      paymentStatus:
        order.paymentStatus,

      paymentMethod:
        payment?.paymentMethod || "",

      payment:
        payment?._id || null,

      billingAddress:
        order.shippingAddress,

      invoiceDate:
        new Date(),

    });


  return invoice;
};


// ==========================================
// GET INVOICE BY ID
// ==========================================

export const getInvoiceById =
async (invoiceId) => {

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
// GET INVOICE BY ORDER
// ==========================================

export const getInvoiceByOrderId =
async (orderId) => {

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

export const getAllInvoices =
async () => {

  return await
    invoiceRepository.findAllInvoices();

};