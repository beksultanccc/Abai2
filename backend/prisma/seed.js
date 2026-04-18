import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const passwords = {
    admin: await bcrypt.hash("Admin123!", 10),
    teacher: await bcrypt.hash("Teacher123!", 10),
    student: await bcrypt.hash("Student123!", 10),
  };

  const admin = await prisma.user.upsert({
    where: { email: "admin@school.local" },
    update: {},
    create: {
      fullName: "Мектеп директоры",
      email: "admin@school.local",
      passwordHash: passwords.admin,
      role: "ADMIN",
    },
  });

  const teacher = await prisma.user.upsert({
    where: { email: "teacher@school.local" },
    update: {},
    create: {
      fullName: "Аружан Мұғалім",
      email: "teacher@school.local",
      passwordHash: passwords.teacher,
      role: "TEACHER",
    },
  });

  const student = await prisma.user.upsert({
    where: { email: "student@school.local" },
    update: {},
    create: {
      fullName: "Диас Оқушы",
      email: "student@school.local",
      passwordHash: passwords.student,
      role: "STUDENT",
    },
  });

  const course = await prisma.course.upsert({
    where: { id: 1 },
    update: {},
    create: {
      title: "Веб-бағдарламалау негіздері",
      description: "HTML, CSS, JavaScript және жобалық жұмыс негіздері.",
      category: "Бағдарламалау",
      thumbnailUrl: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1200&auto=format&fit=crop",
      teacherId: teacher.id,
      lessons: {
        create: [
          {
            title: "HTML кіріспе",
            content: "HTML құжатының құрылымы, тэгтер, мәтін және суретпен жұмыс.",
            order: 1,
          },
          {
            title: "CSS арқылы безендіру",
            content: "Түстер, қаріптер, layout, flexbox және responsive негіздері.",
            order: 2,
            videoUrl: "https://www.youtube.com/watch?v=OXGznpKZ_sA",
          },
        ],
      },
      assignments: {
        create: [
          {
            title: "Мектеп сайтының басты бетін құрастыру",
            description: "HTML және CSS арқылы басты бет макетін жаса. Архив не скриншот жүктеуге болады.",
          },
        ],
      },
    },
  });

  await prisma.enrollment.upsert({
    where: { userId_courseId: { userId: student.id, courseId: course.id } },
    update: {},
    create: { userId: student.id, courseId: course.id },
  });

  await prisma.directorTask.upsert({
    where: { id: 1 },
    update: {},
    create: {
      title: "Апталық есеп дайындау",
      description: "Оқу үлгерімі мен қатысу бойынша қысқа есеп дайындап жіберіңіз.",
      priority: "Жоғары",
      status: "Жаңа",
      creatorId: admin.id,
      assigneeId: teacher.id,
    },
  });

  console.log("Seed finished");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
