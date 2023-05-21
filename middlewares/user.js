const jwt = require("jsonwebtoken");
const db = require("../util/database");

async function isLogin(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      error: "unauthorized",
    });
  }

  try {
    const decode = jwt.verify(token, "gutoSuperSecert");
    const user = await db.user.findUnique({
      where: {
        id: decode.id,
      },
      include: {
        profileImg: true,
      }
    });

    if (!user) {
      return res.status(400).json({
        error: "user not found.",
      });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(500).json({
      error: "internal server error",
    });
  }
}

async function isAdmin(req, res, next) {
  if (req.user.role !== "ADMIN") {
    return res.status(403).json({
      error: "forbidden",
    });
  }

  next();
}

module.exports.isLogin = isLogin;
module.exports.isAdmin = isAdmin;
