import "./Table.css";

function Table({ columns, data, emptyMessage = "No records found" }) {
  if (!data || data.length === 0) {
    return (
      <div className="table-empty-state">
        <p>{emptyMessage}</p>
      </div>
    );
  }

  const renderCell = (col, row) => {
    const value = row[col.accessor];
    
    if (col.render) {
      return col.render(value, row);
    }

    // Auto-badge for common status/risk patterns
    if (col.accessor.includes('status') || col.accessor.includes('risk') || col.accessor.includes('priority')) {
      const val = String(value).toUpperCase();
      let badgeClass = 'badge-info';
      
      if (['APPROVED', 'SUCCESS', 'LOW', 'RESOLVED', 'AVAILABLE'].includes(val)) badgeClass = 'badge-success';
      if (['REQUESTED', 'PENDING', 'MEDIUM', 'IN_PROGRESS', 'ALMOST FULL'].includes(val)) badgeClass = 'badge-warning';
      if (['REJECTED', 'FAILED', 'HIGH', 'CANCELLED', 'OVERCROWDED'].includes(val)) badgeClass = 'badge-danger';
      
      return <span className={`badge ${badgeClass}`}>{value}</span>;
    }

    return value;
  };

  return (
    <div className="table-wrapper">
      <table className="modern-table">
        <thead>
          <tr>
            {columns.map((col, index) => (
              <th key={index}>{col.header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => (
            <tr key={row.id || rowIndex}>
              {columns.map((col, colIndex) => (
                <td key={colIndex}>
                  {renderCell(col, row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Table;
