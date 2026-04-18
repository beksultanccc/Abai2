import { useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { KeyRound, ShieldCheck } from "lucide-react";
import { api } from "../utils/api.js";

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const token = useMemo(() => searchParams.get("token") || "", [searchParams]);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    if (!token) {
      setError("Қалпына келтіру токені табылмады.");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("Құпиясөз кемінде 6 таңба болуы керек.");
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError("Құпиясөздер сәйкес емес.");
      setLoading(false);
      return;
    }

    try {
      const data = await api("/auth/reset-password", {
        method: "POST",
        body: JSON.stringify({
          token,
          password,
        }),
      });

      setMessage(data.message || "Құпиясөз сәтті жаңартылды.");

      setTimeout(() => {
        navigate("/login", { replace: true });
      }, 1200);
    } catch (e) {
      setError(e.message || "Құпиясөзді жаңарту кезінде қате болды");
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
            <span>Жаңа құпиясөз</span>
          </div>

          <h2 style={{ marginTop: 18 }}>Құпиясөзді жаңарту</h2>
          <p>Жаңа құпиясөз орнатып, аккаунтыңызға қайта кіріңіз.</p>

          <form className="form" onSubmit={handleSubmit}>
            <div>
              <label className="field-label">Жаңа құпиясөз</label>
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
                <KeyRound size={18} color="#64748b" />
                <input
                  type="password"
                  placeholder="Жаңа құпиясөз"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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

            <div>
              <label className="field-label">Құпиясөзді қайталау</label>
              <input
                type="password"
                placeholder="Құпиясөзді қайталау"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            {error && <div className="error-box">{error}</div>}
            {message && <div className="success-box">{message}</div>}

            <button
              className="primary-button full"
              type="submit"
              disabled={loading}
            >
              {loading ? "Жаңартылып жатыр..." : "Құпиясөзді жаңарту"}
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