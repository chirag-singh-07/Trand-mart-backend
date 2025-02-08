import { EmailTransporter } from "./brevo.js";
import { VERIFICATION_EMAIL_TEMPLATE } from "./emailTemples.js";
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
      from: `"TrendMart" ${process.env.SMTP_EMAIL}`, // Your sender email
      to: email,
      subject: "Verify Your Email - TrendMart",
      html: VERIFICATION_EMAIL_TEMPLATE.replace(
        "{verificationCode}",
        verificationToken
      ),
      category: "Email verification",
    };

    await EmailTransporter.sendMail(mailOptions);
    console.log(`Verification email sent to ${email}`);
    return true;
  } catch (error) {
    console.error("Email send error:", error);
    return false;
  }
};
