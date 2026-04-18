import { useEffect, useMemo, useState } from "react";
import CourseCard from "../components/CourseCard.jsx";
import { useAuth } from "../store/AuthContext.jsx";
import { api } from "../utils/api.js";

export default function CoursesPage() {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState(null);
  const [loading, setLoading] = useState(true);

  async function loadCourses() {
    try {
      setLoading(true);
      setError("");

      const data = await api("/courses");
      const safeCourses = Array.isArray(data)
        ? data.filter((item) => item && typeof item === "object" && item.id)
        : [];

      setCourses(safeCourses);
    } catch (e) {
      setError(e.message || "Курстар жүктелмеді");
      setCourses([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCourses();
  }, []);

  const visibleCourses = useMemo(() => {
    if (!Array.isArray(courses)) return [];

    if (user?.role === "STUDENT") {
      return courses.filter((course) => {
        if (!course.grade) return true;

        const sameGrade = Number(course.grade) === Number(user.grade);
        const sameSection =
          !course.section || !user.section || course.section === user.section;

        return sameGrade && sameSection;
      });
    }

    return courses;
  }, [courses, user]);

  async function handleEnroll(courseId) {
    try {
      setBusyId(courseId);

      await api(`/courses/${courseId}/enroll`, {
        method: "POST",
      });

      await loadCourses();
      alert("Сіз курсқа сәтті тіркелдіңіз");
    } catch (e) {
      alert(e.message || "Тіркелу қатесі");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <section className="stack-lg">
      <div className="hero hero-modern">
        <span className="pill">Курстар</span>
        <h1>Қолжетімді курстар</h1>
        <p>
          Мұнда барлық оқу курстары көрсетіледі. Оқушы болсаңыз, өз сыныбыңызға
          сәйкес курстарды көресіз.
        </p>
      </div>

      {user?.role === "STUDENT" && user.grade && (
        <div className="card-soft" style={{ padding: "16px 20px" }}>
          <strong>Сіздің сыныбыңыз:</strong> {user.grade}
          {user.section ? `-${user.section}` : ""}
        </div>
      )}

      {error && <div className="error-box">{error}</div>}

      {loading ? (
        <div className="card-soft" style={{ padding: "20px" }}>
          Курстар жүктелуде...
        </div>
      ) : (
        <div className="grid courses-grid">
          {visibleCourses.length > 0 ? (
            visibleCourses.map((course) => (
              <CourseCard
                key={course.id}
                course={course}
                onEnroll={user?.role === "STUDENT" ? handleEnroll : null}
                enrolling={busyId === course.id}
              />
            ))
          ) : (
            <div className="card-soft" style={{ padding: "20px" }}>
              {user?.role === "STUDENT"
                ? "Сіздің сыныбыңызға курс табылмады."
                : "Қазір курс жоқ."}
            </div>
          )}
        </div>
      )}
    </section>
  );
}