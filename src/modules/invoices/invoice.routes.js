import express from "express";

import {
  createInvoice,
  getInvoiceById,
  getInvoiceByOrderId,
  getAllInvoices,
} from "./invoice.controller.js";

const router =
  express.Router();


// Create invoice
router.post(
  "/",
  createInvoice
);


// Get all invoices
router.get(
  "/",
  getAllInvoices
);


// Get invoice by order
router.get(
  "/order/:orderId",
  getInvoiceByOrderId
);


// Get invoice by ID
router.get(
  "/:id",
  getInvoiceById
);


export default router;