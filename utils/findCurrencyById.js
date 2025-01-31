import Currency from "../models/currencySchema.js";
import asyncHandler from "express-async-handler";

export const findCurrencyById = asyncHandler(async (id) => {
  console.log(id);
  const currency = await Currency.findById(id);
  console.log(currency);
  return currency;
});
