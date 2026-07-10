import express from "express";
import cors from "cors";

import userRoutes from "./modules/users/user.routes.js";
import authRoutes from "./modules/auth/auth.routes.js";

const app = express();

app.use(cors());
app.use(express.json());

// Health Check
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "FixFlow API Running 🚀",
  });
});

// User Routes
app.use("/api/auth", userRoutes);


app.use("/api/auth1", authRoutes);

export default app;