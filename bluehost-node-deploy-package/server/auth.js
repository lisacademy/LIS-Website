import jwt from "jsonwebtoken";
import crypto from "node:crypto";

const jwtSecret = getJwtSecret();

function getJwtSecret() {
  const configuredSecret = String(process.env.JWT_SECRET || "").trim();
  if (configuredSecret) {
    return configuredSecret;
  }

  console.warn(
    "JWT_SECRET is not set. Using a generated runtime secret; set JWT_SECRET in production to keep sessions valid across restarts.",
  );

  return crypto.randomBytes(64).toString("hex");
}

export function signToken(payload) {
  return jwt.sign(payload, jwtSecret, { expiresIn: "7d" });
}

export function verifyToken(token) {
  return jwt.verify(token, jwtSecret);
}

export function getBearerToken(req) {
  const header = req.headers.authorization || "";
  if (!header.startsWith("Bearer ")) return null;
  return header.slice(7);
}

export function requireAuth(req, res, next) {
  const token = getBearerToken(req);
  if (!token) {
    return res.status(401).json({ error: "Authentication required." });
  }

  try {
    req.user = verifyToken(token);
    next();
  } catch {
    res.status(401).json({ error: "Invalid or expired session." });
  }
}

export function requireAdmin(req, res, next) {
  return requireAuth(req, res, () => {
    if (req.user?.role !== "admin") {
      return res.status(403).json({ error: "Admin access required." });
    }
    next();
  });
}
