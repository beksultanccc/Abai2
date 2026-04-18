import prisma from "../lib/prisma.js";

export async function getDashboardStats(req, res) {
  try {
    const [courses, assignments, students, teachers] = await Promise.all([
      prisma.course.count(),
      prisma.assignment.count(),
      prisma.user.count({ where: { role: "STUDENT" } }),
      prisma.user.count({ where: { role: "TEACHER" } }),
    ]);

    res.json({
      courses,
      assignments,
      students,
      teachers,
    });
  } catch (error) {
    console.error("DASHBOARD_STATS_ERROR", error);
    res.status(500).json({ message: "Дашборд статистикасын жүктеу кезінде қате болды" });
  }
}

export async function getRecentActivity(req, res) {
  try {
    const [recentCourses, recentLessons, recentAssignments, recentDirectorTasks, recentSubmissions] =
      await Promise.all([
        prisma.course.findMany({
          take: 3,
          orderBy: { createdAt: "desc" },
          include: {
            teacher: {
              select: { fullName: true },
            },
          },
        }),
        prisma.lesson.findMany({
          take: 3,
          orderBy: { createdAt: "desc" },
          include: {
            course: {
              select: { title: true, grade: true, section: true },
            },
          },
        }),
        prisma.assignment.findMany({
          take: 3,
          orderBy: { createdAt: "desc" },
          include: {
            course: {
              select: { title: true, grade: true, section: true },
            },
          },
        }),
        prisma.directorTask.findMany({
          take: 3,
          orderBy: { createdAt: "desc" },
          include: {
            assignee: {
              select: { fullName: true },
            },
          },
        }),
        prisma.submission.findMany({
          take: 3,
          orderBy: { createdAt: "desc" },
          include: {
            student: {
              select: { fullName: true },
            },
            assignment: {
              select: { title: true },
            },
          },
        }),
      ]);

    const activity = [
      ...recentCourses.map((item) => ({
        id: `course-${item.id}`,
        text: `${item.title} курсы құрылды`,
        time: item.createdAt,
        type: "course",
      })),

      ...recentLessons.map((item) => ({
        id: `lesson-${item.id}`,
        text: `${item.course?.title || "Курс"} курсына ${item.title} сабағы қосылды`,
        time: item.createdAt,
        type: "lesson",
      })),

      ...recentAssignments.map((item) => ({
        id: `assignment-${item.id}`,
        text: `${item.course?.title || "Курс"} курсына ${item.title} тапсырмасы берілді`,
        time: item.createdAt,
        type: "assignment",
      })),

      ...recentDirectorTasks.map((item) => ({
        id: `director-task-${item.id}`,
        text: item.isForAll
          ? `${item.title} тапсырмасы барлық мұғалімге жіберілді`
          : `${item.title} тапсырмасы ${item.assignee?.fullName || "мұғалімге"} жіберілді`,
        time: item.createdAt,
        type: "director_task",
      })),

      ...recentSubmissions.map((item) => ({
        id: `submission-${item.id}`,
        text: `${item.student?.fullName || "Оқушы"} ${item.assignment?.title || "тапсырма"} бойынша жауап жіберді`,
        time: item.createdAt,
        type: "submission",
      })),
    ]
      .sort((a, b) => new Date(b.time) - new Date(a.time))
      .slice(0, 8);

    res.json(activity);
  } catch (error) {
    console.error("RECENT_ACTIVITY_ERROR", error);
    res.status(500).json({ message: "Соңғы белсенділікті жүктеу кезінде қате болды" });
  }
}