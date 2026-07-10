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

  role: z.enum([
    "SUPER_ADMIN",
    "ADMIN",
    "RECEPTIONIST",
    "TECHNICIAN",
    "INVENTORY",
    "ACCOUNTANT",
    "CUSTOMER",
  ]).optional(),
});