import { useEffect, useState } from "react";
import { ClipboardCheck, MessageSquare, Star } from "lucide-react";
import { api, UPLOAD_BASE } from "../utils/api.js";

export default function GradeSubmissionsPage() {
  const [submissions, setSubmissions] = useState([]);
  const [error, setError] = useState("");
  const [grading, setGrading] = useState({});

  async function load() {
    try {
      const data = await api("/submissions/for-review");
      setSubmissions(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e.message || "Жауаптар жүктелмеді");
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleGrade(id) {
    const item = grading[id];
    if (!item) return;

    try {
      await api(`/submissions/${id}/grade`, {
        method: "PUT",
        body: JSON.stringify({
          score: item.score,
          feedback: item.feedback,
        }),
      });

      await load();
    } catch (e) {
      alert(e.message || "Бағалау кезінде қате болды");
    }
  }

  return (
    <section className="stack-lg">
      <div className="hero hero-modern">
        <span className="pill">Бағалау жүйесі</span>
        <h1>Оқушы жұмыстарын бағалау</h1>
        <p>
          Мұнда мұғалім мен директор оқушылардың жіберген жауаптарын қарап,
          баға қойып, кері байланыс қалдыра алады.
        </p>
      </div>

      {error && <div className="error-box">{error}</div>}

      <div style={{ display: "grid", gap: 18 }}>
        {submissions.map((submission) => (
          <div key={submission.id} className="card-soft" style={{ padding: 24 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: 18,
                alignItems: "flex-start",
                flexWrap: "wrap",
              }}
            >
              <div style={{ flex: 1, minWidth: 280 }}>
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    color: "#2563eb",
                    fontWeight: 700,
                    fontSize: 14,
                  }}
                >
                  <ClipboardCheck size={16} />
                  Оқушы жауабы
                </div>

                <h3
                  style={{
                    margin: "12px 0 8px",
                    fontSize: 24,
                    fontWeight: 800,
                    color: "#0f172a",
                  }}
                >
                  {submission.assignment?.title || "Тапсырма"}
                </h3>

                <div style={{ color: "#475569", marginBottom: 12 }}>
                  Оқушы: <strong>{submission.student?.fullName || "—"}</strong>
                </div>

                <div
                  style={{
                    padding: 16,
                    borderRadius: 18,
                    background: "#f8fafc",
                    border: "1px solid #e2e8f0",
                    color: "#334155",
                    lineHeight: 1.7,
                  }}
                >
                  {submission.answer || "Жауап мәтіні жоқ"}
                </div>

                {!!submission.attachments?.length && (
                  <div style={{ marginTop: 14, display: "grid", gap: 8 }}>
                    {submission.attachments.map((file) => (
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

              <div
                style={{
                  width: "100%",
                  maxWidth: 340,
                  display: "grid",
                  gap: 14,
                }}
              >
                <div
                  className="card-soft"
                  style={{
                    padding: 18,
                    background: "#f8fafc",
                    boxShadow: "none",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      marginBottom: 10,
                      fontWeight: 800,
                    }}
                  >
                    <Star size={16} color="#2563eb" />
                    Баға қою
                  </div>

                  <div className="form">
                    <div>
                      <label className="field-label">Баға (0-100)</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={grading[submission.id]?.score || ""}
                        onChange={(e) =>
                          setGrading((prev) => ({
                            ...prev,
                            [submission.id]: {
                              ...prev[submission.id],
                              score: e.target.value,
                            },
                          }))
                        }
                      />
                    </div>

                    <div>
                      <label className="field-label">Пікір</label>
                      <textarea
                        rows={4}
                        value={grading[submission.id]?.feedback || ""}
                        onChange={(e) =>
                          setGrading((prev) => ({
                            ...prev,
                            [submission.id]: {
                              ...prev[submission.id],
                              feedback: e.target.value,
                            },
                          }))
                        }
                        placeholder="Оқушыға пікір жазыңыз..."
                      />
                    </div>
                  </div>

                  <button
                    className="primary-button full"
                    style={{ marginTop: 12 }}
                    onClick={() => handleGrade(submission.id)}
                  >
                    <MessageSquare size={16} />
                    Баға қою
                  </button>
                </div>

                <div
                  className="card-soft"
                  style={{
                    padding: 18,
                    background: "#f8fafc",
                    boxShadow: "none",
                  }}
                >
                  <div style={{ fontSize: 14, color: "#64748b", fontWeight: 600 }}>
                    Қазіргі статус
                  </div>
                  <div style={{ marginTop: 8, fontSize: 20, fontWeight: 800 }}>
                    {submission.status || "SUBMITTED"}
                  </div>

                  {submission.score !== null && submission.score !== undefined && (
                    <div style={{ marginTop: 10, color: "#334155" }}>
                      Бұрынғы баға: <strong>{submission.score}</strong>
                    </div>
                  )}

                  {submission.feedback && (
                    <div style={{ marginTop: 10, color: "#64748b", lineHeight: 1.6 }}>
                      {submission.feedback}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}

        {!submissions.length && !error && (
          <div className="card-soft" style={{ padding: 20 }}>
            Қазір бағаланатын жауаптар жоқ.
          </div>
        )}
      </div>
    </section>
  );
}