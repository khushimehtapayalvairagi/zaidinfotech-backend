import { z } from "zod";

export const registerSchema = z.object({
  firstName: z
    .string(),
    

  lastName: z
    .string(),
   
  email: z
    .string()
    .email("Invalid email address"),

  phone: z
    .string()
    .regex(/^[6-9]\d{9}$/, "Invalid phone number"),

  password: z
    .string(),
   

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
    "SALES",
    "TECHNICIAN",
    "INVENTORY",
    "ACCOUNTANT",
    "CUSTOMER",
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
    "SALES",
    "TECHNICIAN",
    "INVENTORY",
    "ACCOUNTANT",
     "CUSTOMER",
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