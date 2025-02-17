import { Router } from "express";
import verifyToken from "../middleware/verifyToken.js";
import {
  handleCheckAuthSeller,
  handleForgotPasswordSeller,
  handleLoginSeller,
  handleLogoutSeller,
  handleRegisterSeller,
  handleResetPasswordSeller,
  handleVerifyEmailSeller,
} from "../controllers/sellerAuthController.js";

const router = Router();

router.get("/auth/check-auth", verifyToken, handleCheckAuthSeller);

router.post("/auth/register", handleRegisterSeller);
router.post("/auth/login", handleLoginSeller);
router.post("/auth/logout", handleLogoutSeller);
router.post("/auth/verify-email", handleVerifyEmailSeller);
router.post("/auth/forgot-password", handleForgotPasswordSeller);
router.post("/auth/reset-password/:token", handleResetPasswordSeller);

export default router;
