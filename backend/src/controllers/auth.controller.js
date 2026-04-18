import bcrypt from "bcryptjs";
import crypto from "crypto";
import prisma from "../lib/prisma.js";
import { signToken } from "../lib/token.js";
import { sendMail } from "../lib/mailer.js";

function serializeUser(user) {
  return {
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    role: user.role,
    grade: user.grade,
    section: user.section,
    createdAt: user.createdAt,
  };
}

export async function register(req, res) {
  try {
    const { fullName, email, password, role, grade, section } = req.validatedBody;

    const normalizedEmail = String(email).toLowerCase().trim();
    const normalizedRole = role || "STUDENT";

    const existing = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existing) {
      return res.status(409).json({ message: "Бұл email бұрын тіркелген" });
    }

    if (normalizedRole === "STUDENT" && (!grade || !section)) {
      return res.status(400).json({ message: "Сынып пен әріпті таңдаңыз" });
    }

    const user = await prisma.user.create({
      data: {
        fullName,
        email: normalizedEmail,
        passwordHash: await bcrypt.hash(password, 10),
        role: normalizedRole,
        grade: normalizedRole === "STUDENT" ? Number(grade) : null,
        section: normalizedRole === "STUDENT" ? section : null,
      },
    });

    return res.status(201).json({
      message: "Тіркелу сәтті аяқталды",
      user: serializeUser(user),
    });
  } catch (error) {
    console.error("REGISTER_ERROR", error);
    return res.status(500).json({ message: "Сервер қатесі" });
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.validatedBody;
    const normalizedEmail = String(email).toLowerCase().trim();

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      return res.status(401).json({ message: "Email немесе құпиясөз қате" });
    }

    const ok = await bcrypt.compare(password, user.passwordHash);

    if (!ok) {
      return res.status(401).json({ message: "Email немесе құпиясөз қате" });
    }

    const token = signToken(user);

    return res.json({
      token,
      user: serializeUser(user),
    });
  } catch (error) {
    console.error("LOGIN_ERROR", error);
    return res.status(500).json({ message: "Сервер қатесі" });
  }
}

export async function me(req, res) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
    });

    if (!user) {
      return res.status(404).json({ message: "Пайдаланушы табылмады" });
    }

    return res.json(serializeUser(user));
  } catch (error) {
    console.error("ME_ERROR", error);
    return res.status(500).json({ message: "Сервер қатесі" });
  }
}

export async function forgotPassword(req, res) {
  try {
    const email = String(req.body.email || "").toLowerCase().trim();

    if (!email) {
      return res.status(400).json({ message: "Email енгізіңіз" });
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.json({
        message: "Егер бұл email жүйеде болса, қалпына келтіру сілтемесі жіберілді.",
      });
    }

    await prisma.passwordResetToken.updateMany({
      where: {
        userId: user.id,
        used: false,
      },
      data: {
        used: true,
      },
    });

    const rawToken = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 1000 * 60 * 30);

    await prisma.passwordResetToken.create({
      data: {
        token: rawToken,
        userId: user.id,
        expiresAt,
      },
    });

    const resetUrl = `${process.env.APP_BASE_URL}/reset-password?token=${rawToken}`;

    await sendMail({
      to: user.email,
      subject: "Құпиясөзді қалпына келтіру",
      text: `Құпиясөзді қалпына келтіру сілтемесі: ${resetUrl}`,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
          <h2>Құпиясөзді қалпына келтіру</h2>
          <p>Төмендегі батырма арқылы жаңа құпиясөз орнатыңыз:</p>
          <p>
            <a href="${resetUrl}" style="display:inline-block;padding:12px 18px;background:#2563eb;color:#fff;text-decoration:none;border-radius:8px;">
              Құпиясөзді жаңарту
            </a>
          </p>
          <p>Егер батырма ашылмаса, мына сілтемені көшіріп ашыңыз:</p>
          <p>${resetUrl}</p>
          <p>Бұл сілтеме 30 минут ішінде жарамды.</p>
        </div>
      `,
    });

    return res.json({
      message: "Егер бұл email жүйеде болса, қалпына келтіру сілтемесі жіберілді.",
    });
  } catch (error) {
    console.error("FORGOT_PASSWORD_ERROR", error);
    return res.status(500).json({
      message: "Құпиясөзді қалпына келтіру кезінде қате болды",
    });
  }
}

export async function resetPassword(req, res) {
  try {
    const token = String(req.body.token || "").trim();
    const password = String(req.body.password || "");

    if (!token || !password) {
      return res.status(400).json({ message: "Токен және жаңа құпиясөз керек" });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: "Құпиясөз кемінде 6 таңба болуы керек",
      });
    }

    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!resetToken) {
      return res.status(400).json({ message: "Токен жарамсыз" });
    }

    if (resetToken.used) {
      return res.status(400).json({ message: "Бұл сілтеме бұрын қолданылған" });
    }

    if (new Date(resetToken.expiresAt).getTime() < Date.now()) {
      return res.status(400).json({ message: "Сілтеменің уақыты өтіп кеткен" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.$transaction([
      prisma.user.update({
        where: { id: resetToken.userId },
        data: { passwordHash: hashedPassword },
      }),
      prisma.passwordResetToken.update({
        where: { id: resetToken.id },
        data: { used: true },
      }),
      prisma.passwordResetToken.updateMany({
        where: {
          userId: resetToken.userId,
          used: false,
        },
        data: {
          used: true,
        },
      }),
    ]);

    return res.json({
      message: "Құпиясөз сәтті жаңартылды",
    });
  } catch (error) {
    console.error("RESET_PASSWORD_ERROR", error);
    return res.status(500).json({
      message: "Құпиясөзді жаңарту кезінде қате болды",
    });
  }
}