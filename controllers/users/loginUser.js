import asyncHandler from "express-async-handler";
import User from "../../models/userSchema.js";
import bcrypt from "bcrypt";
import { generateToken } from "../../utils/token.js";
import Currency from "../../models/currencySchema.js";

/**
 * Handles the login process for a user.
 *
 * @param {Object} req - The HTTP request object.
 * @param {string} req.body.email - The email of the user.
 * @param {string} req.body.password - The password of the user.
 * @param {Object} res - The HTTP response object.
 * @returns {Object} - An object containing the user data and a success message, or an error message.
 */
const loginUser = asyncHandler(async (req, res) => {
  // get email and password from req.body
  const { email, password } = req.body;

  /// find user by email
  const user = await User.findOne({ email });

  // if user exists and password is correct, generate token and send response
  if (user && bcrypt.compare(password, user.password)) {
    const defCurrency = await findCurrencyById(user.defaultCurrency);
    console.log(defCurrency);
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
        token: generateToken(user._id),
      },
      message: "Login successful",
    });
  } else {
    res.status(400).json({ message: "Incorrect username or password" });
  }
});

export { loginUser };

const findCurrencyById = asyncHandler(async (id) => {
  const currency = await Currency.findById(id);
  return currency;
});
