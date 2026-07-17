import express from "express";
import cors from "cors";
import path from "path";
import userRoutes from "./modules/users/user.routes.js";
import authRoutes from "./modules/auth/auth.routes.js";
import addressRoutes from "./modules/addresses/address.routes.js";

import categoryRoutes from "./modules/categories/category.routes.js";

import brandRoutes from "./modules/brands/brand.routes.js";
import productRoutes from "./modules/products/product.routes.js";
import  cartRoutes  from "./modules/cart/cart.routes.js"

import inventoryRoutes from "./modules/inventory/inventory.routes.js";
import stockTransactionRoutes from "./modules/inventory/stockTransaction/stockTransaction.routes.js";


const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ==============================
// Static Upload Folder
// ==============================

app.use(
  "/uploads",
  express.static(
    path.join(process.cwd(), "uploads")
  )
);


// Health Check
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "FixFlow API Running 🚀",
  });
});

// User Routes


app.use("/api/users", userRoutes);
app.use("/api/auth1", authRoutes);
app.use("/api/categories",categoryRoutes);
app.use("/api/brands", brandRoutes);
app.use("/api/products",productRoutes);
app.use("/api/inventory",inventoryRoutes);
app.use("/api/stock-transactions",stockTransactionRoutes);
app.use("/api/addresses",addressRoutes);
app.use("/api/cart",cartRoutes);
export default app;































