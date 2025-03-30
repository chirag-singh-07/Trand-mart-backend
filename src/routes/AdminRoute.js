import { Router } from "express";
import verifyToken from "../middleware/verifyToken.js";
import {
  handleLoginAdmin,
  handleLogoutAdmin,
  handleRegsiterAdmin,
  handleVerifyCheckAuthAdmin,
} from "../controllers/adminAuthControllor.js";
import { loginLimiter } from "../utils/utils.js";
import { upload } from "../config/cloundinary.js";
import {
  handleAddProducts,
  handleDeleteProducts,
  handleGetProductDetialsById,
  handleGetProducts,
  handleImageUpload,
  handleUpdateProducts,
} from "../controllers/ProductController.js";

const router = Router();

router.get("/auth/check-auth", verifyToken, handleVerifyCheckAuthAdmin);

router.post("/auth/register", handleRegsiterAdmin);
router.post("/auth/login", loginLimiter, handleLoginAdmin);
router.post("/auth/logout", handleLogoutAdmin);

router.post(
  "/product/upload-image",
  upload.single("my_file"),
  handleImageUpload
);
router.post("/product/add", verifyToken, handleAddProducts);
router.put("/product/edit/:productId", verifyToken, handleUpdateProducts);
router.delete("/product/delete/:productId", verifyToken, handleDeleteProducts);
router.get("/product/all-products", verifyToken, handleGetProducts);
router.get("/product/:productId", handleGetProductDetialsById);

export default router;
