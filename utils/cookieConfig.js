/**
 * Cookie configuration utilities
 */

/**
 * Get cookie configuration for setting cookies
 */
export const getCookieConfig = () => {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    path: "/",
  };
};

/**
 * Get cookie configuration for clearing cookies
 */
export const getClearCookieConfig = () => {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    path: "/",
    expires: new Date(0), // Set to past date to clear
  };
};
