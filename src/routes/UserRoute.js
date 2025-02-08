import express from "express";
import {
  handleForgotPassword,
  handleLoginUser,
  handleLogoutUser,
  handleRegisterUser,
  handleResetPassword,
  handleVerifyEmail,
} from "../controllers/userController.js";

const router = express.Router();

router.post("/register", handleRegisterUser);
router.post("/login", handleLoginUser);
router.post("/logout", handleLogoutUser);
router.post("/verify-email", handleVerifyEmail);
router.post("/forgot-password", handleForgotPassword);
router.post("/reset-password/:token", handleResetPassword);

export default router;
