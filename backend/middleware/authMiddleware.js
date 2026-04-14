const jwt = require("jsonwebtoken");

function protect(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Not authorized. No token provided."
      });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      message: "Not authorized. Invalid token."
    });
  }
}

function lecturerOnly(req, res, next) {
  if (!req.user || req.user.role !== "lecturer") {
    return res.status(403).json({
      message: "Access denied. Lecturer only."
    });
  }

  next();
}

function studentOnly(req, res, next) {
  if (!req.user || req.user.role !== "student") {
    return res.status(403).json({
      message: "Access denied. Student only."
    });
  }

  next();
}

module.exports = {
  protect,
  lecturerOnly,
  studentOnly
};