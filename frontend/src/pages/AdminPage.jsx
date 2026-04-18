import { useEffect, useState } from "react";
import { api } from "../utils/api.js";

export default function AdminPage() {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    role: "STUDENT",
    grade: "11",
    section: "А",
  });

  async function loadUsers() {
    const data = await api("/admin/users");
    setUsers(data);
  }

  useEffect(() => {
    loadUsers();
  }, []);

  async function handleCreate(e) {
    e.preventDefault();

    await api("/admin/users", {
      method: "POST",
      body: JSON.stringify(form),
    });

    setForm({
      fullName: "",
      email: "",
      password: "",
      role: "STUDENT",
      grade: "11",
      section: "А",
    });

    loadUsers();
  }

  async function handleDelete(id) {
    if (!confirm("Өшіру керек пе?")) return;

    await api(`/admin/users/${id}`, {
      method: "DELETE",
    });

    loadUsers();
  }

  return (
    <section className="stack-lg">
      <h2>Admin панель</h2>

      {/* CREATE */}
      <form className="card-soft" style={{ padding: 20 }} onSubmit={handleCreate}>
        <h3>Жаңа қолданушы</h3>

        <input
          placeholder="Аты"
          value={form.fullName}
          onChange={(e) => setForm({ ...form, fullName: e.target.value })}
        />

        <input
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />

        <input
          placeholder="Пароль"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />

        <select
          value={form.role}
          onChange={(e) => setForm({ ...form, role: e.target.value })}
        >
          <option value="STUDENT">Оқушы</option>
          <option value="TEACHER">Мұғалім</option>
          <option value="ADMIN">Директор</option>
        </select>

        {form.role === "STUDENT" && (
          <>
            <input
              placeholder="Сынып"
              value={form.grade}
              onChange={(e) => setForm({ ...form, grade: e.target.value })}
            />
            <input
              placeholder="Әріп"
              value={form.section}
              onChange={(e) => setForm({ ...form, section: e.target.value })}
            />
          </>
        )}

        <button className="primary-button">Қосу</button>
      </form>

      {/* LIST */}
      <div className="card-soft" style={{ padding: 20 }}>
        <h3>Қолданушылар</h3>

        {users.map((u) => (
          <div
            key={u.id}
            style={{
              display: "flex",
              justifyContent: "space-between",
              padding: 10,
              borderBottom: "1px solid #eee",
            }}
          >
            <div>
              <strong>{u.fullName}</strong> ({u.role})
              <div style={{ fontSize: 12 }}>{u.email}</div>
            </div>

            <button
              className="danger-button"
              onClick={() => handleDelete(u.id)}
            >
              Өшіру
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}