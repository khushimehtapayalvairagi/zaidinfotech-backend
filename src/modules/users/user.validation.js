import { z } from "zod";

export const registerSchema = z.object({
  firstName: z
    .string()
    .min(2, "First name must be at least 2 characters")
    .max(30),

  lastName: z
    .string()
    .min(2, "Last name must be at least 2 characters")
    .max(30),

  email: z
    .string()
    .email("Invalid email address"),

  phone: z
    .string()
    .regex(/^[6-9]\d{9}$/, "Invalid phone number"),

  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Must contain one uppercase letter")
    .regex(/[a-z]/, "Must contain one lowercase letter")
    .regex(/[0-9]/, "Must contain one number")
    .regex(/[@$!%*?&#]/, "Must contain one special character"),

  // role: z.enum([
  //   "SUPER_ADMIN",
  //   "ADMIN",
  //   "RECEPTIONIST",
  //   "TECHNICIAN",
  //   "INVENTORY",
  //   "ACCOUNTANT",
  //   "CUSTOMER",

  // ]).optional(),

  role: z.enum([
    "SUPER_ADMIN",
    "ADMIN",
    "RECEPTIONIST",
    "TECHNICIAN",
    "INVENTORY",
    "ACCOUNTANT",
    "OTHER"
]).optional(),


  salaryDetails: z.object({

    salaryType: z.enum([
        "MONTHLY",
        "DAILY"
    ]).optional(),


    amount: z.number().optional(),


    joiningDate: z.string().optional()

}).optional()
});


export const createUserSchema = z.object({

  hasSystemAccess: z.boolean(),

  firstName: z.string().min(2).max(30),

  lastName: z.string().min(2).max(30),

  phone: z
    .string()
    .regex(/^[6-9]\d{9}$/, "Invalid phone number"),

  email: z.string().email().optional(),

  password: z.string().optional(),

  role: z.enum([
    "SUPER_ADMIN",
    "ADMIN",
    "RECEPTIONIST",
    "TECHNICIAN",
    "INVENTORY",
    "ACCOUNTANT",
  ]).optional(),

  department: z.enum([
    "ADMINISTRATION",
    "FRONT_DESK",
    "REPAIR",
    "INVENTORY",
    "ACCOUNTS",
    "OTHER"
  ]),

  designation: z.string().optional(),

  salaryDetails: z.object({

    salaryType: z.enum([
      "MONTHLY",
      "DAILY"
    ]),

    amount: z.number(),

    joiningDate: z.string()

  })

}).superRefine((data, ctx) => {

  if (data.hasSystemAccess) {

    if (!data.email) {
      ctx.addIssue({
        code: "custom",
        path: ["email"],
        message: "Email is required"
      });
    }

    if (!data.password) {
      ctx.addIssue({
        code: "custom",
        path: ["password"],
        message: "Password is required"
      });
    }

    if (!data.role) {
      ctx.addIssue({
        code: "custom",
        path: ["role"],
        message: "Role is required"
      });
    }

  }

});