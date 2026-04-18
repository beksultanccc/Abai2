import prisma from "../lib/prisma.js";

export async function listCourses(_req, res) {
  try {
    const courses = await prisma.course.findMany({
      include: {
        teacher: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json(courses);
  } catch (error) {
    console.error("LIST_COURSES_ERROR", error);
    res.status(500).json({ message: "Курстар жүктелмеді" });
  }
}

export async function getCourseById(req, res) {
  try {
    const id = Number(req.params.id);

    const course = await prisma.course.findUnique({
      where: { id },
      include: {
        teacher: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
        lessons: {
          include: {
            attachments: true,
          },
          orderBy: { order: "asc" },
        },
        assignments: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!course) {
      return res.status(404).json({ message: "Курс табылмады" });
    }

    res.json(course);
  } catch (error) {
    console.error("GET_COURSE_ERROR", error);
    res.status(500).json({ message: "Курс жүктелмеді" });
  }
}

export async function createCourse(req, res) {
  try {
    const {
      title,
      description,
      category,
      thumbnailUrl,
      grade,
      section,
      teacherId,
    } = req.validatedBody;

    let finalTeacherId = req.user.id;

    if (req.user.role === "ADMIN") {
      if (!teacherId) {
        return res.status(400).json({ message: "Мұғалімді таңдаңыз" });
      }
      finalTeacherId = Number(teacherId);
    }

    const course = await prisma.course.create({
      data: {
        title,
        description,
        category: category || null,
        thumbnailUrl: thumbnailUrl || null,
        grade: grade ? Number(grade) : null,
        section: section || null,
        teacherId: finalTeacherId,
      },
    });

    res.status(201).json(course);
  } catch (error) {
    console.error("CREATE_COURSE_ERROR", error);
    res.status(500).json({ message: "Курс құру кезінде қате болды" });
  }
}

export async function enrollCourse(req, res) {
  try {
    const courseId = Number(req.params.id);

    const enrollment = await prisma.enrollment.upsert({
      where: {
        userId_courseId: {
          userId: req.user.id,
          courseId,
        },
      },
      update: {},
      create: {
        userId: req.user.id,
        courseId,
      },
    });

    res.json(enrollment);
  } catch (error) {
    console.error("ENROLL_COURSE_ERROR", error);
    res.status(500).json({ message: "Курсқа тіркелу кезінде қате болды" });
  }
}

export async function createLesson(req, res) {
  try {
    const courseId = Number(req.params.courseId);
    const { title, content, videoUrl, order } = req.body;

    const lesson = await prisma.lesson.create({
      data: {
        title,
        content,
        videoUrl: videoUrl || null,
        order: Number(order || 0),
        courseId,
      },
    });

    if (req.files?.length) {
      await prisma.lessonAttachment.createMany({
        data: req.files.map((file) => ({
          lessonId: lesson.id,
          fileName: file.originalname,
          fileUrl: `/uploads/${file.filename}`,
          mimeType: file.mimetype,
        })),
      });
    }

    const fullLesson = await prisma.lesson.findUnique({
      where: { id: lesson.id },
      include: { attachments: true },
    });

    res.status(201).json(fullLesson);
  } catch (error) {
    console.error("CREATE_LESSON_ERROR", error);
    res.status(500).json({ message: "Сабақ қосу кезінде қате болды" });
  }
}

export async function createAssignment(req, res) {
  try {
    const courseId = Number(req.params.courseId);
    const { title, description, dueDate } = req.validatedBody;

    const assignment = await prisma.assignment.create({
      data: {
        title,
        description,
        dueDate: dueDate ? new Date(dueDate) : null,
        courseId,
      },
    });

    res.status(201).json(assignment);
  } catch (error) {
    console.error("CREATE_ASSIGNMENT_ERROR", error);
    res.status(500).json({ message: "Тапсырма қосу кезінде қате болды" });
  }
}

export async function updateCourse(req, res) {
  try {
    const id = Number(req.params.id);
    const {
      title,
      description,
      category,
      thumbnailUrl,
      grade,
      section,
      teacherId,
    } = req.validatedBody;

    const data = {
      title,
      description,
      category: category || null,
      thumbnailUrl: thumbnailUrl || null,
      grade: grade ? Number(grade) : null,
      section: section || null,
    };

    if (req.user.role === "ADMIN" && teacherId) {
      data.teacherId = Number(teacherId);
    }

    const course = await prisma.course.update({
      where: { id },
      data,
    });

    res.json(course);
  } catch (error) {
    console.error("UPDATE_COURSE_ERROR", error);
    res.status(500).json({ message: "Курсты жаңарту кезінде қате болды" });
  }
}

export async function deleteCourse(req, res) {
  try {
    const id = Number(req.params.id);

    await prisma.course.delete({
      where: { id },
    });

    res.json({ message: "Курс өшірілді" });
  } catch (error) {
    console.error("DELETE_COURSE_ERROR", error);
    res.status(500).json({ message: "Курсты өшіру кезінде қате болды" });
  }
}