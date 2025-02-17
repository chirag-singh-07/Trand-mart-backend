import express from "express";
import {
  handleCheckAuth,
  handleForgotPasswordUser,
  handleLoginUser,
  handleLogoutUser,
  handleRegisterUser,
  handleResetPasswordUser,
  handleVerifyEmailUser,
} from "../controllers/userAuthController.js";
import verifyToken from "../middleware/verifyToken.js";

const router = express.Router();

router.get("/auth/check-auth", verifyToken, handleCheckAuth);

router.post("/auth/register", handleRegisterUser);
router.post("/auth/login", handleLoginUser);
router.post("/auth/logout", handleLogoutUser);
router.post("/auth/verify-email", handleVerifyEmailUser);
router.post("/auth/forgot-password", handleForgotPasswordUser);
router.post("/auth/reset-password/:token", handleResetPasswordUser);

export default router;
