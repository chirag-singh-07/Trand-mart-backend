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
import { loginLimiter } from "../utils/utils.js";
import {
  handleGetBestSellerProducts,
  handleGetFeaturedProducts,
  handleGetTrendingProducts,
} from "../controllers/ProductController.js";
import {
  handleAddToCart,
  handleDeleteProductItems,
  handleFetchCartItems,
  handleUpdateCartQuantity,
} from "../controllers/cartController.js";

const router = express.Router();

router.get("/auth/check-auth", verifyToken, handleCheckAuth);

router.post("/auth/register", handleRegisterUser);
router.post("/auth/login", loginLimiter, handleLoginUser);
router.post("/auth/logout", handleLogoutUser);
router.post("/auth/verify-email", handleVerifyEmailUser);
router.post("/auth/forgot-password", handleForgotPasswordUser);
router.post("/auth/reset-password/:token", handleResetPasswordUser);

router.get("/product/feature-products", handleGetFeaturedProducts);
router.get("/product/trending-products", handleGetTrendingProducts);
router.get("/product/best-sellers", handleGetBestSellerProducts);

router.get("/cart/all", verifyToken, handleFetchCartItems);
router.post("/cart/add", verifyToken, handleAddToCart);
router.put("/cart/update", verifyToken, handleUpdateCartQuantity);
router.delete("/cart/delete/:productId", verifyToken, handleDeleteProductItems);

export default router;
