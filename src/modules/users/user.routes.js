import express from "express";

import {
  createUser,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  register,
  updateCustomerProfile,
  getProfile,
  getEmployees,
  updateEmployeeStatus,
  updateSalary,
  addSalaryHistory,
  getSalaryHistory,
  forgotPassword,
  resetPassword,
  verifyEmail,
  resendEmailVerificationOtp,
  changepassword,
  addCustomerBankAccount,
  getCustomerBankAccounts,
  getCustomerBankAccountById,
  updateCustomerBankDetails,
} from "./user.controller.js";

import { verifyToken } from "../../common/middleware/auth.middleware.js";

import { allowRoles } from "../../common/middleware/role.middleware.js";

const router = express.Router();

// ======================================================
// ROLES
// ======================================================

// Admin + HR Employee Management
const EMPLOYEE_MANAGEMENT_ROLES = [
  "SUPER_ADMIN",
  "ADMIN",
  "HR_EXECUTIVE",
];

// ======================================================
// PUBLIC ROUTES
// ======================================================

// Customer Registration
router.post("/register", register);

// Forgot Password
router.post("/forgot-password", forgotPassword);

// Reset Password
router.post("/reset-password/:token", resetPassword);

// Verify Email
router.post("/verify-email", verifyEmail);

// Resend Verification OTP
router.post(
  "/resend-verification-otp",
  resendEmailVerificationOtp
);

// ======================================================
// PROFILE ROUTES
// ======================================================

// Logged In User Profile
router.get(
  "/profile",
  verifyToken,
  getProfile
);

// Update Profile
router.put(
  "/profile",
  verifyToken,
  updateCustomerProfile
);

// Change Password
router.put(
  "/change-password",
  verifyToken,
  changepassword
);

// ======================================================
// CUSTOMER BANK ACCOUNT ROUTES
// ======================================================

router.get(
  "/bank-accounts",
  verifyToken,
  getCustomerBankAccounts
);

router.patch(
  "/bank-accounts/:accountId",
  verifyToken,
  updateCustomerBankDetails
);

// Existing Bank Account Route
router.post(
  "/:id/bank-accounts",
  addCustomerBankAccount
);

// ======================================================
// EMPLOYEE MANAGEMENT
// ADMIN + SUPER_ADMIN + HR_EXECUTIVE
// ======================================================

// GET ALL EMPLOYEES
router.get(
  "/employees",
  verifyToken,
  allowRoles(...EMPLOYEE_MANAGEMENT_ROLES),
  getEmployees
);

// UPDATE EMPLOYEE STATUS
router.put(
  "/status/:id",
  verifyToken,
  allowRoles(...EMPLOYEE_MANAGEMENT_ROLES),
  updateEmployeeStatus
);

// ======================================================
// USER / EMPLOYEE MANAGEMENT
// ======================================================

// CREATE EMPLOYEE
router.post(
  "/",
  verifyToken,
  allowRoles(...EMPLOYEE_MANAGEMENT_ROLES),
  createUser
);

// GET ALL USERS
router.get(
  "/",
  verifyToken,
  allowRoles(...EMPLOYEE_MANAGEMENT_ROLES),
  getUsers
);

// GET USER BY ID
router.get(
  "/:id",
  verifyToken,
  allowRoles(...EMPLOYEE_MANAGEMENT_ROLES),
  getUserById
);

// UPDATE EMPLOYEE
router.put(
  "/:id",
  verifyToken,
  allowRoles(...EMPLOYEE_MANAGEMENT_ROLES),
  updateUser
);

// DELETE EMPLOYEE
router.delete(
  "/:id",
  verifyToken,
  allowRoles(...EMPLOYEE_MANAGEMENT_ROLES),
  deleteUser
);

// ======================================================
// EMPLOYEE SALARY MANAGEMENT
// ======================================================

// UPDATE EMPLOYEE SALARY
router.put(
  "/:id/salary",
  verifyToken,
  allowRoles(...EMPLOYEE_MANAGEMENT_ROLES),
  updateSalary
);

// ADD SALARY PAYMENT HISTORY
router.post(
  "/:id/salary-history",
  verifyToken,
  allowRoles(...EMPLOYEE_MANAGEMENT_ROLES),
  addSalaryHistory
);

// GET SALARY HISTORY
router.get(
  "/:id/salary-history",
  verifyToken,
  allowRoles(...EMPLOYEE_MANAGEMENT_ROLES),
  getSalaryHistory
);

// ======================================================
// EXPORT
// ======================================================

export default router;