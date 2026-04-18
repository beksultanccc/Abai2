import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BookOpen,
  ClipboardList,
  GraduationCap,
  Users,
  CheckCircle2,
  Clock3,
  FileCheck,
  School,
} from "lucide-react";
import { useAuth } from "../store/AuthContext.jsx";
import { api } from "../utils/api.js";

function StatCard({ title, value, hint, icon: Icon }) {
  return (
    <div className="card-soft" style={{ padding: 20 }}>
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 16,
        }}
      >
        <div>
          <div style={{ fontSize: 14, color: "#64748b", fontWeight: 600 }}>
            {title}
          </div>
          <div
            style={{
              marginTop: 10,
              fontSize: 32,
              fontWeight: 800,
              color: "#0f172a",
            }}
          >
            {value}
          </div>
          <div style={{ marginTop: 8, fontSize: 14, color: "#64748b" }}>
            {hint}
          </div>
        </div>

        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: 16,
            display: "grid",
            placeItems: "center",
            background: "#dbeafe",
            color: "#2563eb",
            flexShrink: 0,
          }}
        >
          <Icon size={22} />
        </div>
      </div>
    </div>
  );
}

function ActionButton({ children, onClick, secondary = false }) {
  return (
    <button
      className={secondary ? "secondary-button full" : "primary-button full"}
      onClick={onClick}
      type="button"
    >
      {children}
    </button>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [adminStats, setAdminStats] = useState({
    courses: 0,
    assignments: 0,
    students: 0,
    teachers: 0,
  });

  const [teacherStats, setTeacherStats] = useState({
    myCourses: 0,
    pendingReviews: 0,
    directorTasks: 0,
    lessons: 0,
  });

  const [studentStats, setStudentStats] = useState({
    myCourses: 0,
    submissions: 0,
    reviewed: 0,
    pending: 0,
  });

  useEffect(() => {
    async function loadData() {
      try {
        if (user?.role === "ADMIN") {
          const [dashboard, tasks] = await Promise.all([
            api("/dashboard"),
            api("/director-tasks"),
          ]);

          setAdminStats({
            courses: Number(dashboard?.courses || 0),
            assignments: Number(dashboard?.assignments || 0),
            students: Number(dashboard?.students || 0),
            teachers: Number(dashboard?.teachers || 0),
          });

          const allTasks = Array.isArray(tasks) ? tasks : [];
          setTeacherStats((prev) => ({
            ...prev,
            directorTasks: allTasks.length,
          }));
        }

        if (user?.role === "TEACHER") {
          const [courses, submissions, tasks] = await Promise.all([
            api("/courses"),
            api("/submissions/for-review"),
            api("/director-tasks"),
          ]);

          const myCourses = Array.isArray(courses)
            ? courses.filter((c) => c.teacherId === user.id)
            : [];

          const pendingReviews = Array.isArray(submissions)
            ? submissions.filter((s) => s.status !== "REVIEWED").length
            : 0;

          const lessonsCount = myCourses.reduce(
            (sum, course) => sum + (Array.isArray(course.lessons) ? course.lessons.length : 0),
            0
          );

          setTeacherStats({
            myCourses: myCourses.length,
            pendingReviews,
            directorTasks: Array.isArray(tasks) ? tasks.length : 0,
            lessons: lessonsCount,
          });
        }

        if (user?.role === "STUDENT") {
          const [courses, submissions] = await Promise.all([
            api("/courses"),
            api("/submissions/mine"),
          ]);

          const myCourses = Array.isArray(courses)
            ? courses.filter((course) => {
                if (!course.grade) return true;
                const sameGrade = Number(course.grade) === Number(user.grade);
                const sameSection =
                  !course.section || !user.section || course.section === user.section;
                return sameGrade && sameSection;
              })
            : [];

          const mySubs = Array.isArray(submissions) ? submissions : [];

          setStudentStats({
            myCourses: myCourses.length,
            submissions: mySubs.length,
            reviewed: mySubs.filter((s) => s.status === "REVIEWED").length,
            pending: mySubs.filter((s) => s.status !== "REVIEWED").length,
          });
        }
      } catch (error) {
        console.error("DASHBOARD_LOAD_ERROR", error);
      }
    }

    loadData();
  }, [user]);

  if (user?.role === "ADMIN") {
    return (
      <section className="stack-lg">
        <div className="hero hero-modern">
          <span className="pill">Директор панелі</span>
          <h1>Мектепті толық басқару орталығы</h1>
          <p>
            Мұғалімдерді, курстарды, тапсырмаларды және жалпы мектеп статистикасын
            осы жерден бақылаңыз.
          </p>
        </div>

        <div className="dashboard-grid">
          <StatCard title="Курстар" value={adminStats.courses} hint="Барлық курс" icon={BookOpen} />
          <StatCard title="Тапсырмалар" value={adminStats.assignments} hint="Барлық тапсырма" icon={ClipboardList} />
          <StatCard title="Оқушылар" value={adminStats.students} hint="Тіркелген оқушылар" icon={GraduationCap} />
          <StatCard title="Мұғалімдер" value={adminStats.teachers} hint="Белсенді мұғалімдер" icon={Users} />
        </div>

        <div className="dashboard-panels">
          <div className="card-soft" style={{ padding: 24 }}>
            <h3 style={{ margin: 0, fontSize: 22, fontWeight: 800 }}>Негізгі басқару</h3>
            <p style={{ marginTop: 6, color: "#64748b" }}>
              Жүйенің басты бөлімдеріне жылдам өту
            </p>

            <div style={{ display: "grid", gap: 12, marginTop: 18 }}>
              <ActionButton onClick={() => navigate("/admin")}>Мұғалімдер мен қолданушылар</ActionButton>
              <ActionButton onClick={() => navigate("/manage-courses")} secondary>
                Курстарды басқару
              </ActionButton>
              <ActionButton onClick={() => navigate("/director-tasks")} secondary>
                Тапсырма беру
              </ActionButton>
            </div>
          </div>

          <div className="card-soft" style={{ padding: 24 }}>
            <h3 style={{ margin: 0, fontSize: 22, fontWeight: 800 }}>Қысқаша ақпарат</h3>
            <div style={{ display: "grid", gap: 12, marginTop: 18 }}>
              <InfoRow label="Жүйе рөлі" value="Директор" />
              <InfoRow label="Мұғалімдер саны" value={adminStats.teachers} />
              <InfoRow label="Оқушылар саны" value={adminStats.students} />
              <InfoRow label="Курстар саны" value={adminStats.courses} />
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (user?.role === "TEACHER") {
    return (
      <section className="stack-lg">
        <div className="hero hero-modern">
          <span className="pill">Мұғалім панелі</span>
          <h1>Сіздің оқу кеңістігіңіз</h1>
          <p>
            Курстарыңызды басқарып, оқушы жұмыстарын тексеріп, директордан келген
            тапсырмаларды орындаңыз.
          </p>
        </div>

        <div className="dashboard-grid">
          <StatCard title="Менің курстарым" value={teacherStats.myCourses} hint="Сізге бекітілген курстар" icon={BookOpen} />
          <StatCard title="Тексерілмеген жұмыс" value={teacherStats.pendingReviews} hint="Баға қойылмаған жауаптар" icon={ClipboardList} />
          <StatCard title="Директор тапсырмалары" value={teacherStats.directorTasks} hint="Сізге жіберілген тапсырмалар" icon={School} />
          <StatCard title="Сабақтар" value={teacherStats.lessons} hint="Жасалған сабақтар саны" icon={FileCheck} />
        </div>

        <div className="dashboard-panels">
          <div className="card-soft" style={{ padding: 24 }}>
            <h3 style={{ margin: 0, fontSize: 22, fontWeight: 800 }}>Жұмыс әрекеттері</h3>
            <p style={{ marginTop: 6, color: "#64748b" }}>
              Мұғалімге арналған негізгі бөлімдер
            </p>

            <div style={{ display: "grid", gap: 12, marginTop: 18 }}>
              <ActionButton onClick={() => navigate("/manage-courses")}>Курстарды басқару</ActionButton>
              <ActionButton onClick={() => navigate("/grade-submissions")} secondary>
                Оқушы жұмыстарын бағалау
              </ActionButton>
              <ActionButton onClick={() => navigate("/director-tasks")} secondary>
                Директор тапсырмалары
              </ActionButton>
            </div>
          </div>

          <div className="card-soft" style={{ padding: 24 }}>
            <h3 style={{ margin: 0, fontSize: 22, fontWeight: 800 }}>Қысқаша ақпарат</h3>
            <div style={{ display: "grid", gap: 12, marginTop: 18 }}>
              <InfoRow label="Жүйе рөлі" value="Мұғалім" />
              <InfoRow label="Менің курстарым" value={teacherStats.myCourses} />
              <InfoRow label="Тексерілмеген жұмыс" value={teacherStats.pendingReviews} />
              <InfoRow label="Директор тапсырмасы" value={teacherStats.directorTasks} />
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="stack-lg">
      <div className="hero hero-modern">
        <span className="pill">Оқушы панелі</span>
        <h1>Сіздің оқу барысыңыз</h1>
        <p>
          Курстарыңызды қарап, тапсырмаларды орындап, жіберілген жауаптарыңыз бен
          бағаларыңызды бақылаңыз.
        </p>
      </div>

      <div className="dashboard-grid">
        <StatCard title="Менің курстарым" value={studentStats.myCourses} hint="Сыныбыңызға қолжетімді курстар" icon={BookOpen} />
        <StatCard title="Жіберілген жауаптар" value={studentStats.submissions} hint="Барлық жіберген жұмыс" icon={ClipboardList} />
        <StatCard title="Тексерілген" value={studentStats.reviewed} hint="Бағаланған жұмыстар" icon={CheckCircle2} />
        <StatCard title="Күтілуде" value={studentStats.pending} hint="Әлі тексерілмеген жұмыстар" icon={Clock3} />
      </div>

      <div className="dashboard-panels">
        <div className="card-soft" style={{ padding: 24 }}>
          <h3 style={{ margin: 0, fontSize: 22, fontWeight: 800 }}>Оқу әрекеттері</h3>
          <p style={{ marginTop: 6, color: "#64748b" }}>
            Оқушыға арналған негізгі бөлімдер
          </p>

          <div style={{ display: "grid", gap: 12, marginTop: 18 }}>
            <ActionButton onClick={() => navigate("/courses")}>Курстарды ашу</ActionButton>
            <ActionButton onClick={() => navigate("/my-submissions")} secondary>
              Менің жауаптарым
            </ActionButton>
          </div>
        </div>

        <div className="card-soft" style={{ padding: 24 }}>
          <h3 style={{ margin: 0, fontSize: 22, fontWeight: 800 }}>Қысқаша ақпарат</h3>
          <div style={{ display: "grid", gap: 12, marginTop: 18 }}>
            <InfoRow
              label="Сынып"
              value={user?.grade ? `${user.grade}${user?.section ? `-${user.section}` : ""}` : "Көрсетілмеген"}
            />
            <InfoRow label="Курстар" value={studentStats.myCourses} />
            <InfoRow label="Жауаптар" value={studentStats.submissions} />
            <InfoRow label="Тексерілген" value={studentStats.reviewed} />
          </div>
        </div>
      </div>
    </section>
  );
}

function InfoRow({ label, value }) {
  return (
    <div
      style={{
        padding: 14,
        borderRadius: 16,
        background: "#f8fafc",
        border: "1px solid #e2e8f0",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
      }}
    >
      <span style={{ color: "#64748b", fontSize: 14 }}>{label}</span>
      <strong style={{ color: "#0f172a" }}>{value}</strong>
    </div>
  );
}