


import express from "express";

import {
  register,
  createUser,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  updateCustomerProfile,
  getProfile,
  getEmployees,
} from "./user.controller.js";

import { verifyToken } from "../../common/middleware/auth.middleware.js";
import { allowRoles } from "../../common/middleware/role.middleware.js";

const router = express.Router();

/*
====================================================
                PUBLIC ROUTES
====================================================
*/

// Customer Register
router.post("/register", register);

/*
====================================================
                PROFILE
====================================================
*/

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

/*
====================================================
                EMPLOYEE
====================================================
*/

// Employee List
router.get(
  "/employees",
  verifyToken,
  allowRoles("SUPER_ADMIN", "ADMIN"),
  getEmployees
);

/*
====================================================
                USER MANAGEMENT
====================================================
*/

// Create User / Employee
router.post(
  "/",
  verifyToken,
  allowRoles("SUPER_ADMIN", "ADMIN"),
  createUser
);

// Get All Users
router.get(
  "/",
  verifyToken,
  allowRoles("SUPER_ADMIN", "ADMIN"),
  getUsers
);

// Get User By Id
router.get(
  "/:id",
  verifyToken,
  allowRoles("SUPER_ADMIN", "ADMIN"),
  getUserById
);

// Update User
router.put(
  "/:id",
  verifyToken,
  allowRoles("SUPER_ADMIN", "ADMIN"),
  updateUser
);

// Delete User
router.delete(
  "/:id",
  verifyToken,
  allowRoles("SUPER_ADMIN", "ADMIN"),
  deleteUser
);

export default router;