import { Link } from "react-router-dom";
import { BookOpen } from "lucide-react";

export default function CourseCard({ course, onEnroll, enrolling }) {
  if (!course) return null;

  return (
    <div className="course-card card-soft">
      <div className="course-cover" />

      <div className="course-content">
        <div className="course-meta">
          <BookOpen size={16} />
          <span>{course.category || "Жалпы пән"}</span>
        </div>

        <h3>{course.title || "Атаусыз курс"}</h3>

        <p>{course.description || "Сипаттама жоқ"}</p>

        <div className="course-actions">
          <Link className="primary-button" to={`/courses/${course.id}`}>
            Ашу
          </Link>

          {onEnroll && (
            <button
              type="button"
              className="secondary-button"
              onClick={() => onEnroll(course.id)}
              disabled={enrolling}
            >
              {enrolling ? "Тіркелуде..." : "Тіркелу"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}