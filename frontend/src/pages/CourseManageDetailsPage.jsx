import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { BookOpen, FileText, PlayCircle, UploadCloud, CalendarDays } from "lucide-react";
import { api, UPLOAD_BASE } from "../utils/api.js";

export default function CourseManageDetailsPage() {
  const { id } = useParams();

  const [course, setCourse] = useState(null);
  const [lessonForm, setLessonForm] = useState({
    title: "",
    content: "",
    videoUrl: "",
    order: "0",
    files: [],
  });

  const [assignmentForm, setAssignmentForm] = useState({
    title: "",
    description: "",
    dueDate: "",
  });

  const [error, setError] = useState("");
  const [loadingLesson, setLoadingLesson] = useState(false);
  const [loadingAssignment, setLoadingAssignment] = useState(false);

  async function loadCourse() {
    try {
      const data = await api(`/courses/${id}`);
      setCourse(data);
      setError("");
    } catch (e) {
      setError(e.message || "Курс жүктелмеді");
    }
  }

  useEffect(() => {
    loadCourse();
  }, [id]);

  async function handleCreateLesson(e) {
    e.preventDefault();
    setError("");
    setLoadingLesson(true);

    try {
      const formData = new FormData();
      formData.append("title", lessonForm.title);
      formData.append("content", lessonForm.content);
      formData.append("videoUrl", lessonForm.videoUrl);
      formData.append("order", lessonForm.order);

      for (const file of lessonForm.files) {
        formData.append("files", file);
      }

      await api(`/courses/${id}/lessons`, {
        method: "POST",
        body: formData,
      });

      setLessonForm({
        title: "",
        content: "",
        videoUrl: "",
        order: "0",
        files: [],
      });

      await loadCourse();
    } catch (e) {
      setError(e.message || "Сабақ қосу кезінде қате болды");
    } finally {
      setLoadingLesson(false);
    }
  }

  async function handleCreateAssignment(e) {
    e.preventDefault();
    setError("");
    setLoadingAssignment(true);

    try {
      await api(`/courses/${id}/assignments`, {
        method: "POST",
        body: JSON.stringify(assignmentForm),
      });

      setAssignmentForm({
        title: "",
        description: "",
        dueDate: "",
      });

      await loadCourse();
    } catch (e) {
      setError(e.message || "Тапсырма қосу кезінде қате болды");
    } finally {
      setLoadingAssignment(false);
    }
  }

  return (
    <section className="stack-lg">
      <div className="hero hero-modern">
        <span className="pill">Курсты толықтыру</span>
        <h1>{course?.title || "Курсты басқару"}</h1>
        <p>
          Осы беттен сабақтар қосып, материал жүктеп, тапсырмалар жариялай аласыз.
          Барлық оқу мазмұны осы курсқа байланысады.
        </p>

        <div className="button-row">
          <div className="badge">
            {course?.category || "Жалпы пән"}
          </div>
          <div className="badge">
            {course?.grade
              ? `${course.grade}${course?.section ? `-${course.section}` : ""}-сынып`
              : "Сынып көрсетілмеген"}
          </div>
        </div>
      </div>

      {error && <div className="error-box">{error}</div>}

      <div className="teacher-manage-grid">
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
              <PlayCircle size={18} />
            </div>

            <div>
              <h3 style={{ margin: 0, fontSize: 24, fontWeight: 800 }}>
                Сабақ қосу
              </h3>
              <p style={{ margin: "6px 0 0", color: "#64748b" }}>
                Сабақ атауын, мазмұнын, файлдарын және видеосын енгізіңіз
              </p>
            </div>
          </div>

          <form className="form" onSubmit={handleCreateLesson}>
            <div>
              <label className="field-label">Сабақ атауы</label>
              <input
                value={lessonForm.title}
                onChange={(e) =>
                  setLessonForm({ ...lessonForm, title: e.target.value })
                }
                placeholder="Мысалы: Алгебраға кіріспе"
                required
              />
            </div>

            <div>
              <label className="field-label">Мазмұны</label>
              <textarea
                rows={5}
                value={lessonForm.content}
                onChange={(e) =>
                  setLessonForm({ ...lessonForm, content: e.target.value })
                }
                placeholder="Сабақ мазмұнын жазыңыз"
                required
              />
            </div>

            <div className="detail-grid compact-grid">
              <div>
                <label className="field-label">Видео URL</label>
                <input
                  value={lessonForm.videoUrl}
                  onChange={(e) =>
                    setLessonForm({ ...lessonForm, videoUrl: e.target.value })
                  }
                  placeholder="https://youtube.com/..."
                />
              </div>

              <div>
                <label className="field-label">Реті</label>
                <input
                  type="number"
                  value={lessonForm.order}
                  onChange={(e) =>
                    setLessonForm({ ...lessonForm, order: e.target.value })
                  }
                />
              </div>
            </div>

            <div>
              <label className="field-label">Файлдар</label>
              <div
                style={{
                  padding: 16,
                  borderRadius: 18,
                  border: "1px solid #cbd5e1",
                  background: "#fff",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    marginBottom: 10,
                    color: "#64748b",
                  }}
                >
                  <UploadCloud size={18} />
                  <span>PDF, DOCX, сурет, видео және басқа файлдарды жүктей аласыз</span>
                </div>

                <input
                  type="file"
                  multiple
                  onChange={(e) =>
                    setLessonForm({
                      ...lessonForm,
                      files: Array.from(e.target.files || []),
                    })
                  }
                />
              </div>

              {!!lessonForm.files.length && (
                <div style={{ marginTop: 10, fontSize: 14, color: "#64748b" }}>
                  Таңдалған файл саны: {lessonForm.files.length}
                </div>
              )}
            </div>

            <button className="primary-button" type="submit" disabled={loadingLesson}>
              {loadingLesson ? "Сақталып жатыр..." : "Сабақ қосу"}
            </button>
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
              <FileText size={18} />
            </div>

            <div>
              <h3 style={{ margin: 0, fontSize: 24, fontWeight: 800 }}>
                Тапсырма қосу
              </h3>
              <p style={{ margin: "6px 0 0", color: "#64748b" }}>
                Оқушыларға берілетін үй жұмысы немесе тест тапсырмасы
              </p>
            </div>
          </div>

          <form className="form" onSubmit={handleCreateAssignment}>
            <div>
              <label className="field-label">Тапсырма атауы</label>
              <input
                value={assignmentForm.title}
                onChange={(e) =>
                  setAssignmentForm({ ...assignmentForm, title: e.target.value })
                }
                placeholder="Мысалы: Үй жұмысы №1"
                required
              />
            </div>

            <div>
              <label className="field-label">Сипаттама</label>
              <textarea
                rows={5}
                value={assignmentForm.description}
                onChange={(e) =>
                  setAssignmentForm({
                    ...assignmentForm,
                    description: e.target.value,
                  })
                }
                placeholder="Тапсырма шартын толық жазыңыз"
                required
              />
            </div>

            <div>
              <label className="field-label">Deadline</label>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "0 14px",
                  borderRadius: 18,
                  border: "1px solid #cbd5e1",
                  background: "#fff",
                }}
              >
                <CalendarDays size={18} color="#64748b" />
                <input
                  style={{ border: "none", boxShadow: "none", paddingLeft: 0 }}
                  type="datetime-local"
                  value={assignmentForm.dueDate}
                  onChange={(e) =>
                    setAssignmentForm({
                      ...assignmentForm,
                      dueDate: e.target.value,
                    })
                  }
                />
              </div>
            </div>

            <button
              className="primary-button"
              type="submit"
              disabled={loadingAssignment}
            >
              {loadingAssignment ? "Сақталып жатыр..." : "Тапсырма қосу"}
            </button>
          </form>
        </div>
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
            <BookOpen size={18} />
          </div>

          <div>
            <h3 style={{ margin: 0, fontSize: 24, fontWeight: 800 }}>
              Сабақтар
            </h3>
            <p style={{ margin: "6px 0 0", color: "#64748b" }}>
              Осы курсқа қосылған барлық сабақтар
            </p>
          </div>
        </div>

        <div style={{ display: "grid", gap: 14 }}>
          {(course?.lessons || []).length > 0 ? (
            course.lessons.map((lesson) => (
              <div
                key={lesson.id}
                style={{
                  padding: 18,
                  borderRadius: 20,
                  border: "1px solid #e2e8f0",
                  background: "#f8fafc",
                }}
              >
                <div style={{ fontWeight: 800, fontSize: 18, color: "#0f172a" }}>
                  {lesson.title}
                </div>

                <div style={{ color: "#64748b", marginTop: 8, lineHeight: 1.7 }}>
                  {lesson.content}
                </div>

                {!!lesson.videoUrl && (
                  <div style={{ marginTop: 10, fontSize: 14 }}>
                    Видео:{" "}
                    <a
                      href={lesson.videoUrl}
                      target="_blank"
                      rel="noreferrer"
                      style={{ color: "#2563eb", fontWeight: 600 }}
                    >
                      сілтемені ашу
                    </a>
                  </div>
                )}

                {!!lesson.attachments?.length && (
                  <div style={{ marginTop: 12, display: "grid", gap: 8 }}>
                    {lesson.attachments.map((file) => (
                      <a
                        key={file.id}
                        href={`${UPLOAD_BASE}${file.fileUrl}`}
                        target="_blank"
                        rel="noreferrer"
                        className="secondary-button"
                        style={{ width: "fit-content" }}
                      >
                        {file.fileName}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            ))
          ) : (
            <div style={{ color: "#64748b" }}>Сабақтар әлі қосылмаған.</div>
          )}
        </div>
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
            <FileText size={18} />
          </div>

          <div>
            <h3 style={{ margin: 0, fontSize: 24, fontWeight: 800 }}>
              Тапсырмалар
            </h3>
            <p style={{ margin: "6px 0 0", color: "#64748b" }}>
              Осы курсқа жарияланған барлық тапсырмалар
            </p>
          </div>
        </div>

        <div style={{ display: "grid", gap: 14 }}>
          {(course?.assignments || []).length > 0 ? (
            course.assignments.map((assignment) => (
              <div
                key={assignment.id}
                style={{
                  padding: 18,
                  borderRadius: 20,
                  border: "1px solid #e2e8f0",
                  background: "#f8fafc",
                }}
              >
                <div style={{ fontWeight: 800, fontSize: 18, color: "#0f172a" }}>
                  {assignment.title}
                </div>

                <div style={{ color: "#64748b", marginTop: 8, lineHeight: 1.7 }}>
                  {assignment.description}
                </div>

                <div style={{ marginTop: 10, fontSize: 14, color: "#475569" }}>
                  Deadline:{" "}
                  {assignment.dueDate
                    ? new Date(assignment.dueDate).toLocaleString()
                    : "Жоқ"}
                </div>
              </div>
            ))
          ) : (
            <div style={{ color: "#64748b" }}>Тапсырмалар әлі қосылмаған.</div>
          )}
        </div>
      </div>
    </section>
  );
}