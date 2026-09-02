// import nodemailer from "nodemailer";

// const transporter = nodemailer.createTransport({
//   service: "gmail",
//   auth: {
//     user: process.env.EMAIL_USER,
//     pass: process.env.EMAIL_PASS,
//   },
// });

// export const sendResetPasswordEmail = async (email, token) => {
//   const resetLink = `${process.env.FRONTEND_URL}/reset-password/${token}`;

//   await transporter.sendMail({
//     from: process.env.EMAIL_USER,
//     to: email,
//     subject: "Reset Your Password",
//     html: `
//       <h2>Password Reset</h2>

//       <p>You requested a password reset.</p>

//       <a href="${resetLink}">
//         Reset Password
//       </a>

//       <p>This link expires in 15 minutes.</p>
//     `,
//   });
// };
// export const sendEmailVerificationOtp = async (email, otp) => {

//   await transporter.sendMail({
//     from: process.env.EMAIL_USER,
//     to: email,
//     subject: "Verify Your Email - Zaid Infotech",
//     html: `
//       <div style="font-family: Arial, sans-serif; padding: 20px;">

//         <h2>Email Verification</h2>

//         <p>Hello,</p>

//         <p>
//           Please use the OTP below to verify your email address.
//         </p>

//         <h1 style="letter-spacing: 8px;">
//           ${otp}
//         </h1>

//         <p>
//           This OTP is valid for <strong>10 minutes</strong>.
//         </p>

//         <p>
//           If you did not request this verification, please ignore this email.
//         </p>

//         <br>

//         <p>
//           Regards,<br>
//           <strong>Zaid Infotech</strong>
//         </p>

//       </div>
//     `,
//   });

// };

import nodemailer from "nodemailer";

// ======================================================
// ENV
// ======================================================

const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;

const FRONTEND_URL =
  process.env.FRONTEND_URL || "http://localhost:5173";

// ======================================================
// ENV CHECK
// ======================================================

console.log("======================================");
console.log("📧 MAIL SERVICE INITIALIZING");
console.log("EMAIL_USER:", EMAIL_USER);
console.log(
  "EMAIL_PASS:",
  EMAIL_PASS ? "LOADED ✅" : "MISSING ❌"
);
console.log("FRONTEND_URL:", FRONTEND_URL);
console.log("======================================");

if (!EMAIL_USER) {
  console.error("❌ EMAIL_USER is missing in .env");
}

if (!EMAIL_PASS) {
  console.error("❌ EMAIL_PASS is missing in .env");
}

// ======================================================
// TRANSPORTER
// ======================================================

const transporter = nodemailer.createTransport({
  service: "gmail",

  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS,
  },

  logger: true,
  debug: true,
});

// ======================================================
// VERIFY CONNECTION
// ======================================================

export const verifyMailConnection = async () => {
  try {
    await transporter.verify();

    console.log("======================================");
    console.log("✅ GMAIL SMTP CONNECTION SUCCESS");
    console.log("📧 Sender:", EMAIL_USER);
    console.log("======================================");

    return true;

  } catch (error) {

    console.error("======================================");
    console.error("❌ GMAIL SMTP CONNECTION FAILED");
    console.error("Message:", error.message);
    console.error("Code:", error.code);
    console.error("Command:", error.command);
    console.error("Response:", error.response);
    console.error("======================================");

    return false;
  }
};

// ======================================================
// EMAIL VERIFICATION OTP
// ======================================================

export const sendEmailVerificationOtp = async (
  email,
  otp
) => {

  if (!email) {
    throw new Error(
      "Verification email is required"
    );
  }

  if (!otp) {
    throw new Error(
      "Verification OTP is required"
    );
  }

  try {

    console.log("======================================");
    console.log("📨 SENDING VERIFICATION OTP");
    console.log("To:", email);
    console.log("OTP:", otp);
    console.log("======================================");

    const info = await transporter.sendMail({

      from:
        `"Zaid Infotech" <${EMAIL_USER}>`,

      to: email,

      subject:
        "Your Email Verification OTP - Zaid Infotech",

      text:
        `Your Zaid Infotech verification OTP is ${otp}. This OTP is valid for 10 minutes.`,

      html: `
        <!DOCTYPE html>

        <html>

        <body
          style="
            margin:0;
            padding:0;
            background:#f4f7fb;
            font-family:Arial,Helvetica,sans-serif;
          "
        >

          <div
            style="
              max-width:600px;
              margin:40px auto;
              background:#ffffff;
              padding:35px;
              border-radius:12px;
              border:1px solid #e5e7eb;
            "
          >

            <h2
              style="
                color:#111827;
              "
            >
              Zaid Infotech
            </h2>

            <h3>
              Verify Your Email
            </h3>

            <p>
              Hello,
            </p>

            <p>
              Please use the verification code below
              to verify your email address.
            </p>

            <div
              style="
                margin:30px 0;
                padding:20px;
                text-align:center;
                background:#f3f6ff;
                border-radius:10px;
              "
            >

              <div
                style="
                  font-size:36px;
                  font-weight:bold;
                  letter-spacing:10px;
                  color:#2563eb;
                "
              >
                ${otp}
              </div>

            </div>

            <p>
              This OTP is valid for
              <strong>10 minutes</strong>.
            </p>

            <p>
              If you did not request this verification,
              please ignore this email.
            </p>

            <hr />

            <p>
              Regards,<br/>
              <strong>Zaid Infotech</strong>
            </p>

          </div>

        </body>

        </html>
      `,
    });

    console.log("======================================");
    console.log("✅ VERIFICATION EMAIL SENT");
    console.log("📧 TO:", email);
    console.log("🆔 MESSAGE ID:", info.messageId);
    console.log("📨 RESPONSE:", info.response);
    console.log("======================================");

    return info;

  } catch (error) {

    console.error("======================================");
    console.error("❌ VERIFICATION EMAIL FAILED");
    console.error("📧 TO:", email);
    console.error("Message:", error.message);
    console.error("Code:", error.code);
    console.error("Command:", error.command);
    console.error("Response:", error.response);
    console.error("======================================");

    throw error;
  }
};

// ======================================================
// PASSWORD RESET
// ======================================================

export const sendResetPasswordEmail = async (
  email,
  token
) => {

  if (!email) {
    throw new Error("Email is required");
  }

  if (!token) {
    throw new Error("Reset token is required");
  }

  const resetLink =
    `${FRONTEND_URL}/reset-password/${token}`;

  try {

    const info = await transporter.sendMail({

      from:
        `"Zaid Infotech" <${EMAIL_USER}>`,

      to: email,

      subject:
        "Reset Your Password - Zaid Infotech",

      html: `
        <!DOCTYPE html>

        <html>

        <body
          style="
            font-family:Arial,sans-serif;
            background:#f5f7fb;
            padding:30px;
          "
        >

          <div
            style="
              max-width:600px;
              margin:auto;
              background:white;
              padding:30px;
              border-radius:12px;
            "
          >

            <h2>
              Zaid Infotech
            </h2>

            <h3>
              Password Reset
            </h3>

            <p>
              You requested a password reset.
            </p>

            <a
              href="${resetLink}"
              style="
                display:inline-block;
                padding:12px 20px;
                background:#1261c9;
                color:white;
                text-decoration:none;
                border-radius:6px;
              "
            >
              Reset Password
            </a>

            <p>
              This link expires in 15 minutes.
            </p>

          </div>

        </body>

        </html>
      `,
    });

    console.log("✅ PASSWORD RESET EMAIL SENT");
    console.log("To:", email);
    console.log("Message ID:", info.messageId);

    return info;

  } catch (error) {

    console.error(
      "❌ PASSWORD RESET EMAIL FAILED:",
      error
    );

    throw error;
  }
};

export default transporter;