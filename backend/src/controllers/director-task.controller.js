import prisma from "../lib/prisma.js";

export async function listDirectorTasks(req, res) {
  try {
    let where = {};

    if (req.user.role === "TEACHER") {
      where = {
        OR: [
          { assigneeId: req.user.id },
          { isForAll: true },
        ],
      };
    }

    const tasks = await prisma.directorTask.findMany({
      where,
      include: {
        creator: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
        assignee: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
        attachments: true,
        comments: {
          include: {
            author: {
              select: {
                id: true,
                fullName: true,
                role: true,
              },
            },
          },
          orderBy: {
            createdAt: "asc",
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.json(tasks);
  } catch (error) {
    console.error("LIST_DIRECTOR_TASKS_ERROR", error);
    res.status(500).json({ message: "Тапсырмалар жүктелмеді" });
  }
}

export async function createDirectorTask(req, res) {
  try {
    const { title, description, priority, dueDate, assigneeId, isForAll } = req.body;

    if (!title || !description) {
      return res.status(400).json({
        message: "Тақырып пен сипаттама міндетті",
      });
    }

    const task = await prisma.directorTask.create({
      data: {
        title,
        description,
        priority: priority || "Орташа",
        status: "Жаңа",
        dueDate: dueDate ? new Date(dueDate) : null,
        creatorId: req.user.id,
        assigneeId: isForAll === "true" || isForAll === true ? null : Number(assigneeId),
        isForAll: isForAll === "true" || isForAll === true,
      },
    });

    if (req.files?.length) {
      await prisma.directorTaskAttachment.createMany({
        data: req.files.map((file) => ({
          directorTaskId: task.id,
          fileName: file.originalname,
          fileUrl: `/uploads/${file.filename}`,
          mimeType: file.mimetype,
          type: "DIRECTOR",
        })),
      });
    }

    const fullTask = await prisma.directorTask.findUnique({
      where: { id: task.id },
      include: {
        creator: {
          select: { id: true, fullName: true, email: true },
        },
        assignee: {
          select: { id: true, fullName: true, email: true },
        },
        attachments: true,
        comments: {
          include: {
            author: {
              select: { id: true, fullName: true, role: true },
            },
          },
          orderBy: { createdAt: "asc" },
        },
      },
    });

    res.status(201).json(fullTask);
  } catch (error) {
    console.error("CREATE_DIRECTOR_TASK_ERROR", error);
    res.status(500).json({ message: "Тапсырма құру кезінде қате болды" });
  }
}

export async function updateDirectorTask(req, res) {
  try {
    const id = Number(req.params.id);
    const { title, description, priority, dueDate, assigneeId, isForAll } = req.body;

    const existing = await prisma.directorTask.findUnique({
      where: { id },
    });

    if (!existing) {
      return res.status(404).json({ message: "Тапсырма табылмады" });
    }

    const updatedTask = await prisma.directorTask.update({
      where: { id },
      data: {
        title,
        description,
        priority,
        dueDate: dueDate ? new Date(dueDate) : null,
        assigneeId: isForAll === "true" || isForAll === true ? null : Number(assigneeId),
        isForAll: isForAll === "true" || isForAll === true,
      },
    });

    if (req.files?.length) {
      await prisma.directorTaskAttachment.createMany({
        data: req.files.map((file) => ({
          directorTaskId: updatedTask.id,
          fileName: file.originalname,
          fileUrl: `/uploads/${file.filename}`,
          mimeType: file.mimetype,
          type: "DIRECTOR",
        })),
      });
    }

    res.json(updatedTask);
  } catch (error) {
    console.error("UPDATE_DIRECTOR_TASK_ERROR", error);
    res.status(500).json({ message: "Тапсырманы жаңарту кезінде қате болды" });
  }
}

export async function deleteDirectorTask(req, res) {
  try {
    const id = Number(req.params.id);

    await prisma.directorTask.delete({
      where: { id },
    });

    res.json({ message: "Тапсырма өшірілді" });
  } catch (error) {
    console.error("DELETE_DIRECTOR_TASK_ERROR", error);
    res.status(500).json({ message: "Тапсырманы өшіру кезінде қате болды" });
  }
}

export async function updateDirectorTaskStatus(req, res) {
  try {
    const id = Number(req.params.id);
    const { status } = req.body;

    const existing = await prisma.directorTask.findUnique({
      where: { id },
    });

    if (!existing) {
      return res.status(404).json({ message: "Тапсырма табылмады" });
    }

    if (
      req.user.role === "TEACHER" &&
      !existing.isForAll &&
      existing.assigneeId !== req.user.id
    ) {
      return res.status(403).json({ message: "Бұл тапсырманы өзгертуге рұқсат жоқ" });
    }

    const updated = await prisma.directorTask.update({
      where: { id },
      data: {
        status: status || existing.status,
      },
    });

    res.json(updated);
  } catch (error) {
    console.error("UPDATE_DIRECTOR_TASK_STATUS_ERROR", error);
    res.status(500).json({ message: "Күйін жаңарту кезінде қате болды" });
  }
}

export async function addDirectorTaskComment(req, res) {
  try {
    const id = Number(req.params.id);
    const { content } = req.body;

    if (!content?.trim()) {
      return res.status(400).json({ message: "Комментарий бос болмауы керек" });
    }

    const task = await prisma.directorTask.findUnique({
      where: { id },
    });

    if (!task) {
      return res.status(404).json({ message: "Тапсырма табылмады" });
    }

    if (
      req.user.role === "TEACHER" &&
      !task.isForAll &&
      task.assigneeId !== req.user.id
    ) {
      return res.status(403).json({ message: "Комментарий жазуға рұқсат жоқ" });
    }

    const comment = await prisma.directorTaskComment.create({
      data: {
        directorTaskId: id,
        authorId: req.user.id,
        content,
      },
      include: {
        author: {
          select: {
            id: true,
            fullName: true,
            role: true,
          },
        },
      },
    });

    res.status(201).json(comment);
  } catch (error) {
    console.error("ADD_DIRECTOR_TASK_COMMENT_ERROR", error);
    res.status(500).json({ message: "Комментарий қосу кезінде қате болды" });
  }
}

export async function uploadTeacherResultFiles(req, res) {
  try {
    const id = Number(req.params.id);

    const task = await prisma.directorTask.findUnique({
      where: { id },
    });

    if (!task) {
      return res.status(404).json({ message: "Тапсырма табылмады" });
    }

    if (
      req.user.role === "TEACHER" &&
      !task.isForAll &&
      task.assigneeId !== req.user.id
    ) {
      return res.status(403).json({ message: "Файл жүктеуге рұқсат жоқ" });
    }

    if (!req.files?.length) {
      return res.status(400).json({ message: "Файл таңдалмаған" });
    }

    await prisma.directorTaskAttachment.createMany({
      data: req.files.map((file) => ({
        directorTaskId: id,
        fileName: file.originalname,
        fileUrl: `/uploads/${file.filename}`,
        mimeType: file.mimetype,
        type: "TEACHER",
        uploadedById: req.user.id,
      })),
    });

    const files = await prisma.directorTaskAttachment.findMany({
      where: { directorTaskId: id },
      orderBy: { createdAt: "desc" },
    });

    res.json(files);
  } catch (error) {
    console.error("UPLOAD_TEACHER_RESULT_FILES_ERROR", error);
    res.status(500).json({ message: "Нәтиже файлын жүктеу кезінде қате болды" });
  }
}