function EntityPage({
  title,
  description,
  actionLabel,
  isFormOpen,
  onOpenForm,
  onCloseForm,
  formTitle,
  formDescription,
  message,
  messageType = "success",
  formContent,
  children,
}) {
  return (
    <div className="page-shell">
      <section className="page-header-card">
        <div>
          <p className="eyebrow">Management</p>
          <h1 className="page-title">{title}</h1>
          <p className="page-description">{description}</p>
        </div>
        <button type="button" className="btn btn-primary btn-small" onClick={onOpenForm}>
          {actionLabel}
        </button>
      </section>

      {message ? (
        <div className={`message message-${messageType}`}>{message}</div>
      ) : null}

      {isFormOpen ? (
        <section className="card form-panel">
          <div className="card-header">
            <div>
              <h2 className="card-title">{formTitle}</h2>
              {formDescription ? (
                <p className="section-description">{formDescription}</p>
              ) : null}
            </div>
            <button type="button" className="btn btn-secondary" onClick={onCloseForm}>
              Close
            </button>
          </div>
          {formContent}
        </section>
      ) : null}

      <section className="card">{children}</section>
    </div>
  );
}

export default EntityPage;
