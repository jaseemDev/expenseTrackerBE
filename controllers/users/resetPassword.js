import asyncHandler from "express-async-handler";
import userData from "../../models/userSchema.js";
import bcrypt from "bcrypt";
import logger from "../../utils/logger.js";
import mongoose from "mongoose";
import { getClearCookieConfig } from "../../utils/cookieConfig.js";

const resetPassword = asyncHandler(async (req, res) => {
  const startTime = Date.now();

  const { userId, resetToken, newPassword } = req.body;

  logger.info("Reset password request received", {
    userId,
    ip: req.ip,
    userAgent: req.headers["user-agent"],
    timestamp: new Date().toISOString(),
  });

  if (!userId || !resetToken || !newPassword) {
    logger?.warn("Password reset failed - missing required fields", {
      userId,
      hasToken: !!resetToken,
      hasPassword: !!newPassword,
      ip: req.ip,
    });
    return res
      .status(400)
      .json({ success: false, message: "All fields are required" });
  }

  // Validate userId format
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    logger?.warn("Password reset failed - invalid user ID format", {
      userId,
      ip: req.ip,
    });

    return res.status(400).json({
      success: false,
      message: "Invalid user ID format",
    });
  }

  // Sanitize inputs
  const sanitizedData = {
    userId: userId.trim(),
    resetToken: resetToken.trim(),
    newPassword: newPassword.trim(),
  };

  try {
    // Find the user by ID
    const user = await userData
      .findOne({ _id: sanitizedData?.userId })
      .select("+resetToken +resetTokenExpiration +password");

    console.log(user);

    // Check if user exists
    if (!user) {
      logger?.warn("Password reset failed - user not found", {
        userId: sanitizedData.userId,
        ip: req.ip,
      });
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check if user has a reset token
    if (!user.resetToken || !user.resetTokenExpiration) {
      logger?.warn("Password reset failed - no active reset token", {
        userId: sanitizedData.userId,
        hasResetToken: !!user.resetToken,
        hasExpiration: !!user.resetTokenExpiration,
        ip: req.ip,
      });

      return res.status(400).json({
        success: false,
        message:
          "No active password reset request found. Please request a new reset link.",
      });
    }

    // Check if the token has expired
    if (user.resetTokenExpiration < Date.now()) {
      logger?.warn("Password reset failed - token expired", {
        userId: sanitizedData.userId,
        tokenExpired: user.resetTokenExpiration,
        currentTime: Date.now(),
        ip: req.ip,
      });

      // Clear expired token
      await userData.updateOne(
        { _id: sanitizedData.userId },
        {
          $unset: {
            resetToken: 1,
            resetTokenExpiration: 1,
            resetTokenRequestedAt: 1,
            resetTokenRequestIP: 1,
          },
        }
      );

      return res.status(400).json({
        success: false,
        message: "Reset token has expired. Please request a new reset link.",
      });
    }

    // Verify the reset token
    const isTokenMatch = await bcrypt.compare(
      sanitizedData.resetToken,
      user.resetToken
    );
    if (!isTokenMatch) {
      logger?.warn("Password reset failed - invalid token", {
        userId: sanitizedData.userId,
        ip: req.ip,
      });

      return res.status(400).json({
        success: false,
        message: "Invalid reset token. Please request a new reset link.",
      });
    }

    // Check if new password is different from current password
    const isSamePassword = await bcrypt.compare(
      sanitizedData.newPassword,
      user.password
    );
    if (isSamePassword) {
      logger?.warn("Password reset failed - same password", {
        userId: sanitizedData.userId,
        ip: req.ip,
      });

      return res.status(400).json({
        success: false,
        message: "New password must be different from your current password",
      });
    }

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(sanitizedData.newPassword, salt);
    // Update user's password and clear reset token fields
    await userData.updateOne(
      { _id: sanitizedData.userId },
      {
        $set: {
          password: hashedPassword,
        },
        $unset: {
          resetToken: 1,
          resetTokenExpiration: 1,
        },
      }
    );

    res.clearCookie("token", getClearCookieConfig());

    // Log successful password reset
    logger?.info("Password reset successful", {
      userId: sanitizedData.userId,
      ip: req.ip,
      processingTime: Date.now() - startTime,
    });

    // Send success response
    res.status(200).json({
      success: true,
      message:
        "Password reset successfully. Please login with your new password.",
    });
  } catch (error) {
    logger?.error("Password reset error", {
      userId: sanitizedData.userId,
      ip: req.ip,
      error: error.message,
      stack: error.stack,
      processingTime: Date.now() - startTime,
    });

    res.status(500).json({
      success: false,
      message: "Password reset failed. Please try again.",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

export { resetPassword };
