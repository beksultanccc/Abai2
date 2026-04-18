import prisma from "../lib/prisma.js";
import bcrypt from "bcryptjs";

export async function getUsers(req, res) {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
  });

  res.json(users);
}

export async function createUser(req, res) {
  const { fullName, email, password, role, grade, section } = req.body;

  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) {
    return res.status(400).json({ message: "Email бұрын тіркелген" });
  }

  const user = await prisma.user.create({
    data: {
      fullName,
      email,
      passwordHash: await bcrypt.hash(password, 10),
      role,
      grade: role === "STUDENT" ? Number(grade) : null,
      section: role === "STUDENT" ? section : null,
    },
  });

  res.json(user);
}

export async function updateUser(req, res) {
  const id = Number(req.params.id);
  const { fullName, role, grade, section } = req.body;

  const user = await prisma.user.update({
    where: { id },
    data: {
      fullName,
      role,
      grade: role === "STUDENT" ? Number(grade) : null,
      section: role === "STUDENT" ? section : null,
    },
  });

  res.json(user);
}

export async function deleteUser(req, res) {
  const id = Number(req.params.id);

  await prisma.user.delete({
    where: { id },
  });

  res.json({ message: "Қолданушы өшірілді" });
}
export async function getTeachers(req, res) {
  const teachers = await prisma.user.findMany({
    where: { role: "TEACHER" },
    orderBy: { fullName: "asc" },
    select: {
      id: true,
      fullName: true,
      email: true,
      role: true,
    },
  });

  res.json(teachers);
}
export async function getAllSubmissions(req, res) {
  const submissions = await prisma.submission.findMany({
    include: {
      student: {
        select: {
          id: true,
          fullName: true,
          email: true,
        },
      },
      assignment: true,
      attachments: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  res.json(submissions);
}