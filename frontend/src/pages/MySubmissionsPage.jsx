import { useEffect, useState } from "react";
import { api, UPLOAD_BASE } from "../utils/api.js";

export default function MySubmissionsPage() {
  const [submissions, setSubmissions] = useState([]);
  const [error, setError] = useState("");

  async function load() {
    try {
      const data = await api("/submissions/mine");
      setSubmissions(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e.message || "Жауаптар жүктелмеді");
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <section className="stack-lg">
      <div>
        <h2 style={{ margin: 0, fontSize: 34, fontWeight: 800 }}>Менің жауаптарым</h2>
        <p className="section-subtitle">Жіберілген тапсырмалар мен файлдар</p>
      </div>

      {error && <div className="error-box">{error}</div>}

      <div style={{ display: "grid", gap: 16 }}>
        {submissions.map((item) => (
          <div key={item.id} className="card-soft" style={{ padding: 20 }}>
            <div style={{ fontWeight: 800, fontSize: 20 }}>
              {item.assignment?.title || "Тапсырма"}
            </div>

            <div style={{ marginTop: 10, color: "#475569" }}>{item.answer}</div>

            <div style={{ marginTop: 10, fontSize: 14, color: "#64748b" }}>
              Статус: {item.status}
            </div>

            {item.score !== null && item.score !== undefined && (
              <div style={{ marginTop: 6, fontSize: 14 }}>Баға: {item.score}</div>
            )}

            {item.feedback && (
              <div style={{ marginTop: 6, fontSize: 14 }}>Пікір: {item.feedback}</div>
            )}

            {!!item.attachments?.length && (
              <div style={{ marginTop: 12, display: "grid", gap: 8 }}>
                {item.attachments.map((file) => (
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
    </section>
  );
}