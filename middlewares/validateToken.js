import jwt from "jsonwebtoken";

export const validateToken = (req, res, next) => {
  try {
    const token = req.cookies.token;
    console.log(token);
    if (!token)
      return res.status(401).send("No authentication token, access denied");

    const verified = jwt.verify(token, process.env.JWT_SECRET);
    if (!verified)
      return res
        .status(401)
        .json({ message: "Token verification failed, authorization denied" });

    req.user = verified.id || verified.userId || verified.username;
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token expired" });
    }
    res.status(500).json({ message: err.message });
  }
};
