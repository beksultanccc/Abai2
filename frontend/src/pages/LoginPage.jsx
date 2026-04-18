import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GraduationCap } from "lucide-react";
import { useAuth } from "../store/AuthContext.jsx";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await login(formData);
      navigate("/dashboard", { replace: true });
    } catch (e) {
      setError(e.message || "Кіру қатесі");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-layout">
      <section className="auth-showcase">
        <div className="showcase-badge">
          <GraduationCap size={22} />
          <span>Abai№2Edu</span>
        </div>

        <h1>Мектепке арналған заманауи оқу платформасы</h1>
        <p>
          Директор, мұғалім және оқушы үшін бір жерден басқарылатын жеңіл LMS.
        </p>

        <div className="showcase-stats">
          <div className="mini-card">
            <strong>3 рөл</strong>
            <span>Директор, мұғалім, оқушы</span>
          </div>
          <div className="mini-card">
            <strong>100%</strong>
            <span>Қазақша интерфейс</span>
          </div>
        </div>
      </section>

      <section className="auth-panel">
        <div className="auth-card-modern">
          <h2>Жүйеге кіру</h2>
          <p>Өз кабинетіңізге кіру үшін деректерді енгізіңіз.</p>

          <form className="form" onSubmit={handleSubmit}>
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

            {error && <div className="error-box">{error}</div>}

            <button
              className="primary-button full"
              type="submit"
              disabled={loading}
            >
              {loading ? "Кіріп жатыр..." : "Кіру"}
            </button>
          </form>

          <div className="auth-links">
            <Link to="/forgot-password">Құпиясөзді ұмыттыңыз ба?</Link>
            <Link to="/register">Тіркелу</Link>
          </div>
        </div>
      </section>
    </div>
  );
}