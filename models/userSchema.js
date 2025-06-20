import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String, required: true, unique: true },
    nationalId: { type: String, required: true, unique: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    country: { type: String, required: true },
    defaultCurrency: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Currency",
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
    userType: { type: String, default: "user" },
    resetToken: { type: String },
    resetTokenExpiration: { type: Date },
  },
  {
    timestamps: true,
  }
);

var userData = mongoose.model("userData", userSchema);

export default userData;
