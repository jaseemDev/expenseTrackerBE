import userData from "../../models/userSchema.js";
import { generateResetToken } from "../../utils/generateResetToken.js";
import asyncHandler from "express-async-handler";
import { sendEmail } from "../../utils/sendEmail.js";

const sendPasswordResetLInk = asyncHandler(async (req, res) => {
  //get email from req.body
  const { email } = req.body;

  // find user by email
  const user = await userData.findOne({ email });

  if (user) {
    // check if user has resetToken and resetTokenExpiration. if yes, remove them
    if (user.resetToken !== "" && user.resetTokenExpiration !== null) {
      user.resetToken = "";
      user.resetTokenExpiration = "";
      await user.save();
    }
    // generate reset token and hashed token
    const { resetToken, hashedToken } = await generateResetToken();
    const tokenExpiration = new Date(Date.now() + 15 * 60 * 1000); // Token expires in 15 minutes
    const resetLink = `http://localhost:3000/reset-password/${resetToken}`; // Replace with your frontend URL

    // save resetToken and resetTokenExpiration to user db
    user.resetToken = hashedToken;
    user.resetTokenExpiration = tokenExpiration;
    await user.save();

    // send email with reset link
    const message = `Click the following link to reset your password: ${resetLink}`;
    sendEmail(email, message);

    // send response
    res.status(200).json({
      message: "Password reset link sent to your email",
      data: user.resetToken,
    });
  } else {
    res.status(404).json({ message: "User not found" });
  }
});

export { sendPasswordResetLInk };
