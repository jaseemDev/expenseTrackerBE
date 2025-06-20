import express from "express";
import { registerUser } from "../controllers/users/registerUser.js";
import { validateInput } from "../middlewares/validateInput.js";
import registerUserSchema from "../middlewares/schemas/userSchema.js";
import resetPasswordValidationSchema from "../middlewares/schemas/resetPasswordValidation.js";
import { loginUser } from "../controllers/users/loginUser.js";
import { sendPasswordResetLInk } from "../controllers/users/sendPasswordResetLInk.js";
import { resetPassword } from "../controllers/users/resetPassword.js";
import { strictLimiter } from "../middlewares/rateLimiter.js";
import { validateToken } from "../middlewares/validateToken.js";
import { profile } from "../controllers/users/profile.js";

const router = express.Router();

router.post(
  "/register",
  validateInput(registerUserSchema),
  strictLimiter,
  registerUser
);
router.post("/login", loginUser);
router.post("/profile", validateToken, profile);
router.post(
  "/forgot-password",
  validateInput(resetPasswordValidationSchema),
  sendPasswordResetLInk
);
router.post("/reset-password", resetPassword);

export default router;
