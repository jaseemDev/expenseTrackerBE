import asyncHandler from "express-async-handler";
import User from "../../models/userSchema.js";
import bcrypt from "bcrypt";
import { generateToken } from "../../utils/token.js";
import Currency from "../../models/currencySchema.js";
import logger from "../../utils/logger.js";

/**
 * Handles the login process for a user.
 * @desc    Login user
 * @route   POST /api/users/login
 * @access  Public
 */
const loginUser = asyncHandler(async (req, res) => {
  const startTime = Date.now();
  // get email and password from req.body
  const { email, password } = req.body;

  logger?.info(`Attempting to login user:`, {
    email,
    ip: req.ip,
    userAgent: req.headers["user-agent"],
  });

  // Basic validation (Yup should handle this, but good to have fallback)
  if (!email || !password) {
    logger?.warn("Login failed - missing credentials", {
      email,
      ip: req.ip,
    });
    return res.status(400).json({
      success: false,
      message: "Email and password are required",
    });
  }

  const sanitizedData = {
    email: email.trim(),
    password: password.trim(),
  };

  try {
    // find user by email
    const user = await User.findOne({ email: sanitizedData?.email });
    if (user && (await bcrypt.compare(password, user.password))) {
      const defCurrency = await findCurrencyById(user.defaultCurrency);

      // Log successful login
      logger?.info("Login successful", {
        userId: user._id,
        email: sanitizedData.email,
        ip: req.ip,
        processingTime: Date.now() - startTime,
      });

      const token = generateToken(user._id);

      res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "Strict",
        maxAge: 60 * 60 * 1000, // 1 hour
        path: "/",
      });

      res.status(200).json({
        data: {
          _id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          nationalId: user.nationalId,
          city: user.city,
          state: user.state,
          country: user.country,
          defaultCurrency: defCurrency,
        },
        message: "Login successful",
      });
    } else {
      res.status(400).json({ message: "Incorrect username or password" });
    }
  } catch (error) {
    logger?.error("Login error", {
      email: sanitizedData.email,
      ip: req.ip,
      error: error.message,
      stack: error.stack,
      processingTime: Date.now() - startTime,
    });

    res.status(500).json({
      success: false,
      message: "Login failed. Please try again.",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }

  // if user exists and password is correct, generate token and send response
});

export { loginUser };

const findCurrencyById = asyncHandler(async (id) => {
  const currency = await Currency.findById(id).select(
    "-_id -lastUpdated -rate"
  );
  return currency;
});
