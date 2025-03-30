const validate = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body, { abortEarly: false });
  if (error) {
    const errorMessages = error.details.map((detail) => detail.message);
    return res.status(400).json({
      statusCode: false,
      message: errorMessages,
      error: "Bad Request",
    });
  }
  next();
};
module.exports = validate;
