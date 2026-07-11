import express from "express";
import { register } from "./user.controller.js";



import {
  createUser,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
   updateCustomerProfile,
     getProfile,
} from "./user.controller.js";

import { verifyToken } from "../../common/middleware/auth.middleware.js";
import { allowRoles } from "../../common/middleware/role.middleware.js";

const router = express.Router();

/*
====================================================
                USER MANAGEMENT
====================================================
*/

router.get(
  "/profile",
   verifyToken,
  getProfile
);

router.put(
 "/profile",
 verifyToken,
 updateCustomerProfile
);
// Create User
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

// Soft Delete User
router.delete(
  "/:id",
  verifyToken,
  allowRoles("SUPER_ADMIN", "ADMIN"),
  deleteUser
);


router.post("/register", register);

export default router;