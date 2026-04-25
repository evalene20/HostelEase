import "./Card.css";

function Card({ title, value, subtitle, icon, color = "default" }) {
  const colorClasses = {
    default: "",
    primary: "card-primary",
    success: "card-success",
    warning: "card-warning",
    danger: "card-danger",
    info: "card-info",
  };

  return (
    <div className={`card stat-card ${colorClasses[color] || ""}`}>
      <div className="card-content">
        {icon && <span className="card-icon">{icon}</span>}
        <div className="stat-card-info">
          <div className="card-value">{value}</div>
          <div className="card-title">{title}</div>
          {subtitle && <div className="card-subtitle">{subtitle}</div>}
        </div>
      </div>
    </div>
  );
}

export default Card;
