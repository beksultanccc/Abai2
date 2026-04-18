import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  GraduationCap,
  ShieldCheck,
  Users,
  BookOpen,
  ClipboardList,
  School,
} from "lucide-react";
import CourseCard from "../components/CourseCard.jsx";
import { api } from "../utils/api.js";
import { useAuth } from "../store/AuthContext.jsx";

export default function HomePage() {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCourses() {
      try {
        const data = await api("/courses");
        const safeCourses = Array.isArray(data) ? data.slice(0, 3) : [];
        setCourses(safeCourses);
      } catch {
        setCourses([]);
      } finally {
        setLoading(false);
      }
    }

    loadCourses();
  }, []);

  return (
    <section className="stack-lg">
      <div className="hero hero-modern hero-grid">
        <div>
          <span className="pill">Abai№2Edu LMS</span>

          <h1>Мектепке арналған заманауи оқу платформасы</h1>

          <p>
            Директор, мұғалім және оқушыға арналған біртұтас цифрлық орта.
            Курстарды жүргізу, тапсырма беру, файл жүктеу, бағалау және оқу
            процесін басқару — барлығы бір жерде.
          </p>

          <div className="button-row">
            {user ? (
              <Link to="/dashboard" className="primary-button">
                Жеке кабинетке өту
              </Link>
            ) : (
              <>
                <Link to="/login" className="primary-button">
                  Кіру
                </Link>
                <Link to="/register" className="secondary-button">
                  Тіркелу
                </Link>
              </>
            )}
          </div>
        </div>

        <div className="hero-panel modern-grid">
          <div className="mini-stat">
            <strong>3</strong>
            <span>Негізгі рөл</span>
          </div>
          <div className="mini-stat">
            <strong>100%</strong>
            <span>Қазақша интерфейс</span>
          </div>
          <div className="mini-stat">
            <strong>24/7</strong>
            <span>Онлайн қолжетімділік</span>
          </div>
        </div>
      </div>

      <div className="admin-stat-grid">
        <div className="card-soft" style={{ padding: 24 }}>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 16,
              display: "grid",
              placeItems: "center",
              background: "#dbeafe",
              color: "#2563eb",
              marginBottom: 14,
            }}
          >
            <ShieldCheck size={22} />
          </div>
          <h3 style={{ margin: 0, fontSize: 22, fontWeight: 800 }}>
            Директорға
          </h3>
          <p style={{ marginTop: 10, color: "#64748b", lineHeight: 1.7 }}>
            Мұғалімдерді басқару, курстарды тағайындау, аналитика қарау және
            тапсырмаларды бақылау.
          </p>
        </div>

        <div className="card-soft" style={{ padding: 24 }}>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 16,
              display: "grid",
              placeItems: "center",
              background: "#dbeafe",
              color: "#2563eb",
              marginBottom: 14,
            }}
          >
            <Users size={22} />
          </div>
          <h3 style={{ margin: 0, fontSize: 22, fontWeight: 800 }}>
            Мұғалімге
          </h3>
          <p style={{ marginTop: 10, color: "#64748b", lineHeight: 1.7 }}>
            Сабақ қосу, тапсырма беру, файл жүктеу, оқушы жұмысын тексеру және
            баға қою.
          </p>
        </div>

        <div className="card-soft" style={{ padding: 24 }}>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 16,
              display: "grid",
              placeItems: "center",
              background: "#dbeafe",
              color: "#2563eb",
              marginBottom: 14,
            }}
          >
            <GraduationCap size={22} />
          </div>
          <h3 style={{ margin: 0, fontSize: 22, fontWeight: 800 }}>
            Оқушыға
          </h3>
          <p style={{ marginTop: 10, color: "#64748b", lineHeight: 1.7 }}>
            Курстарға қатысу, тапсырма жіберу, файл тіркеу, баға мен кері
            байланысты көру.
          </p>
        </div>
      </div>

      <div className="card-soft" style={{ padding: 28 }}>
        <div className="section-title-row">
          <div>
            <h2 style={{ margin: 0, fontSize: 30, fontWeight: 800 }}>
              Платформаның мүмкіндіктері
            </h2>
            <p className="section-subtitle">
              Оқу процесін ыңғайлы және заманауи басқаруға арналған құралдар
            </p>
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
            gap: 18,
            marginTop: 20,
          }}
          className="landing-feature-grid"
        >
          <FeatureCard
            icon={<School size={20} />}
            title="Сынып бойынша бөлу"
            text="Курстарды нақты сынып пен әріпке тағайындауға болады."
          />
          <FeatureCard
            icon={<BookOpen size={20} />}
            title="Курстар мен сабақтар"
            text="Мұғалім кез келген пәнге сабақ, материал және видео қоса алады."
          />
          <FeatureCard
            icon={<ClipboardList size={20} />}
            title="Тапсырма және бағалау"
            text="Оқушы жауап береді, мұғалім тексереді, баға мен пікір қояды."
          />
          <FeatureCard
            icon={<ShieldCheck size={20} />}
            title="Қауіпсіз кабинет"
            text="Әр қолданушы өз рөліне сәйкес жеке кабинетпен кіреді."
          />
        </div>
      </div>

      <div className="section-title-row">
        <div>
          <h2 style={{ margin: 0, fontSize: 30, fontWeight: 800 }}>
            Қолжетімді курстар
          </h2>
          <p className="section-subtitle">
            Платформадағы бірнеше курсқа шолу
          </p>
        </div>
      </div>

      {loading ? (
        <div className="card-soft" style={{ padding: 20 }}>
          Курстар жүктелуде...
        </div>
      ) : courses.length > 0 ? (
        <div className="grid courses-grid">
          {courses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      ) : (
        <div className="card-soft" style={{ padding: 20 }}>
          Қазір курс жоқ.
        </div>
      )}

      <div className="card-soft" style={{ padding: 28, textAlign: "center" }}>
        <h2 style={{ margin: 0, fontSize: 30, fontWeight: 800 }}>
          Abai№2Edu платформасына қосылыңыз
        </h2>
        <p style={{ marginTop: 12, color: "#64748b" }}>
          Оқу процесін жеңілдетіп, мектептің цифрлық ортасын бір жерден
          басқарыңыз.
        </p>

        <div
          style={{
            marginTop: 18,
            display: "flex",
            justifyContent: "center",
            gap: 12,
            flexWrap: "wrap",
          }}
        >
          {!user ? (
            <>
              <Link to="/login" className="primary-button">
                Кіру
              </Link>
              <Link to="/register" className="secondary-button">
                Тіркелу
              </Link>
            </>
          ) : (
            <Link to="/dashboard" className="primary-button">
              Кабинетке өту
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}

function FeatureCard({ icon, title, text }) {
  return (
    <div
      style={{
        padding: 18,
        borderRadius: 20,
        border: "1px solid #e2e8f0",
        background: "#f8fafc",
      }}
    >
      <div
        style={{
          width: 42,
          height: 42,
          borderRadius: 14,
          display: "grid",
          placeItems: "center",
          background: "#dbeafe",
          color: "#2563eb",
          marginBottom: 12,
        }}
      >
        {icon}
      </div>

      <div style={{ fontSize: 18, fontWeight: 800, color: "#0f172a" }}>
        {title}
      </div>
      <div style={{ marginTop: 8, color: "#64748b", lineHeight: 1.6 }}>
        {text}
      </div>
    </div>
  );
}