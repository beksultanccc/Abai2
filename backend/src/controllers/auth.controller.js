import bcrypt from "bcryptjs";
import prisma from "../lib/prisma.js";
import { signToken } from "../lib/token.js";

function serializeUser(user) {
  return {
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
  };
}

export async function register(req, res) {
  const { fullName, email, password, role } = req.validatedBody;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return res.status(409).json({ message: "Бұл email бұрын тіркелген" });

  const user = await prisma.user.create({
    data: {
      fullName,
      email,
      passwordHash: await bcrypt.hash(password, 10),
      role,
    },
  });

  const token = signToken(user);
  return res.status(201).json({ token, user: serializeUser(user) });
}

export async function login(req, res) {
  const { email, password } = req.validatedBody;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return res.status(401).json({ message: "Email немесе құпиясөз қате" });

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ message: "Email немесе құпиясөз қате" });

  const token = signToken(user);
  return res.json({ token, user: serializeUser(user) });
}

export async function me(req, res) {
  const user = await prisma.user.findUnique({ where: { id: req.user.id } });
  if (!user) return res.status(404).json({ message: "Пайдаланушы табылмады" });
  return res.json(serializeUser(user));
}
