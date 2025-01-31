export const validateInput = (schema) => {
  return async (req, res, next) => {
    try {
      await schema.validate(req.body, { abortEarly: false }); // Validate the request body
      next();
    } catch (error) {
      res.status(400).json({ errors: error.errors }); // Return all validation errors
    }
  };
};
