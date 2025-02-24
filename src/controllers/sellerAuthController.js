import {
  sendPasswordResetEmail,
  sendResetSuccessEmail,
  sendVerificationEmail,
  sendWelcomeEmail,
} from "../mailtrap/emails.js";
import Seller from "../model/sellerModel.js";
import { genrateTokenAndSetToken } from "../utils/token.js";
import {
  comparePassword,
  getHashPassword,
  sendResponse,
} from "../utils/utils.js";
import { generateVerificationCode } from "../utils/verification.js";

import crypto from "crypto";

export const handleCheckAuthSeller = async (req, res) => {
  const userId = req.userId;

  try {
    if (!userId) {
      return sendResponse(
        res,
        401,
        false,
        "Not authenticated - not user id found "
      );
    }

    const seller = await Seller.findById(userId).select("-password");

    if (!seller) {
      return sendResponse(res, 404, false, "Seller not found");
    }

    if (!seller.isVerified) {
      return sendResponse(
        res,
        403,
        false,
        "Your account is not verified. Please check your email for verification link."
      );
    }

    sendResponse(res, 200, true, "Authenticated", seller);
  } catch (error) {
    console.error(error.message);
    sendResponse(res, 500, false, "Server Error on checking auth");
  }
};

export const handleRegisterSeller = async (req, res) => {
  const { fullName, email, password } = req.body;

  try {
    if (!fullName || !email || !password) {
      return sendResponse(
        res,
        400,
        false,
        "Please provide all required fields"
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return sendResponse(res, 400, false, "Invalid email format");
    }

    if (password.length < 6) {
      return sendResponse(
        res,
        400,
        false,
        "Password should be at least 6 characters long"
      );
    }

    const exitsSeller = await Seller.findOne({ email });
    if (exitsSeller) {
      return sendResponse(res, 400, false, "Email already exists");
    }
    // Hash the password
    const hashedPassword = getHashPassword(password);

    const verificationToken = generateVerificationCode();

    const newSeller = new Seller({
      fullName,
      email,
      password: hashedPassword,
      verificationToken,
      verificationTokenExpiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 hour
    });


    await newSeller.save();

    genrateTokenAndSetToken(res, newSeller._id,newSeller.role);

    await sendVerificationEmail(newSeller.email, verificationToken);

    const seller = {
      ...newSeller._doc,
      password: undefined,
      verificationToken: undefined,
      verificationTokenExpiresAt: undefined,
    };

    return sendResponse(res, 201, true, "Seller created successfully", seller);
  } catch (error) {
    console.error(error.message);
    sendResponse(res, 400, false, "Failed to create the seller user");
  }
};

export const handleLoginSeller = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return sendResponse(res, 400, false, "Please provide email and password");
    }

    if (password.length < 6) {
      return sendResponse(
        res,
        400,
        false,
        "Password should be at least 6 characters long"
      );
    }

    const seller = await Seller.findOne({ email });

    if (!seller) {
      return sendResponse(res, 404, false, "Seller not found");
    }

    if (!seller.isVerified) {
      return sendResponse(
        res,
        403,
        false,
        "Your account is not verified. Please check your email for verification link."
      );
    }

    const isMatch = await comparePassword(password, seller.password);

    if (!isMatch) {
      return sendResponse(res, 401, false, "Incorrect password");
    }

    genrateTokenAndSetToken(res, seller._id);

    const newSeller = {
      ...seller._doc,
      password: undefined,
      verificationToken: undefined,
      verificationTokenExpiresAt: undefined,
    };


    return sendResponse(
      res,
      200,
      true,
      "Seller logged in successfully",
      newSeller
    );
  } catch (error) {
    console.error(error.message);
    sendResponse(res, 500, false, "Server Error on login");
  }
};

export const handleLogoutSeller = (req, res) => {
  try {
    res.clearCookie("token", { httpOnly: true });
    return sendResponse(res, 200, true, "Seller logged out successfully");
  } catch (error) {
    console.error(error.message);
    sendResponse(res, 500, false, "Server Error on logout");
  }
};

export const handleVerifyEmailSeller = async (req, res) => {
  const { code } = req.body;

  try {
    if (!code) {
      return sendResponse(res, 400, false, "Please provide verification code");
    }

    const seller = await Seller.findOne({
      verificationToken: code,
      verificationTokenExpiresAt: { $gt: Date.now() },
    });

    if (!seller) {
      return sendResponse(res, 400, false, "Invalid verification code");
    }

    seller.isVerified = true;
    seller.verificationToken = undefined;
    seller.verificationTokenExpiresAt = undefined;

    await seller.save();

    await sendWelcomeEmail(seller.email, seller.fullName);

    const newSeller = {
      ...seller._doc,
      password: undefined,
    };

    return sendResponse(
      res,
      200,
      true,
      "Email verified successfully",
      newSeller
    );
  } catch (error) {
    console.error(error.message);
    sendResponse(res, 500, false, "Server Error on verifying email");
  }
};

export const handleForgotPasswordSeller = async (req, res) => {
  const { email } = req.body;

  try {
    if (!email) {
      return sendResponse(res, 400, false, "Please provide email");
    }

    const seller = await Seller.findOne({ email });

    if (!seller) {
      return sendResponse(res, 404, false, "Seller not found");
    }

    const resetToken = crypto.randomBytes(20).toString("hex");
    seller.resetPasswordToken = resetToken;
    seller.resetPasswordTokenExpiresAt = Date.now() + 1 * 60 * 60 * 1000; // 1hrs

    const url = `${process.env.CLIENT_URL_SELLER}/reset-password/${resetToken}`;

    await sendPasswordResetEmail(seller.email, url);
    await seller.save();

    return sendResponse(
      res,
      200,
      true,
      "Reset password link sent to your email"
    );
  } catch (error) {
    console.error(error.message);
    sendResponse(res, 500, false, "Server Error on forgot password");
  }
};

export const handleResetPasswordSeller = async (req, res) => {
  try {
    const { token } = req.params;
    const { newPassword } = req.body;

    if (!token) {
      return sendResponse(res, 400, false, "Please provide token");
    }

    if (!newPassword || newPassword.length < 6) {
      return sendResponse(
        res,
        400,
        false,
        "Password should be at least 6 characters long"
      );
    }

    const seller = await Seller.findOne({
      resetPasswordToken: token,
      resetPasswordTokenExpiresAt: { $gt: Date.now() },
    });

    if (!seller) {
      return sendResponse(res, 404, false, "Invalid token or token expired");
    }

    const hashedPassword = getHashPassword(newPassword);
    seller.password = hashedPassword;
    seller.resetPasswordToken = undefined;
    seller.resetPasswordTokenExpiresAt = undefined;

    await seller.save();

    await sendResetSuccessEmail(seller.email);

    return sendResponse(
      res,
      200,
      true,
      "Password reset successfully. You can now login with your new password"
    );
  } catch (error) {
    console.error(error.message);
    sendResponse(res, 500, false, "Server Error on reset password");
  }
};
