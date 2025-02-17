import { Router } from "express";
import verifyToken from "../middleware/verifyToken.js";
import {
  handleLoginAdmin,
  handleLogoutAdmin,
  handleRegsiterAdmin,
  handleVerifyCheckAuthAdmin,
} from "../controllers/adminAuthControllor.js";

const router = Router();

router.get("/auth/check-auth", verifyToken, handleVerifyCheckAuthAdmin);

router.post("/auth/register", handleRegsiterAdmin);
router.post("/auth/login", handleLoginAdmin);
router.post("/auth/logout", handleLogoutAdmin);

export default router;
