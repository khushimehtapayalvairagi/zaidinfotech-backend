// import dotenv from "dotenv";
// dotenv.config();

// import app from "./app.js";
// import connectDB from "./config/database.js";

// connectDB();

// const PORT = process.env.PORT || 5001;

// app.listen(PORT, () => {
//   console.log(`🚀 Server running on port ${PORT}`);
// });


import "dotenv/config";

import app from "./app.js";
import connectDB from "./config/database.js";
import { verifyMailConnection } from "./modules/services/mail.service.js";

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // ===============================
    // CHECK ENV
    // ===============================

    console.log("======================================");
    console.log("ENV CHECK");
    console.log("EMAIL_USER:", process.env.EMAIL_USER);
    console.log(
      "EMAIL_PASS:",
      process.env.EMAIL_PASS ? "LOADED ✅" : "MISSING ❌"
    );
    console.log("FRONTEND_URL:", process.env.FRONTEND_URL);
    console.log("======================================");

    // ===============================
    // DATABASE
    // ===============================

    await connectDB();

    // ===============================
    // EMAIL SMTP
    // ===============================

    await verifyMailConnection();

    // ===============================
    // SERVER
    // ===============================

    app.listen(PORT, () => {
      console.log("======================================");
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📧 Email: ${process.env.EMAIL_USER}`);
      console.log("======================================");
    });

  } catch (error) {
    console.error("======================================");
    console.error("❌ SERVER START FAILED");
    console.error(error);
    console.error("======================================");

    process.exit(1);
  }
};

startServer();