import userData from "../../models/userSchema.js";
import { generateResetToken } from "../../utils/generateResetToken.js";
import asyncHandler from "express-async-handler";
import { sendEmail } from "../../utils/sendEmail.js";
import logger from "../../utils/logger.js";

/**
 * Send password reset link to user's email
 * @desc    Send password reset email
 * @route   POST /api/users/forgot-password
 * @access  Public
 */

const sendPasswordResetLInk = asyncHandler(async (req, res) => {
  const startTime = Date.now();
  //get email from req.body
  const { email } = req.body;

  //log reset attempt
  logger.info(`Attempting to send password reset link to:`, {
    email,
    ip: req.ip,
    userAgent: req.headers["user-agent"],
  });

  // Basic validation (Yup should handle this, but good to have fallback)
  if (!email) {
    logger?.warn("Password reset failed - missing email", {
      ip: req.ip,
    });

    return res.status(400).json({
      success: false,
      message: "Email is required",
    });
  }

  // Sanitize email
  const sanitizedEmail = email.toLowerCase().trim();

  // Start database transaction
  // const session = await mongoose.startSession();
  // session.startTransaction();

  try {
    // find user by email
    const user = await userData.findOne({ email: sanitizedEmail });

    // Always return success message to prevent user enumeration
    // This prevents attackers from discovering valid email addresses
    const successResponse = {
      success: true,
      message:
        "If an account with that email exists, a password reset link has been sent.",
      // Don't include any data that could reveal if user exists
    };

    if (!user) {
      logger?.warn("Password reset failed - user not found", {
        email,
        ip: req.ip,
        processingTime: Date.now() - startTime,
      });
      // Still return success to prevent user enumeration
      // Add artificial delay to match successful request timing
      await new Promise((resolve) => setTimeout(resolve, 100));

      return res.status(200).json(successResponse);
    }

    // Check if there's already a recent reset token (prevent spam)
    const tokenCooldown = 2 * 60 * 1000; // 2 minutes cooldown
    if (
      user.resetTokenExpiration &&
      user.resetTokenExpiration > Date.now() &&
      user.resetTokenExpiration - Date.now() > 15 * 60 * 1000 - tokenCooldown
    ) {
      await session.abortTransaction();

      const timeRemaining = Math.ceil(
        (user.resetTokenExpiration -
          Date.now() -
          (15 * 60 * 1000 - tokenCooldown)) /
          1000 /
          60
      );

      logger?.warn("Password reset rate limited", {
        userId: user._id,
        email: sanitizedEmail,
        ip: req.ip,
        timeRemaining,
      });

      return res.status(429).json({
        success: false,
        message: `Please wait ${timeRemaining} minute(s) before requesting another reset link.`,
      });
    }

    if (user) {
      // check if user has resetToken and resetTokenExpiration. if yes, remove them
      if (user.resetToken !== "" && user.resetTokenExpiration !== null) {
        await userData.updateOne(
          { _id: user._id },
          { $unset: { resetToken: "", resetTokenExpiration: "" } }
        );

        logger?.info("Existing reset token cleared", {
          userId: user._id,
          email: sanitizedEmail,
        });
      }
      // generate reset token and hashed token
      const { resetToken, hashedToken } = await generateResetToken();
      const tokenExpiration = new Date(Date.now() + 15 * 60 * 1000); // Token expires in 15 minutes
      const resetLink = `http://localhost:3000/reset-password/${resetToken}`; // Replace with your frontend URL

      // save resetToken and resetTokenExpiration to user db

      if (resetToken && hashedToken) {
        console.log(resetToken);
        await userData.updateOne(
          { _id: user._id },
          {
            $set: {
              resetToken: hashedToken,
              resetTokenExpiration: tokenExpiration,
            },
          }
        );
      }

      // send email with reset link
      const message = `Click the following link to reset your password: ${resetLink}`;
      const emailRes = sendEmail(sanitizedEmail, message);
      if (emailRes && typeof emailRes.then === "function") {
        emailRes
          .then(() => {
            logger?.info("Password reset email sent", {
              userId: user._id,
              email: sanitizedEmail,
              ip: req.ip,
              userAgent: req.headers["user-agent"],
              processingTime: Date.now() - startTime,
            });
          })
          .catch((error) => {
            logger?.error("Error sending password reset email", {
              error,
              userId: user._id,
              email: sanitizedEmail,
              ip: req.ip,
              userAgent: req.headers["user-agent"],
            });
          });
      }

      // Log successful reset link generation
      logger?.info("Password reset link generated", {
        userId: user._id,
        email: sanitizedEmail,
        ip: req.ip,
        tokenExpiration,
        processingTime: Date.now() - startTime,
      });

      // send response
      res.status(200).json(successResponse);
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    logger?.error("Password reset link generation failed", {
      email: sanitizedEmail,
      ip: req.ip,
      error: error.message,
      stack: error.stack,
      processingTime: Date.now() - startTime,
    });

    res.status(500).json({
      success: false,
      message:
        "Unable to process password reset request. Please try again later.",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

export { sendPasswordResetLInk };
