import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { BookOpen, FileText, PlayCircle, User } from "lucide-react";
import { api, UPLOAD_BASE } from "../utils/api.js";
import { useAuth } from "../store/AuthContext.jsx";

export default function CourseDetailsPage() {
  const { id } = useParams();
  const { user } = useAuth();

  const [course, setCourse] = useState(null);
  const [error, setError] = useState("");
  const [answers, setAnswers] = useState({});
  const [filesMap, setFilesMap] = useState({});

  async function loadCourse() {
    try {
      const data = await api(`/courses/${id}`);
      setCourse(data);
    } catch (e) {
      setError(e.message || "Курс жүктелмеді");
    }
  }

  useEffect(() => {
    loadCourse();
  }, [id]);

  async function handleSubmitAssignment(assignmentId) {
    try {
      const formData = new FormData();
      formData.append("answer", answers[assignmentId] || "");

      const files = filesMap[assignmentId] || [];
      for (const file of files) {
        formData.append("files", file);
      }

      await api(`/submissions/${assignmentId}`, {
        method: "POST",
        body: formData,
      });

      alert("Тапсырма сәтті жіберілді");
    } catch (e) {
      alert(e.message || "Жіберу кезінде қате болды");
    }
  }

  if (!course && !error) {
    return <div className="card-soft" style={{ padding: "20px" }}>Курс жүктелуде...</div>;
  }

  return (
    <section className="stack-lg">
      {error && <div className="error-box">{error}</div>}

      <div className="hero hero-modern">
        <span className="pill">{course?.category || "Жалпы пән"}</span>
        <h1>{course?.title || "Курс"}</h1>
        <p>{course?.description || "Сипаттама жоқ"}</p>

        <div className="button-row">
          <div className="badge">
            <User size={14} />
            <span style={{ marginLeft: "6px" }}>
              {course?.teacher?.fullName || "Мұғалім көрсетілмеген"}
            </span>
          </div>
        </div>
      </div>

      <div className="course-details-grid">
        <div className="stack-lg">
          <div className="card-soft" style={{ padding: "24px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "18px" }}>
              <PlayCircle size={20} color="#2563eb" />
              <h3 style={{ margin: 0, fontSize: "24px", fontWeight: 800 }}>Сабақтар</h3>
            </div>

            <div style={{ display: "grid", gap: "14px" }}>
              {(course?.lessons || []).map((lesson, index) => (
                <div
                  key={lesson.id || index}
                  style={{
                    padding: "18px",
                    borderRadius: "20px",
                    border: "1px solid #e2e8f0",
                    background: "#f8fafc",
                  }}
                >
                  <div style={{ fontWeight: 800, fontSize: "18px", color: "#0f172a" }}>
                    {lesson.title}
                  </div>
                  <div style={{ marginTop: "8px", color: "#64748b", lineHeight: 1.6 }}>
                    {lesson.content || "Мазмұн жоқ"}
                  </div>

                  {!!lesson.attachments?.length && (
                    <div style={{ marginTop: "12px", display: "grid", gap: "8px" }}>
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
              ))}
            </div>
          </div>
        </div>

        <div className="stack-lg">
          <div className="card-soft" style={{ padding: "24px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "18px" }}>
              <FileText size={20} color="#2563eb" />
              <h3 style={{ margin: 0, fontSize: "24px", fontWeight: 800 }}>Тапсырмалар</h3>
            </div>

            <div style={{ display: "grid", gap: "12px" }}>
              {(course?.assignments || []).map((assignment, index) => (
                <div
                  key={assignment.id || index}
                  style={{
                    padding: "16px",
                    borderRadius: "18px",
                    background: "#f8fafc",
                    border: "1px solid #e2e8f0",
                  }}
                >
                  <div style={{ fontWeight: 700 }}>{assignment.title}</div>
                  <div style={{ marginTop: "6px", fontSize: "14px", color: "#64748b" }}>
                    {assignment.description || "Сипаттама жоқ"}
                  </div>

                  {user?.role === "STUDENT" && (
                    <div style={{ marginTop: "14px", display: "grid", gap: "10px" }}>
                      <textarea
                        rows={3}
                        placeholder="Жауабыңызды жазыңыз..."
                        value={answers[assignment.id] || ""}
                        onChange={(e) =>
                          setAnswers((prev) => ({
                            ...prev,
                            [assignment.id]: e.target.value,
                          }))
                        }
                      />

                      <input
                        type="file"
                        multiple
                        onChange={(e) =>
                          setFilesMap((prev) => ({
                            ...prev,
                            [assignment.id]: Array.from(e.target.files || []),
                          }))
                        }
                      />

                      <button
                        className="primary-button"
                        onClick={() => handleSubmitAssignment(assignment.id)}
                      >
                        Жіберу
                      </button>
                    </div>
                  )}
                </div>
              ))}

              {!course?.assignments?.length && (
                <div style={{ color: "#64748b" }}>Тапсырмалар әзірге жоқ.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}