import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../store/AuthContext.jsx";

const grades = Array.from({ length: 11 }, (_, i) => i + 1);
const sections = ["А", "Ә", "Б", "В", "Г", "Ғ", "Д", "Е", "Ж"];

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    role: "STUDENT",
    grade: "11",
    section: "А",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await register(formData);
      navigate("/login", { replace: true });
    } catch (e) {
      setError(e.message || "Тіркелу қатесі");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-layout single-column">
      <section className="auth-panel">
        <div className="auth-card-modern wide">
          <h2>Тіркелу</h2>
          <p>Оқушы немесе мұғалім ретінде тіркелуге болады.</p>

          <form className="form" onSubmit={handleSubmit}>
            <div>
              <label className="field-label">Толық аты-жөні</label>
              <input
                type="text"
                placeholder="Толық аты-жөні"
                value={formData.fullName}
                onChange={(e) =>
                  setFormData({ ...formData, fullName: e.target.value })
                }
                required
              />
            </div>

            <div>
              <label className="field-label">Email</label>
              <input
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                required
              />
            </div>

            <div>
              <label className="field-label">Құпиясөз</label>
              <input
                type="password"
                placeholder="Құпиясөз"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                required
              />
            </div>

            <div>
              <label className="field-label">Рөл</label>
              <select
                value={formData.role}
                onChange={(e) =>
                  setFormData({ ...formData, role: e.target.value })
                }
              >
                <option value="STUDENT">Оқушы</option>
                <option value="TEACHER">Мұғалім</option>
              </select>
            </div>

            {formData.role === "STUDENT" && (
              <div className="detail-grid compact-grid">
                <div>
                  <label className="field-label">Сынып</label>
                  <select
                    value={formData.grade}
                    onChange={(e) =>
                      setFormData({ ...formData, grade: e.target.value })
                    }
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
                    value={formData.section}
                    onChange={(e) =>
                      setFormData({ ...formData, section: e.target.value })
                    }
                  >
                    {sections.map((section) => (
                      <option key={section} value={section}>
                        {section}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {error && <div className="error-box">{error}</div>}

            <button
              className="primary-button full"
              type="submit"
              disabled={loading}
            >
              {loading ? "Тіркеліп жатыр..." : "Тіркелу"}
            </button>
          </form>

          <div className="auth-links center">
            <span>Аккаунт бар ма?</span>
            <Link to="/login">Кіру</Link>
          </div>
        </div>
      </section>
    </div>
  );
}