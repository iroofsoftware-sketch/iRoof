import jwt from "jsonwebtoken";

export const generateToken = (res, userId) => {
  const token = jwt.sign({ userId }, process.env.SECRET_KEY, {
    expiresIn: "1d",
  });

  const isProduction = process.env.NODE_ENV === "production";

  res.cookie("token", token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "None" : "Lax",
    maxAge: 24 * 60 * 60 * 1000,
  });

  return token; // Return the token so it can be sent in the response body
};

export const generateResetToken = (res, userId) => {
  const token = jwt.sign({ id: userId }, process.env.SECRET_KEY, {
    expiresIn: "15m",
  });
  const isProduction = process.env.NODE_ENV === "production";
  res.cookie("resetToken", token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "None" : "Lax",
    maxAge: 15 * 60 * 1000,
  });

  return token;
};
