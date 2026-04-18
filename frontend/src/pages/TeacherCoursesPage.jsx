import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Trash2, Pencil, BookOpen, Sparkles } from "lucide-react";
import { api } from "../utils/api.js";
import { useAuth } from "../store/AuthContext.jsx";

const grades = Array.from({ length: 11 }, (_, i) => i + 1);
const sections = ["А", "Ә", "Б", "В", "Г", "Ғ", "Д", "Е", "Ж"];

const emptyForm = {
  title: "",
  description: "",
  category: "",
  thumbnailUrl: "",
  grade: "11",
  section: "А",
  teacherId: "",
};

export default function TeacherCoursesPage() {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function loadCourses() {
    try {
      const data = await api("/courses");
      const all = Array.isArray(data) ? data : [];
      const filtered =
        user?.role === "ADMIN"
          ? all
          : all.filter((course) => course.teacherId === user?.id);

      setCourses(filtered);
    } catch (e) {
      setError(e.message || "Курстар жүктелмеді");
    }
  }

  async function loadTeachers() {
    if (user?.role !== "ADMIN") return;

    try {
      const data = await api("/admin/teachers");
      setTeachers(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
    }
  }

  useEffect(() => {
    loadCourses();
    loadTeachers();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const payload = {
        ...form,
        grade: Number(form.grade),
      };

      if (user?.role !== "ADMIN") {
        delete payload.teacherId;
      }

      if (editingId) {
        await api(`/courses/${editingId}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
      } else {
        await api("/courses", {
          method: "POST",
          body: JSON.stringify(payload),
        });
      }

      setForm(emptyForm);
      setEditingId(null);
      await loadCourses();
    } catch (e) {
      setError(e.message || "Сақтау кезінде қате болды");
    } finally {
      setLoading(false);
    }
  }

  function handleEdit(course) {
    setEditingId(course.id);
    setForm({
      title: course.title || "",
      description: course.description || "",
      category: course.category || "",
      thumbnailUrl: course.thumbnailUrl || "",
      grade: String(course.grade || 11),
      section: course.section || "А",
      teacherId: course.teacherId ? String(course.teacherId) : "",
    });
  }

  async function handleDelete(id) {
    if (!window.confirm("Курсты өшіру керек пе?")) return;

    try {
      await api(`/courses/${id}`, { method: "DELETE" });
      await loadCourses();
    } catch (e) {
      setError(e.message || "Өшіру кезінде қате болды");
    }
  }

  return (
    <section className="stack-lg">
      <div className="hero hero-modern">
        <span className="pill">Курстарды басқару</span>
        <h1>Курстарды құру және өңдеу</h1>
        <p>
          Сыныпқа арналған курстарды осы жерден жасап, мұғалімге тағайындап,
          кейін сабақтар мен тапсырмаларды толықтыра аласыз.
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1.15fr 0.85fr",
          gap: "24px",
        }}
        className="teacher-manage-grid"
      >
        <div className="card-soft" style={{ padding: 24 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginBottom: 18,
            }}
          >
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 14,
                display: "grid",
                placeItems: "center",
                background: "#dbeafe",
                color: "#2563eb",
              }}
            >
              <Plus size={18} />
            </div>

            <div>
              <h3 style={{ margin: 0, fontSize: 24, fontWeight: 800 }}>
                {editingId ? "Курсты өңдеу" : "Жаңа курс"}
              </h3>
              <p style={{ margin: "6px 0 0", color: "#64748b" }}>
                Курс атауы, сынып, мұғалім және санатын енгізіңіз
              </p>
            </div>
          </div>

          <form className="form" onSubmit={handleSubmit}>
            <div>
              <label className="field-label">Курс атауы</label>
              <input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Мысалы: Алгебра"
                required
              />
            </div>

            <div>
              <label className="field-label">Сипаттама</label>
              <textarea
                rows={4}
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                placeholder="Курс туралы қысқаша сипаттама"
                required
              />
            </div>

            <div className="detail-grid compact-grid">
              <div>
                <label className="field-label">Санат</label>
                <input
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  placeholder="Жалпы пән"
                />
              </div>

              <div>
                <label className="field-label">Сурет URL</label>
                <input
                  value={form.thumbnailUrl}
                  onChange={(e) =>
                    setForm({ ...form, thumbnailUrl: e.target.value })
                  }
                  placeholder="https://..."
                />
              </div>
            </div>

            <div className="detail-grid compact-grid">
              <div>
                <label className="field-label">Сынып</label>
                <select
                  value={form.grade}
                  onChange={(e) => setForm({ ...form, grade: e.target.value })}
                >
                  {grades.map((grade) => (
                    <option key={grade} value={grade}>
                      {grade}-сынып
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="field-label">Әріп</label>
                <select
                  value={form.section}
                  onChange={(e) => setForm({ ...form, section: e.target.value })}
                >
                  {sections.map((section) => (
                    <option key={section} value={section}>
                      {section}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {user?.role === "ADMIN" && (
              <div>
                <label className="field-label">Мұғалім</label>
                <select
                  value={form.teacherId}
                  onChange={(e) =>
                    setForm({ ...form, teacherId: e.target.value })
                  }
                  required
                >
                  <option value="">Мұғалімді таңдаңыз</option>
                  {teachers.map((teacher) => (
                    <option key={teacher.id} value={teacher.id}>
                      {teacher.fullName} ({teacher.email})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {error && <div className="error-box">{error}</div>}

            <div className="button-row">
              <button className="primary-button" type="submit" disabled={loading}>
                {loading
                  ? "Сақталып жатыр..."
                  : editingId
                  ? "Курсты жаңарту"
                  : "Курс құру"}
              </button>

              {editingId && (
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => {
                    setEditingId(null);
                    setForm(emptyForm);
                  }}
                >
                  Бас тарту
                </button>
              )}
            </div>
          </form>
        </div>

        <div className="card-soft" style={{ padding: 24 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginBottom: 18,
            }}
          >
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 14,
                display: "grid",
                placeItems: "center",
                background: "#dbeafe",
                color: "#2563eb",
              }}
            >
              <Sparkles size={18} />
            </div>

            <div>
              <h3 style={{ margin: 0, fontSize: 24, fontWeight: 800 }}>
                Қысқаша мәлімет
              </h3>
              <p style={{ margin: "6px 0 0", color: "#64748b" }}>
                Барлық құрылған курстар туралы қысқа ақпарат
              </p>
            </div>
          </div>

          <div style={{ display: "grid", gap: 14 }}>
            <div
              style={{
                padding: 18,
                borderRadius: 18,
                background: "#f8fafc",
                border: "1px solid #e2e8f0",
              }}
            >
              <div style={{ fontSize: 14, color: "#64748b", fontWeight: 600 }}>
                Барлық курстар
              </div>
              <div style={{ marginTop: 8, fontSize: 30, fontWeight: 800 }}>
                {courses.length}
              </div>
            </div>

            <div
              style={{
                padding: 18,
                borderRadius: 18,
                background: "#f8fafc",
                border: "1px solid #e2e8f0",
              }}
            >
              <div style={{ fontSize: 14, color: "#64748b", fontWeight: 600 }}>
                Сіздің рөліңіз
              </div>
              <div style={{ marginTop: 8, fontSize: 22, fontWeight: 800 }}>
                {user?.role === "ADMIN"
                  ? "Директор"
                  : user?.role === "TEACHER"
                  ? "Мұғалім"
                  : "Оқушы"}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="section-title-row">
        <div>
          <h2 style={{ margin: 0, fontSize: 30, fontWeight: 800 }}>
            Құрылған курстар
          </h2>
          <p className="section-subtitle">
            Әр курсқа өтіп, сабақтар мен тапсырмаларды басқара аласыз
          </p>
        </div>
      </div>

      <div className="grid courses-grid">
        {courses.map((course) => (
          <div key={course.id} className="course-card card-soft">
            <div className="course-cover" />
            <div className="course-content">
              <div className="course-meta">
                <BookOpen size={16} />
                <span>{course.category || "Жалпы пән"}</span>
              </div>

              <h3>{course.title}</h3>
              <p>{course.description}</p>

              <div style={{ marginTop: 10, fontSize: 14, color: "#64748b" }}>
                Сынып:{" "}
                {course.grade
                  ? `${course.grade}${course.section ? `-${course.section}` : ""}`
                  : "Көрсетілмеген"}
              </div>

              <div className="course-actions">
                <Link className="primary-button" to={`/manage-courses/${course.id}`}>
                  Ашу
                </Link>

                <button
                  className="secondary-button"
                  onClick={() => handleEdit(course)}
                >
                  <Pencil size={16} />
                  Өңдеу
                </button>

                <button
                  className="danger-button"
                  onClick={() => handleDelete(course.id)}
                >
                  <Trash2 size={16} />
                  Өшіру
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}