import { Router } from "express";
const router = Router();
import {
  login,
  logout,
  register,
  forgotPassword,
  resetPassword,
} from "../Controllers/authController.js";
import {
  validateRegisterInput,
  validateLoginInput,
} from "../middleware/ValidatorMiddleware.js";

router.post("/register", validateRegisterInput, register);
router.post("/login", validateLoginInput, login);
router.post("/logout", logout);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

export default router;
