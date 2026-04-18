import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  BookOpen,
  ClipboardList,
  Users,
  LogOut,
  ShieldCheck,
  Menu,
  X,
} from "lucide-react";
import { useAuth } from "../store/AuthContext.jsx";
import { useState } from "react";

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  function handleLogout() {
    logout();
    navigate("/");
  }

  const links = [
    { to: "/dashboard", label: "Басқару панелі", icon: LayoutDashboard },
    { to: "/courses", label: "Курстар", icon: BookOpen },
    {
      to: "/manage-courses",
      label: "Курстарды басқару",
      icon: BookOpen,
      roles: ["ADMIN", "TEACHER"],
    },
    {
      to: "/grade-submissions",
      label: "Бағалау",
      icon: ClipboardList,
      roles: ["ADMIN", "TEACHER"],
    },
    {
      to: "/my-submissions",
      label: "Менің жауаптарым",
      icon: ClipboardList,
      roles: ["STUDENT"],
    },
    {
      to: "/director-tasks",
      label:
        user?.role === "ADMIN"
          ? "Директор тапсырмалары"
          : "Директордан келген тапсырмалар",
      icon: ClipboardList,
      roles: ["ADMIN", "TEACHER"],
    },
    {
      to: "/admin",
      label: "Admin панель",
      icon: Users,
      roles: ["ADMIN"],
    },
  ];

  const visibleLinks = links.filter(
    (item) => !item.roles || item.roles.includes(user?.role)
  );

  const roleLabel =
    user?.role === "ADMIN"
      ? "Директор"
      : user?.role === "TEACHER"
      ? "Мұғалім"
      : "Оқушы";

  return (
    <div className="app-shell">
      <button
        className="mobile-menu-button"
        onClick={() => setMobileOpen(true)}
        type="button"
        aria-label="Мәзірді ашу"
      >
        <Menu size={22} />
      </button>

      {mobileOpen && (
        <div
          className="mobile-overlay"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside className={`sidebar ${mobileOpen ? "sidebar-open" : ""}`}>
        <div className="sidebar-top">
          <div className="brand">
            <div className="brand-icon">
              <ShieldCheck size={22} />
            </div>
            <div>
              <div className="brand-title">Abai№2Edu</div>
              <div className="brand-subtitle">Мектеп LMS жүйесі</div>
            </div>
          </div>

          <button
            className="mobile-close-button"
            onClick={() => setMobileOpen(false)}
            type="button"
            aria-label="Мәзірді жабу"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="sidebar-nav">
          {visibleLinks.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `sidebar-link${isActive ? " active" : ""}`
                }
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="sidebar-footer card-soft">
          <div className="user-chip">
            <div className="avatar">
              {user?.fullName?.charAt(0)?.toUpperCase() || "U"}
            </div>
            <div>
              <div className="user-name">{user?.fullName || "Пайдаланушы"}</div>
              <div className="user-role">{roleLabel}</div>
            </div>
          </div>

          <button className="danger-button full" onClick={handleLogout}>
            <LogOut size={16} />
            Шығу
          </button>
        </div>
      </aside>

      <section className="content-shell">
        <header className="topbar">
          <div>
            <div className="topbar-title">
              Қош келдіңіз, {user?.fullName || "Пайдаланушы"}
            </div>
            <div className="topbar-subtitle">
              Оқу процесін бір жерден басқарыңыз
            </div>
          </div>

          <div className="topbar-pill">{roleLabel}</div>
        </header>

        <main className="content-body">
          <div className="page-container">
            <Outlet />
          </div>
        </main>
      </section>
    </div>
  );
}