import { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, ShieldCheck } from "lucide-react";
import { api } from "../utils/api.js";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const data = await api("/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify({ email }),
      });

      setMessage(
        data.message || "Егер бұл email жүйеде болса, қалпына келтіру сілтемесі жіберілді."
      );
    } catch (e) {
      setError(e.message || "Сұраныс жіберу кезінде қате болды");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-layout single-column">
      <section className="auth-panel">
        <div className="auth-card-modern">
          <div className="showcase-badge">
            <ShieldCheck size={18} />
            <span>Қауіпсіздік</span>
          </div>

          <h2 style={{ marginTop: 18 }}>Құпиясөзді қалпына келтіру</h2>
          <p>
            Email енгізіңіз. Егер ол аккаунтпен байланысқан болса, біз сізге
            қалпына келтіру сілтемесін жібереміз.
          </p>

          <form className="form" onSubmit={handleSubmit}>
            <div>
              <label className="field-label">Email</label>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  border: "1px solid #cbd5e1",
                  borderRadius: "18px",
                  padding: "0 14px",
                  background: "#fff",
                }}
              >
                <Mail size={18} color="#64748b" />
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  style={{
                    border: "none",
                    outline: "none",
                    boxShadow: "none",
                    paddingLeft: 0,
                  }}
                />
              </div>
            </div>

            {error && <div className="error-box">{error}</div>}
            {message && <div className="success-box">{message}</div>}

            <button
              className="primary-button full"
              type="submit"
              disabled={loading}
            >
              {loading ? "Жіберіліп жатыр..." : "Сілтеме жіберу"}
            </button>
          </form>

          <div className="auth-links center" style={{ marginTop: 18 }}>
            <Link to="/login">Кіру бетіне оралу</Link>
          </div>
        </div>
      </section>
    </div>
  );
}