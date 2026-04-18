import jwt from "jsonwebtoken";

export function signToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role, fullName: user.fullName },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
}
