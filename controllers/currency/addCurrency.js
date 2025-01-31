import asyncHandler from "express-async-handler";
import Currency from "../../models/currencySchema.js";

const addCurrency = asyncHandler(async (req, res) => {
  try {
    const { name, code, symbol, rate } = req.body;
    const currency = await Currency.findOne({ name });
    if (currency) {
      res.status(400).json({ message: "Currency already exists" });
    }
    const newCurrency = await Currency.create({
      name,
      code,
      symbol,
      rate,
    });
    if (newCurrency) {
      res.status(201).json({
        data: {
          _id: newCurrency._id,
          currencyName: newCurrency.name,
          currencyCode: newCurrency.code,
          currencySymbol: newCurrency.symbol,
          currencyRate: newCurrency.rate,
        },
        message: "Currency added successfully",
      });
    } else {
      res.status(400).json({ message: "Invalid currency data" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});
export { addCurrency };
