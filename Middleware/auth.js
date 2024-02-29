import jwt from "jsonwebtoken";

export const authentication = (req, res, next) => {
  const { Token } = req.cookies;
  if (Token) {
    const user = jwt.decode(Token, process.env.SECRET_CODE);

    req.userID = user;

    next();
  } else {
    res.status(404).json({
      success: false,
      message: "Login first...",
    });
  }
};
