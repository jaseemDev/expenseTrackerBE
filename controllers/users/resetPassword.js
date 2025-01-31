import asyncHandler from "express-async-handler";
import userData from "../../models/userSchema.js";
import bcrypt from "bcrypt";

const resetPassword = asyncHandler(async (req, res) => {
  const { userId, resetToken, newPassword } = req.body;

  // Find the user by ID
  const user = await userData.findOne({ _id: userId });

  // Check if user exists
  if (!user || !user.resetToken) {
    return res.status(400).json({ message: "Invalid or expired token" });
  }

  // Verify the reset token
  const isTokenMatch = await bcrypt.compare(resetToken, user.resetToken);
  if (!isTokenMatch) {
    return res.status(400).json({ message: "Invalid or expired token" });
  }

  // Check if the token has expired
  if (user.resetTokenExpires < Date.now()) {
    return res.status(400).json({ message: "Token has expired" });
  }

  // Hash the new password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(newPassword, salt);

  // Update user's password and reset token fields
  user.password = hashedPassword;
  user.resetToken = null;
  user.resetTokenExpires = null;

  // Save the updated user data
  await user.save();

  // Send success response
  res.status(200).json({ message: "Password reset successfully" });
});

export { resetPassword };
