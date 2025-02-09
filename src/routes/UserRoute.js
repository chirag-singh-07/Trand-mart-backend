import express from "express";
import {
  handleCheckAuth,
  handleForgotPassword,
  handleLoginUser,
  handleLogoutUser,
  handleRegisterUser,
  handleResetPassword,
  handleVerifyEmail,
} from "../controllers/userController.js";
import verifyToken from "../middleware/verifyToken.js";

const router = express.Router();

router.get("/check-auth", verifyToken, handleCheckAuth);

router.post("/register", handleRegisterUser);
router.post("/login", handleLoginUser);
router.post("/logout", handleLogoutUser);
router.post("/verify-email", handleVerifyEmail);
router.post("/forgot-password", handleForgotPassword);
router.post("/reset-password/:token", handleResetPassword);

export default router;
