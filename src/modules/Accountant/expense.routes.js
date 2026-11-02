import express from "express";

import {
    createExpenseController,
    getAllExpensesController,
    getExpenseController,
    updateExpenseController,
    deleteExpenseController
} from "./expense.controller.js";

import {
    verifyToken
} from "../../common/middleware/auth.middleware.js";

import {
    allowRoles
} from "../../common/middleware/role.middleware.js";

import {
    ROLES
} from "../../common/constants/roles.js";


const router =
    express.Router();


// =====================================================
// CREATE EXPENSE
// =====================================================

router.post(
    "/",
    verifyToken,
    allowRoles(
        ROLES.ADMIN,
        ROLES.SALES,
        ROLES.ACCOUNTANT
    ),
    createExpenseController
);


// =====================================================
// GET ALL EXPENSES
// =====================================================

router.get(
    "/",
    verifyToken,
    allowRoles(
        ROLES.ADMIN,
        ROLES.SALES,
        ROLES.ACCOUNTANT
    ),
    getAllExpensesController
);


// =====================================================
// GET SINGLE EXPENSE
// =====================================================

router.get(
    "/:id",
    verifyToken,
    allowRoles(
        ROLES.ADMIN,
        ROLES.SALES,
        ROLES.ACCOUNTANT
    ),
    getExpenseController
);


// =====================================================
// UPDATE EXPENSE
// =====================================================

router.put(
    "/:id",
    verifyToken,
    allowRoles(
        ROLES.ADMIN,
        ROLES.SALES,
        ROLES.ACCOUNTANT
    ),
    updateExpenseController
);


// =====================================================
// DELETE EXPENSE
// =====================================================

router.delete(
    "/:id",
    verifyToken,
    allowRoles(
        ROLES.ADMIN,
        ROLES.SALES,
        ROLES.ACCOUNTANT
    ),
    deleteExpenseController
);


export default router;