import { useEffect, useState } from "react";
import {
  CalendarDays,
  ClipboardList,
  Plus,
  User,
  UploadCloud,
  MessageSquare,
  Pencil,
  Trash2,
} from "lucide-react";
import { useAuth } from "../store/AuthContext.jsx";
import { api, UPLOAD_BASE } from "../utils/api.js";

const emptyForm = {
  title: "",
  description: "",
  priority: "Орташа",
  dueDate: "",
  assigneeId: "",
  isForAll: false,
  files: [],
};

export default function DirectorTasksPage() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [comments, setComments] = useState({});
  const [resultFiles, setResultFiles] = useState({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function loadTasks() {
    try {
      const data = await api("/director-tasks");
      setTasks(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e.message || "Тапсырмалар жүктелмеді");
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
    loadTasks();
    loadTeachers();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("title", form.title);
      formData.append("description", form.description);
      formData.append("priority", form.priority);
      formData.append("dueDate", form.dueDate);
      formData.append("isForAll", String(form.isForAll));

      if (!form.isForAll) {
        formData.append("assigneeId", form.assigneeId);
      }

      for (const file of form.files) {
        formData.append("files", file);
      }

      if (editingId) {
        await api(`/director-tasks/${editingId}`, {
          method: "PUT",
          body: formData,
        });
      } else {
        await api("/director-tasks", {
          method: "POST",
          body: formData,
        });
      }

      setForm(emptyForm);
      setEditingId(null);
      await loadTasks();
    } catch (e) {
      setError(e.message || "Тапсырма сақтау кезінде қате болды");
    } finally {
      setLoading(false);
    }
  }

  function handleEdit(task) {
    setEditingId(task.id);
    setForm({
      title: task.title || "",
      description: task.description || "",
      priority: task.priority || "Орташа",
      dueDate: task.dueDate
        ? new Date(task.dueDate).toISOString().slice(0, 16)
        : "",
      assigneeId: task.assigneeId ? String(task.assigneeId) : "",
      isForAll: !!task.isForAll,
      files: [],
    });
  }

  async function handleDelete(taskId) {
    if (!window.confirm("Тапсырманы өшіру керек пе?")) return;

    try {
      await api(`/director-tasks/${taskId}`, {
        method: "DELETE",
      });

      await loadTasks();
    } catch (e) {
      alert(e.message || "Өшіру кезінде қате болды");
    }
  }

  async function handleStatusChange(taskId, status) {
    try {
      await api(`/director-tasks/${taskId}/status`, {
        method: "PUT",
        body: JSON.stringify({ status }),
      });

      await loadTasks();
    } catch (e) {
      alert(e.message || "Күйді жаңарту кезінде қате болды");
    }
  }

  async function handleComment(taskId) {
    const content = comments[taskId];
    if (!content?.trim()) return;

    try {
      await api(`/director-tasks/${taskId}/comments`, {
        method: "POST",
        body: JSON.stringify({ content }),
      });

      setComments((prev) => ({ ...prev, [taskId]: "" }));
      await loadTasks();
    } catch (e) {
      alert(e.message || "Комментарий жіберу кезінде қате болды");
    }
  }

  async function handleResultFiles(taskId) {
    const files = resultFiles[taskId] || [];
    if (!files.length) return;

    try {
      const formData = new FormData();

      for (const file of files) {
        formData.append("files", file);
      }

      await api(`/director-tasks/${taskId}/result-files`, {
        method: "POST",
        body: formData,
      });

      setResultFiles((prev) => ({ ...prev, [taskId]: [] }));
      await loadTasks();
    } catch (e) {
      alert(e.message || "Файл жүктеу кезінде қате болды");
    }
  }

  function getStatusColor(status) {
    if (status === "Орындалды") {
      return { background: "#dcfce7", color: "#166534" };
    }
    if (status === "Орындалуда") {
      return { background: "#dbeafe", color: "#1d4ed8" };
    }
    return { background: "#fef3c7", color: "#92400e" };
  }

  return (
    <section className="stack-lg">
      <div className="hero hero-modern">
        <span className="pill">
          {user?.role === "ADMIN"
            ? "Директор тапсырмалары"
            : "Директордан келген тапсырмалар"}
        </span>
        <h1>
          {user?.role === "ADMIN"
            ? "Мұғалімдерге тапсырма беру"
            : "Сізге берілген тапсырмалар"}
        </h1>
        <p>
          Тапсырма құру, мұғалімге немесе барлық мұғалімге жіберу, комментарий
          қалдыру және орындалған файлдарды қабылдау.
        </p>
      </div>

      {user?.role === "ADMIN" && (
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
                {editingId ? "Тапсырманы өңдеу" : "Жаңа тапсырма"}
              </h3>
              <p style={{ margin: "6px 0 0", color: "#64748b" }}>
                Бір мұғалімге немесе барлық мұғалімге жібере аласыз
              </p>
            </div>
          </div>

          <form className="form" onSubmit={handleSubmit}>
            <div>
              <label className="field-label">Тапсырма атауы</label>
              <input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="field-label">Сипаттама</label>
              <textarea
                rows={5}
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                required
              />
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <input
                id="isForAll"
                type="checkbox"
                checked={form.isForAll}
                onChange={(e) =>
                  setForm({ ...form, isForAll: e.target.checked, assigneeId: "" })
                }
              />
              <label htmlFor="isForAll">Барлық мұғалімге жіберу</label>
            </div>

            {!form.isForAll && (
              <div>
                <label className="field-label">Мұғалім</label>
                <select
                  value={form.assigneeId}
                  onChange={(e) =>
                    setForm({ ...form, assigneeId: e.target.value })
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

            <div className="detail-grid compact-grid">
              <div>
                <label className="field-label">Приоритет</label>
                <select
                  value={form.priority}
                  onChange={(e) =>
                    setForm({ ...form, priority: e.target.value })
                  }
                >
                  <option value="Төмен">Төмен</option>
                  <option value="Орташа">Орташа</option>
                  <option value="Жоғары">Жоғары</option>
                </select>
              </div>

              <div>
                <label className="field-label">Deadline</label>
                <input
                  type="datetime-local"
                  value={form.dueDate}
                  onChange={(e) =>
                    setForm({ ...form, dueDate: e.target.value })
                  }
                />
              </div>
            </div>

            <div>
              <label className="field-label">Файлдар</label>
              <input
                type="file"
                multiple
                onChange={(e) =>
                  setForm({
                    ...form,
                    files: Array.from(e.target.files || []),
                  })
                }
              />
            </div>

            {error && <div className="error-box">{error}</div>}

            <div className="button-row">
              <button className="primary-button" type="submit" disabled={loading}>
                {loading
                  ? "Сақталып жатыр..."
                  : editingId
                  ? "Жаңарту"
                  : "Тапсырма беру"}
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
      )}

      {error && !loading && <div className="error-box">{error}</div>}

      <div style={{ display: "grid", gap: 18 }}>
        {tasks.map((task) => (
          <div key={task.id} className="card-soft" style={{ padding: 22 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: "18px",
                alignItems: "flex-start",
                flexWrap: "wrap",
              }}
            >
              <div style={{ flex: 1, minWidth: "260px" }}>
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    color: "#2563eb",
                    fontWeight: 700,
                    fontSize: "14px",
                  }}
                >
                  <ClipboardList size={16} />
                  Тапсырма
                </div>

                <h3
                  style={{
                    margin: "12px 0 8px",
                    fontSize: "24px",
                    fontWeight: 800,
                    color: "#0f172a",
                  }}
                >
                  {task.title}
                </h3>

                <p style={{ margin: 0, color: "#64748b", lineHeight: 1.7 }}>
                  {task.description || "Сипаттама жоқ"}
                </p>

                <div
                  style={{
                    marginTop: "18px",
                    display: "flex",
                    gap: "18px",
                    flexWrap: "wrap",
                    color: "#475569",
                    fontSize: "14px",
                  }}
                >
                  <div style={{ display: "inline-flex", gap: "8px", alignItems: "center" }}>
                    <User size={16} />
                    {task.isForAll
                      ? "Барлық мұғалімге"
                      : task.assignee?.fullName || "Мұғалім көрсетілмеген"}
                  </div>

                  <div style={{ display: "inline-flex", gap: "8px", alignItems: "center" }}>
                    <CalendarDays size={16} />
                    {task.dueDate ? new Date(task.dueDate).toLocaleString() : "Мерзімі жоқ"}
                  </div>
                </div>

                {!!task.attachments?.length && (
                  <div style={{ marginTop: 14, display: "grid", gap: 8 }}>
                    {task.attachments.map((file) => (
                      <a
                        key={file.id}
                        href={`${UPLOAD_BASE}${file.fileUrl}`}
                        target="_blank"
                        rel="noreferrer"
                        className="secondary-button"
                        style={{ width: "fit-content" }}
                      >
                        {file.fileName} {file.type === "TEACHER" ? "(мұғалім)" : ""}
                      </a>
                    ))}
                  </div>
                )}

                {!!task.comments?.length && (
                  <div
                    style={{
                      marginTop: 16,
                      display: "grid",
                      gap: 10,
                      padding: 14,
                      borderRadius: 18,
                      background: "#f8fafc",
                      border: "1px solid #e2e8f0",
                    }}
                  >
                    {task.comments.map((comment) => (
                      <div key={comment.id}>
                        <strong>{comment.author?.fullName}</strong>{" "}
                        <span style={{ color: "#64748b", fontSize: 13 }}>
                          ({comment.author?.role})
                        </span>
                        <div style={{ marginTop: 4, color: "#475569" }}>
                          {comment.content}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div style={{ marginTop: 14, display: "grid", gap: 10 }}>
                  <textarea
                    rows={3}
                    placeholder="Комментарий жазыңыз..."
                    value={comments[task.id] || ""}
                    onChange={(e) =>
                      setComments((prev) => ({
                        ...prev,
                        [task.id]: e.target.value,
                      }))
                    }
                  />

                  <button
                    className="secondary-button"
                    onClick={() => handleComment(task.id)}
                  >
                    <MessageSquare size={16} />
                    Комментарий жіберу
                  </button>
                </div>

                {user?.role === "TEACHER" && (
                  <div style={{ marginTop: 14, display: "grid", gap: 10 }}>
                    <input
                      type="file"
                      multiple
                      onChange={(e) =>
                        setResultFiles((prev) => ({
                          ...prev,
                          [task.id]: Array.from(e.target.files || []),
                        }))
                      }
                    />

                    <button
                      className="secondary-button"
                      onClick={() => handleResultFiles(task.id)}
                    >
                      <UploadCloud size={16} />
                      Орындалған файлды жүктеу
                    </button>
                  </div>
                )}
              </div>

              <div
                style={{
                  display: "grid",
                  gap: "10px",
                  minWidth: "220px",
                }}
              >
                <span
                  style={{
                    padding: "10px 14px",
                    borderRadius: "999px",
                    fontSize: "13px",
                    fontWeight: 700,
                    ...getStatusColor(task.status),
                    textAlign: "center",
                  }}
                >
                  {task.status}
                </span>

                {user?.role === "ADMIN" && (
                  <>
                    <button
                      className="secondary-button"
                      onClick={() => handleEdit(task)}
                    >
                      <Pencil size={16} />
                      Өңдеу
                    </button>

                    <button
                      className="danger-button"
                      onClick={() => handleDelete(task.id)}
                    >
                      <Trash2 size={16} />
                      Өшіру
                    </button>
                  </>
                )}

                {user?.role === "TEACHER" && (
                  <>
                    <button
                      className="secondary-button"
                      onClick={() => handleStatusChange(task.id, "Орындалуда")}
                    >
                      Орындалуда
                    </button>

                    <button
                      className="primary-button"
                      onClick={() => handleStatusChange(task.id, "Орындалды")}
                    >
                      Орындалды
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {!tasks.length && !error && (
        <div className="card-soft" style={{ padding: 20 }}>
          Қазір тапсырмалар жоқ.
        </div>
      )}
    </section>
  );
}