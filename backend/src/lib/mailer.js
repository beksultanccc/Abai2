import nodemailer from "nodemailer";

const port = Number(process.env.SMTP_PORT || 587);

export const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port,
  secure: port === 465,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});


export async function sendResetPasswordEmail(to, resetLink) {
  const from = process.env.SMTP_FROM || process.env.SMTP_USER;

  await transporter.sendMail({
    from,
    to,
    subject: "Құпиясөзді қалпына келтіру",
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.6">
        <h2>Құпиясөзді қалпына келтіру</h2>
        <p>Құпиясөзіңізді жаңарту үшін төмендегі батырманы басыңыз:</p>
        <p>
          <a href="${resetLink}" style="display:inline-block;padding:12px 18px;background:#2563eb;color:#fff;text-decoration:none;border-radius:8px;">
            Құпиясөзді жаңарту
          </a>
        </p>
        <p>Егер бұл сұранысты сіз жасамаған болсаңыз, бұл хатты елемеңіз.</p>
        <p>Сілтеме шектеулі уақытқа ғана жарамды.</p>
      </div>
    `,
  });
}