import bcrypt from "bcrypt";
import User from "../../models/userSchema.js";
import { generateToken } from "../../utils/token.js";
import asyncHandler from "express-async-handler";
import { updateUserFields } from "../../utils/updateUserFields.js";

const registerUser = asyncHandler(async (req, res) => {
  const {
    _id,
    name,
    email,
    password,
    phone,
    nationalId,
    city,
    state,
    country,
    defaultCurrency,
    isAdmin,
  } = req.body;

  if (_id) {
    // Edit existing user
    const user = await User.findById(_id);
    if (user) {
      updateUserFields(user, {
        name,
        email,
        phone,
        nationalId,
        city,
        state,
        country,
        defaultCurrency,
        isAdmin,
      });

      // Hash password if it needs to be updated
      if (password && !(await bcrypt.compare(password, user.password))) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
      }

      const updatedUser = await user.save();
      const uPopulatedUser = await updatedUser.populate("defaultCurrency");
      console.log(uPopulatedUser);
      res.status(200).json({
        data: {
          _id: uPopulatedUser._id,
          name: uPopulatedUser.name,
          email: uPopulatedUser.email,
          phone: uPopulatedUser.phone,
          nationalId: uPopulatedUser.nationalId,
          city: uPopulatedUser.city,
          state: uPopulatedUser.state,
          country: uPopulatedUser.country,
          defaultCurrency: uPopulatedUser.defaultCurrency,
          isAdmin: uPopulatedUser.isAdmin,
          resetToken: "",
          resetTokenExpiration: "",
        },
        message: "Profile updated successfully",
      });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } else {
    // Add new user
    const [userEmailExists, userMobileExists, userNationalIdExists] =
      await Promise.all([
        User.findOne({ email }),
        User.findOne({ phone }),
        User.findOne({ nationalId }),
      ]);

    if (userEmailExists) {
      return res
        .status(400)
        .json({ message: "Email already in use. Try with a different email" });
    }
    if (userMobileExists) {
      return res.status(400).json({
        message:
          "Phone number already in use. Try with a different phone number",
      });
    }
    if (userNationalIdExists) {
      return res
        .status(400)
        .json({ message: "National ID already registered." });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      phone,
      nationalId,
      city,
      state,
      country,
      defaultCurrency,
      isAdmin,
      resetToken: "",
      resetTokenExpiration: "",
    });

    if (user) {
      // const currencyObj = await Currency.findById(defaultCurrency);
      // if (!currencyObj) {
      //   return res.status(400).json({ message: "Currency not found" });
      // }

      // Populate the defaultCurrency field
      const populatedUser = await user.populate("defaultCurrency");
      console.log(populatedUser);

      res.status(201).json({
        data: {
          _id: populatedUser._id,
          name: populatedUser.name,
          email: populatedUser.email,
          phone: populatedUser.phone,
          nationalId: populatedUser.nationalId,
          city: populatedUser.city,
          state: populatedUser.state,
          country: populatedUser.country,
          defaultCurrency: populatedUser.defaultCurrency,
          token: generateToken(populatedUser._id),
          userType: populatedUser.isAdmin ? "admin" : "user",
        },
        message: "User registered successfully",
      });
    } else {
      res.status(400).json({ message: "Invalid user data" });
    }
  }
});

export { registerUser };
