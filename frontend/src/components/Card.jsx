import "./Card.css";

function Card({ title, value, subtitle, color = "default" }) {
  return (
    <div className={`stat-card stat-card-${color}`}>
      <div className="stat-card-header">
        <span className="stat-card-title">{title}</span>
        <div className={`stat-card-indicator indicator-${color}`}></div>
      </div>
      <div className="stat-card-body">
        <h3 className="stat-card-value">{value}</h3>
        {subtitle && <p className="stat-card-subtitle">{subtitle}</p>}
      </div>
    </div>
  );
}

export default Card;
