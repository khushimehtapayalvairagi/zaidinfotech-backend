import express from "express";

import {
  createInvoice,
  getInvoiceById,
  getInvoiceByOrderId,
  getAllInvoices,
  getMyInvoices,
  updateInvoice,
  deleteInvoice,
} from "./invoice.controller.js";

import { verifyToken } from "../../common/middleware/auth.middleware.js";
import { allowRoles } from "../../common/middleware/role.middleware.js";

const router = express.Router();

const INVOICE_EDIT_ROLES = [
  "SUPER_ADMIN",
  "ADMIN",
  "ACCOUNTANT",
  "SALES",
];

const INVOICE_DELETE_ROLES = [
  "SUPER_ADMIN",
  "ADMIN",
];

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
// Optional: ?invoiceType=GST  ya  ?invoiceType=NON_GST
// ==========================================

router.get(
  "/",
  getAllInvoices
);

// ==========================================
// GET MY INVOICES (logged-in user only)
// GET /api/invoices/my
//
// IMPORTANT: keep this ABOVE "/:id",
// otherwise "my" is treated as an invoice ID.
// ==========================================

router.get(
  "/my",
  verifyToken,
  getMyInvoices
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

// ==========================================
// UPDATE INVOICE
// PUT /api/invoices/:id
// ==========================================

router.put(
  "/:id",
  verifyToken,
  allowRoles(...INVOICE_EDIT_ROLES),
  updateInvoice
);

// ==========================================
// DELETE INVOICE (soft delete)
// DELETE /api/invoices/:id
// ==========================================

router.delete(
  "/:id",
  verifyToken,
  allowRoles(...INVOICE_DELETE_ROLES),
  deleteInvoice
);

export default router;