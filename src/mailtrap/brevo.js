import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

// Configure Nodemailer with SMTP
export const EmailTransporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST, // Brevo SMTP
  port: 587,
  secure: false,
  auth: {
    user: process.env.SMTP_EMAIL, // Your Brevo email
    pass: process.env.SMTP_PASSWORD, // Your Brevo API Key
  },
});

// Function to send verification email
// export const sendVerificationEmail = async (email, token) => {
//   try {
//     const verificationLink = `https://yourwebsite.com/verify?token=${token}`;

//     const mailOptions = {
//       from: '"TrendMart" <your-email@domain.com>', // Your sender email
//       to: email,
//       subject: "Verify Your Email - TrendMart",
//       html: `<h2>Email Verification</h2>
//              <p>Click the link below to verify your email:</p>
//              <a href="${verificationLink}" target="_blank">${verificationLink}</a>
//              <p>If you did not request this, ignore this email.</p>`,
//     };

//     await transporter.sendMail(mailOptions);
//     console.log(`Verification email sent to ${email}`);
//     return true;
//   } catch (error) {
//     console.error("Email send error:", error);
//     return false;
//   }
// };
