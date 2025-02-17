import bcrypt from "bcryptjs";
import rateLimit from "express-rate-limit";

export const sendResponse = (
  res,
  statusCode,
  success,
  message,
  data = null
) => {
  res.status(statusCode).json({
    success,
    message,
    data,
  });
};

export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 login requests per window
  message: "Too many login attempts. Please try again later.",
});

export const getHashPassword = (password) => {
  const salt = bcrypt.genSaltSync(10);
  return bcrypt.hashSync(password, salt);
};

export const comparePassword = (password, hashedPassword) => {
  const isMatchPassword = bcrypt.compareSync(password, hashedPassword);
  return isMatchPassword;
};
