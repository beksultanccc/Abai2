import prisma from "../lib/prisma.js";

export async function createSubmission(req, res) {
  try {
    const assignmentId = Number(req.params.assignmentId);
    const { answer } = req.body;

    const submission = await prisma.submission.upsert({
      where: {
        assignmentId_studentId: {
          assignmentId,
          studentId: req.user.id,
        },
      },
      update: {
        answer,
        status: "SUBMITTED",
      },
      create: {
        assignmentId,
        studentId: req.user.id,
        answer,
        status: "SUBMITTED",
      },
    });

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

    const fullSubmission = await prisma.submission.findUnique({
      where: { id: submission.id },
      include: {
        attachments: true,
        assignment: true,
      },
    });

    res.status(201).json(fullSubmission);
  } catch (error) {
    console.error("CREATE_SUBMISSION_ERROR", error);
    res.status(500).json({ message: "Тапсырма жіберу кезінде қате болды" });
  }
}

export async function listMySubmissions(req, res) {
  try {
    const submissions = await prisma.submission.findMany({
      where: {
        studentId: req.user.id,
      },
      include: {
        assignment: true,
        attachments: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.json(submissions);
  } catch (error) {
    console.error("LIST_MY_SUBMISSIONS_ERROR", error);
    res.status(500).json({ message: "Жауаптар жүктелмеді" });
  }
}

export async function gradeSubmission(req, res) {
  try {
    const submissionId = Number(req.params.submissionId);
    const { score, feedback } = req.body;

    const submission = await prisma.submission.findUnique({
      where: { id: submissionId },
      include: {
        assignment: {
          include: {
            course: true,
          },
        },
      },
    });

    if (!submission) {
      return res.status(404).json({ message: "Жауап табылмады" });
    }

    if (
      req.user.role === "TEACHER" &&
      submission.assignment.course.teacherId !== req.user.id
    ) {
      return res.status(403).json({ message: "Бұл жауапты бағалауға рұқсат жоқ" });
    }

    const updated = await prisma.submission.update({
      where: { id: submissionId },
      data: {
        score: Number(score),
        feedback: feedback || null,
        status: "REVIEWED",
      },
    });

    res.json(updated);
  } catch (error) {
    console.error("GRADE_SUBMISSION_ERROR", error);
    res.status(500).json({ message: "Бағалау кезінде қате болды" });
  }
}
export async function listSubmissionsForReview(req, res) {
  try {
    let where = {};

    if (req.user.role === "TEACHER") {
      where = {
        assignment: {
          course: {
            teacherId: req.user.id,
          },
        },
      };
    }

    const submissions = await prisma.submission.findMany({
      where,
      include: {
        student: {
          select: {
            id: true,
            fullName: true,
            email: true,
            grade: true,
            section: true,
          },
        },
        assignment: {
          include: {
            course: {
              select: {
                id: true,
                title: true,
                teacherId: true,
              },
            },
          },
        },
        attachments: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.json(submissions);
  } catch (error) {
    console.error("LIST_SUBMISSIONS_FOR_REVIEW_ERROR", error);
    res.status(500).json({ message: "Жауаптар жүктелмеді" });
  }
}