import bcrypt from "bcrypt";
import User from "../../models/userSchema.js";
import asyncHandler from "express-async-handler";
import logger from "../../utils/logger.js";
import userData from "../../models/userSchema.js";
import mongoose from "mongoose";

/**
 * Register a new user
 * @desc    Register new user
 * @route   POST /api/users/register
 * @access  Public
 */

const registerUser = asyncHandler(async (req, res) => {
  const startTime = Date.now();
  const {
    name,
    email,
    password,
    phone,
    nationalId,
    city,
    state,
    country,
    defaultCurrency,
    userType,
  } = req.body;

  //Log register attempt
  logger?.info(`Attempting to register user:`, {
    name,
    email,
    phone,
    ip: req.ip,
    userAgent: req.headers["user-agent"],
  });

  const sanitizedData = {
    name: name.trim(),
    email: email.trim(),
    phone: phone.trim(),
    nationalId: nationalId.trim(),
    city: city.trim(),
    state: state.trim(),
    country: country.trim(),
    userType: userType.trim(),
  };

  // // start session
  // const session = await mongoose.startSession();
  // session.startTransaction();

  try {
    const [userEmailExists, userPhoneExists, userNationalIdExists] =
      await Promise.all([
        userData.findOne({ email: sanitizedData?.email }),
        // .session(session),
        userData.findOne({ phone: sanitizedData?.phone }),
        // .session(session),
        userData.findOne({ nationalId: sanitizedData?.nationalId }),
        // .session(session),
      ]);

    // check if user already exists
    if (userEmailExists) {
      // session.abortTransaction();
      logger?.warn(`Registration failed: Email already in use`, {
        email: sanitizedData?.email,
        ip: req.ip,
        userAgent: req.headers["user-agent"],
      });
      return res.status(400).json({
        message: "Email already in use. Try with a different email",
      });
    }

    if (userPhoneExists) {
      // session.abortTransaction();
      logger?.warn(`Registration failed: Phone number already in use`, {
        phone: sanitizedData?.phone,
        ip: req.ip,
        userAgent: req.headers["user-agent"],
      });
      return res.status(400).json({
        message:
          "Phone number already in use. Try with a different phone number",
      });
    }

    if (userNationalIdExists) {
      // session.abortTransaction();
      logger?.warn(`Registration failed: National ID already registered`, {
        nationalId: sanitizedData?.nationalId,
        ip: req.ip,
        userAgent: req.headers["user-agent"],
      });
      return res
        .status(400)
        .json({ message: "National ID already registered." });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const user = await User.create(
      {
        ...sanitizedData,
        password: hashedPassword,
        defaultCurrency,
        resetToken: "",
        resetTokenExpiration: null,
      }

      // { session }
    );

    // await session.commitTransaction();

    logger?.info(`User registered successfully`, {
      userId: user._id,
      email: sanitizedData.email,
      ip: req.ip,
      userAgent: req.headers["user-agent"],
      processTime: Date.now() - startTime,
    });

    res.status(201).json({
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        nationalId: user.nationalId,
        city: user.city,
        state: user.state,
        country: user.country,
        defaultCurrency: user.defaultCurrency,
        userType: user.userType,
        resetToken: "",
        resetTokenExpiration: "",
      },
      message: "User registered successfully",
    });
  } catch (error) {
    // await session.abortTransaction();
    logger?.error(`Registration failed: ${error.message}`, {
      email: sanitizedData?.email,
      error: error.message,
      stack: error.stack,
      ip: req.ip,
      userAgent: req.headers["user-agent"],
      processTime: Date.now() - startTime,
    });
    res.status(500).json({
      message: "Registration failed",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  } finally {
    console.log("finished");
    // session.endSession();
  }
});

export { registerUser };
