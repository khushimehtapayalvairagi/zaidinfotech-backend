


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
  updateEmployeeStatus,
  getSalaryHistory,
  addSalaryHistory,
  updateSalary,
  forgotPassword,
  resetPassword


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
 

router.put(

"/status/:id",

verifyToken,

allowRoles(

"SUPER_ADMIN",

"ADMIN"

),

updateEmployeeStatus

);
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


router.put(
"/:id/salary",

verifyToken,

allowRoles(
"SUPER_ADMIN",
"ADMIN"
),

updateSalary

);




// Add Salary Payment History

router.post(
"/:id/salary-history",

verifyToken,

allowRoles(
"SUPER_ADMIN",
"ADMIN"
),

addSalaryHistory

);




// Get Salary History

router.get(
"/:id/salary-history",

verifyToken,

allowRoles(
"SUPER_ADMIN",
"ADMIN"
),

getSalaryHistory

);

router.post(
  "/forgot-password",
  forgotPassword
);

router.post(
  "/reset-password/:token",
  resetPassword
);



export default router;