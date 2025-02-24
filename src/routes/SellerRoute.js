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
import { loginLimiter } from "../utils/utils.js";
import {
  handleAddProducts,
  handleDeleteProducts,
  handleGetProducts,
  handleGetSellerProducts,
  handleUpdateProducts,
} from "../controllers/ProductController.js";

const router = Router();

//? all the auth routes

router.get("/auth/check-auth", verifyToken, handleCheckAuthSeller);

router.post("/auth/register", handleRegisterSeller);
router.post("/auth/login", loginLimiter, handleLoginSeller);
router.post("/auth/logout", handleLogoutSeller);
router.post("/auth/verify-email", handleVerifyEmailSeller);
router.post("/auth/forgot-password", handleForgotPasswordSeller);
router.post("/auth/reset-password/:token", handleResetPasswordSeller);

//! products related routes

// ✅ Add a new product (Only sellers)
router.post("/product/add", verifyToken, handleAddProducts);

// ✅ Get all products (Public)
router.get("/products", handleGetProducts);

// ✅ Get seller's products (Only the seller's own products)
router.get("/product/seller", verifyToken, handleGetSellerProducts);

// ✅ Update a product (Only sellers can update their own products)
router.put("/product/seller/:productId", verifyToken, handleUpdateProducts);

// ✅ Delete a product (Only sellers can delete their own products)
router.delete("/product/seller/:productId", verifyToken, handleDeleteProducts);

// router.post("")

export default router;
