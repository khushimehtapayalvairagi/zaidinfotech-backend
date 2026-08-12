// import express from "express";

// import {
//   createInvoice,
//   getInvoiceById,
//   getInvoiceByOrderId,
//   getAllInvoices,
// } from "./invoice.controller.js";

// const router =
//   express.Router();


// // Create invoice
// router.post(
//   "/",
//   createInvoice
// );


// // Get all invoices
// router.get(
//   "/",
//   getAllInvoices
// );


// // Get invoice by order
// router.get(
//   "/order/:orderId",
//   getInvoiceByOrderId
// );


// // Get invoice by ID
// router.get(
//   "/:id",
//   getInvoiceById
// );


// export default router;


import express from "express";

import {
  createInvoice,
  getInvoiceById,
  getInvoiceByOrderId,
  getAllInvoices,
} from "./invoice.controller.js";

const router = express.Router();

// ==========================================
// CREATE INVOICE
// POST /api/invoices
// ==========================================

router.post(
  "/",
  createInvoice
);

// ==========================================
// GET ALL
// GET /api/invoices
// ==========================================

router.get(
  "/",
  getAllInvoices
);

// ==========================================
// GET BY ORDER
// GET /api/invoices/order/:orderId
// ==========================================

router.get(
  "/order/:orderId",
  getInvoiceByOrderId
);

// ==========================================
// GET BY ID
// GET /api/invoices/:id
// ==========================================

router.get(
  "/:id",
  getInvoiceById
);

export default router;