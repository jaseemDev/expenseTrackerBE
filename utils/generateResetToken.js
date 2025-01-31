import bcrypt from "bcrypt";

export const generateResetToken = async () => {
  const resetToken =
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15);
  const hashedToken = await bcrypt.hash(resetToken, 10);
  return { resetToken, hashedToken };
};
