import {
  sendPasswordResetEmail,
  sendResetSuccessEmail,
  sendVerificationEmail,
  sendWelcomeEmail,
} from "../mailtrap/emails.js";
import User from "../model/userModel.js";
import { genrateTokenAndSetToken } from "../utils/token.js";
import {
  sendResponse,
  getHashPassword,
  comparePassword,
} from "../utils/utils.js";
import { generateVerificationCode } from "../utils/verification.js";
import crypto from "crypto";

export const handleCheckAuth = async (req, res) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return sendResponse(res, 401, false, "Unauthorized", null);
    }
    const user = await User.findById(userId).select("-password");

    if (!user) {
      return sendResponse(res, 401, false, "Unauthorized", null);
    }

    return sendResponse(res, 200, true, "User authenticated", user);
  } catch (error) {
    console.error(error);
    return sendResponse(res, 500, false, "Internal server error", null);
  }
};

export const handleRegisterUser = async (req, res) => {
  // Your code here
  try {
    const { fullName, email, password } = req.body;

    if (!fullName || !email || !password) {
      return sendResponse(res, 400, false, "Missing required fields", null);
    }

    if (password.length < 6) {
      return sendResponse(
        res,
        400,
        false,
        "Password must be at least 6 characters long",
        null
      );
    }

    const userAlreadyExits = await User.findOne({ email });

    if (userAlreadyExits) {
      return sendResponse(res, 400, false, "Email already exists", null);
    }

    const hashedPassword = getHashPassword(password);

    const verificationToken = generateVerificationCode();

    const newUser = new User({
      fullName,
      email,
      password: hashedPassword,
      verificationToken,
      verificationTokenExpiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 hrs
    });
    await newUser.save();

    genrateTokenAndSetToken(res, newUser._id, newUser.role);

    await sendVerificationEmail(newUser.email, verificationToken);

    const user = {
      ...newUser._doc,
      password: null, // Don't send password in response
    };

    return sendResponse(res, 201, true, "User registered successfully", user);
  } catch (error) {
    console.error(error);
    return sendResponse(res, 500, false, "Internal server error", null);
  }
};

export const handleVerifyEmailUser = async (req, res) => {
  const { code } = req.body;
  console.log("code", code);

  try {
    if (!code) {
      return sendResponse(res, 400, false, "Missing verification code", null);
    }

    const user = await User.findOne({
      verificationToken: code,
      verificationTokenExpiresAt: { $gt: Date.now() },
    });

    if (!user) {
      return sendResponse(res, 400, false, "Invalid verification code", null);
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpiresAt = undefined;

    await user.save();

    await sendWelcomeEmail(user.email, user.fullName);

    const newUser = {
      ...user._doc,
      password: null, // Don't send password in response
    };

    sendResponse(res, 200, true, "Email verifed successfully", newUser);
  } catch (error) {
    console.error(error);
    return sendResponse(res, 500, false, "Internal server error", null);
  }
};

export const handleLoginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return sendResponse(res, 400, false, "Missing required field", null);
    }

    if (password.length < 6) {
      return sendResponse(
        res,
        400,
        false,
        "Password must be at least 6 characters long",
        null
      );
    }

    const user = await User.findOne({ email });
    if (!user || !user.isVerified) {
      return sendResponse(
        res,
        401,
        false,
        "user not found or Unverified user",
        null
      );
    }

    const isMatchPassword = await comparePassword(password, user.password);
    if (!isMatchPassword) {
      return sendResponse(res, 401, false, "Invalid email or password", null);
    }

    genrateTokenAndSetToken(res, user._id, user.role);

    user.lastLogin = new Date();

    const newUser = {
      ...user._doc,
      password: null, // Don't send password in response
    };

    await user.save();

    return sendResponse(res, 200, true, "User logged in successfully", newUser);
  } catch (error) {
    console.error(error);
    return sendResponse(res, 500, false, "Internal server error", null);
  }
};

export const handleLogoutUser = async (req, res) => {
  try {
    res.clearCookie("token");
    sendResponse(res, 200, true, "User logged out successfully", null);
  } catch (error) {
    console.error(error);
    return sendResponse(res, 500, false, "Internal server error", null);
  }
};

export const handleForgotPasswordUser = async (req, res) => {
  const { email } = req.body;

  try {
    if (!email) {
      return sendResponse(res, 400, false, "Missing email", null);
    }
    const user = await User.findOne({ email });

    if (!user) {
      return sendResponse(res, 404, false, "User not found", null);
    }

    const resetToken = crypto.randomBytes(20).toString("hex");
    const resetTokenExpiresAt = Date.now() + 1 * 60 * 60 * 1000; // 1hrs

    user.resetPasswordToken = resetToken;
    user.resetPasswordTokenExpiresAt = resetTokenExpiresAt;

    const url = `${process.env.CLIENT_URL_USER}/reset-password/${resetToken}`;
    await sendPasswordResetEmail(user.email, url);

    await user.save();

    sendResponse(
      res,
      200,
      true,
      "Reset password email sent successfully",
      null
    );
  } catch (error) {
    console.error(error);
    return sendResponse(res, 500, false, "Internal server error", null);
  }
};

export const handleResetPasswordUser = async (req, res) => {
  try {
    const { token } = req.params;
    const { newPassword } = req.body;

    if (!token || !newPassword) {
      return sendResponse(res, 400, false, "Missing required fields", null);
    }
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordTokenExpiresAt: { $gt: Date.now() },
    });
    if (!user) {
      return sendResponse(
        res,
        404,
        false,
        "Invalid token or expired token",
        null
      );
    }

    if (newPassword.length < 6) {
      return sendResponse(
        res,
        400,
        false,
        "Password must be at least 6 characters long",
        null
      );
    }

    const hashedPassword = getHashPassword(newPassword);
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordTokenExpiresAt = undefined;

    await user.save();

    await sendResetSuccessEmail(user.email);
    sendResponse(res, 200, true, "Password reset successfully", null);
  } catch (error) {
    console.error(error);
    return sendResponse(res, 500, false, "Internal server error", null);
  }
};
