import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendResetPasswordEmail = async (email, token) => {
  const resetLink = `${process.env.FRONTEND_URL}/reset-password/${token}`;

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Reset Your Password",
    html: `
      <h2>Password Reset</h2>

      <p>You requested a password reset.</p>

      <a href="${resetLink}">
        Reset Password
      </a>

      <p>This link expires in 15 minutes.</p>
    `,
  });
};
export const sendEmailVerificationOtp = async (email, otp) => {

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Verify Your Email - Zaid Infotech",
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px;">

        <h2>Email Verification</h2>

        <p>Hello,</p>

        <p>
          Please use the OTP below to verify your email address.
        </p>

        <h1 style="letter-spacing: 8px;">
          ${otp}
        </h1>

        <p>
          This OTP is valid for <strong>10 minutes</strong>.
        </p>

        <p>
          If you did not request this verification, please ignore this email.
        </p>

        <br>

        <p>
          Regards,<br>
          <strong>Zaid Infotech</strong>
        </p>

      </div>
    `,
  });

};