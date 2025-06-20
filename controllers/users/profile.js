import asyncHandler from "express-async-handler";
import userData from "../../models/userSchema.js";
const profile = asyncHandler(async (req, res) => {
  const { userId } = req.body;
  if (!userId) {
    return res.status(400).json({ message: "User ID is required" });
  }
  const user = await userData.findById(userId);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }
  const { name, email } = user;
  res.status(200).json({ name, email });
});
export { profile };
