import bcrypt from "bcryptjs";
import prisma from "./src/lib/prisma.js";

async function main() {
  const email = "admin@abai2edu.kz";   // 👈 өз email жаз
  const password = "Admin123!";        // 👈 пароль

  try {
    // бар ма тексеру
    const existing = await prisma.user.findUnique({
      where: { email },
    });

    if (existing) {
      const updated = await prisma.user.update({
        where: { email },
        data: { role: "ADMIN" },
      });

      console.log("✅ USER ADMIN-ға ауысты:");
      console.log(updated.email, updated.role);
    } else {
      const hashed = await bcrypt.hash(password, 10);

      const created = await prisma.user.create({
        data: {
          fullName: "Бас директор",
          email,
          passwordHash: hashed,
          role: "ADMIN",
        },
      });

      console.log("✅ ADMIN аккаунт жасалды:");
      console.log(created.email, "пароль:", password);
    }
  } catch (error) {
    console.error("❌ Қате:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();