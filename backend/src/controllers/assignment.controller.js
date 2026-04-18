import prisma from "../lib/prisma.js";

function fullUrl(req, fileUrl) {
  return `${req.protocol}://${req.get("host")}${fileUrl}`;
}

export async function submitAssignment(req, res) {
  const assignmentId = Number(req.params.id);
  const { answer } = req.validatedBody;

  const assignment = await prisma.assignment.findUnique({
    where: { id: assignmentId },
    include: { course: true },
  });

  if (!assignment) return res.status(404).json({ message: "Тапсырма табылмады" });

  const enrolled = await prisma.enrollment.findUnique({
    where: { userId_courseId: { userId: req.user.id, courseId: assignment.courseId } },
  });
  if (!enrolled) return res.status(403).json({ message: "Алдымен курсқа тіркелу керек" });

  let submission = await prisma.submission.findUnique({
    where: { assignmentId_studentId: { assignmentId, studentId: req.user.id } },
    include: { attachments: true },
  });

  if (!submission) {
    submission = await prisma.submission.create({
      data: { answer, assignmentId, studentId: req.user.id },
      include: { attachments: true },
    });
  } else {
    submission = await prisma.submission.update({
      where: { id: submission.id },
      data: { answer, status: "SUBMITTED" },
      include: { attachments: true },
    });
  }

  if (req.files?.length) {
    await prisma.submissionAttachment.createMany({
      data: req.files.map((file) => ({
        submissionId: submission.id,
        fileName: file.originalname,
        fileUrl: `/uploads/${file.filename}`,
        mimeType: file.mimetype,
      })),
    });
  }

  const refreshed = await prisma.submission.findUnique({
    where: { id: submission.id },
    include: { attachments: true },
  });

  return res.status(201).json({
    message: "Тапсырма жіберілді",
    submission: {
      ...refreshed,
      attachments: refreshed.attachments.map((item) => ({ ...item, fileUrl: fullUrl(req, item.fileUrl) })),
    },
  });
}
