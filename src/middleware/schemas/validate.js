const validate = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body, { abortEarly: false });
  if (error) {
    const errorMessages = error.details.map((detail) => detail.message);
    return res.status(400).json({
      success: false,
      error: {
        error: "Bad Request Validate",
        message: errorMessages,
      },
    });
  }
  next();
};
module.exports = validate;
