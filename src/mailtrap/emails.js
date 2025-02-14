import { EmailTransporter } from "./brevo.js";
import {
  PASSWORD_RESET_REQUEST_TEMPLATE,
  PASSWORD_RESET_SUCCESS_TEMPLATE,
  VERIFICATION_EMAIL_TEMPLATE,
  WELCOME_EMAIL_TEMPLATE,
} from "./emailTemples.js";
import dotenv from "dotenv";

dotenv.config();

// export const sendVerificationEmail = async (email, verificationToken) => {
//   const reciptent = [{ email }];
//   try {
//     const response = await mailtrapClient.send({
//       from: sender,
//       to: reciptent,
//       subject: "Verify your email",
//       html: VERIFICATION_EMAIL_TEMPLATE.replace(
//         "{verificationCode}",
//         verificationToken
//       ),
//       category: "Email verification",
//     });
//     console.log("Verification email sent successfully", response);
//   } catch (error) {
//     console.error("Error sending verification email", error);
//     throw new Error("Failed to send verification email");
//   }
// };

export const sendVerificationEmail = async (email, verificationToken) => {
  try {
    const mailOptions = {
      from: `"TrendMart" <${process.env.SMTP_EMAIL}>`, // Your sender email
      to: email,
      subject: "Verify Your Email - TrendMart",
      html: VERIFICATION_EMAIL_TEMPLATE.replace(
        "{verificationCode}",
        verificationToken
      ),
      category: "Email verification",
    };

    await EmailTransporter.sendMail(mailOptions);
    // console.log(`Verification email sent to ${email}`);
    return true;
  } catch (error) {
    console.error("Email send error:", error);
    return false;
  }
};

export const sendWelcomeEmail = async (email, username) => {
  try {
    const mailOptions = {
      from: `"TrendMart" <${process.env.SMTP_EMAIL}>`, // Correct sender format
      to: email,
      subject: "Welcome to TrendMart",
      html: WELCOME_EMAIL_TEMPLATE.replace("{name}", username).replace(
        "{email}",
        email
      ),
      category: "Welcome Email",
    };

    await EmailTransporter.sendMail(mailOptions);
    // console.log(`Welcome email sent to ${email}`);
    return true;
  } catch (error) {
    console.error("Email send error:", error);
    return false;
  }
};

export const sendPasswordResetEmail = async (email, resetURL) => {
  try {
    const mailOptions = {
      from: `"TrendMart" <${process.env.SMTP_EMAIL}>`, // Correct sender format
      to: email,
      subject: "Reset your Password - TrendMart",
      html: PASSWORD_RESET_REQUEST_TEMPLATE.replace("{resetURL}", resetURL),
      category: "Password Reset",
    };
    await EmailTransporter.sendMail(mailOptions);
    // console.log(`Welcome email sent to ${email}`);
    return true;
  } catch (error) {
    console.error("Error sending forgot password email", error);
    return sendResponse(
      res,
      500,
      false,
      "Failed to send forgot password email",
      null
    );
  }
};

export const sendResetSuccessEmail = async (email) => {
  try {
    const mailOptions = {
      from: `"TrendMart" <${process.env.SMTP_EMAIL}>`, // Correct sender format
      to: email,
      subject: "Password Reset Successful - TrendMart",
      html: PASSWORD_RESET_SUCCESS_TEMPLATE,
      category: "Password Reset",
    };
    await EmailTransporter.sendMail(mailOptions);
    // console.log(`Password reset success email sent to ${email}`);
    return true;
  } catch (error) {
    console.error("Error sending password reset success email", error);
    return false;
  }
};
