import bcrypt from "bcryptjs";

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

export const getHashPassword = (password) => {
  const salt = bcrypt.genSaltSync(10);
  return bcrypt.hashSync(password, salt);
};

export const comparePassword = (password, hashedPassword) => {
  const isMatchPassword = bcrypt.compareSync(password, hashedPassword);
  return isMatchPassword;
};
