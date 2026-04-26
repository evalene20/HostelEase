import { useMemo } from "react";
import useStudentData from "../../hooks/useStudentData";
import { formatCurrency } from "../../utils/dashboardInsights";

function StudentPayments() {
  const { data, loading, error } = useStudentData();

  const payments = useMemo(
    () => data.payments || [],
    [data.payments]
  );

  if (loading) {
    return <p className="loading">Loading payments...</p>;
  }

  const totalFees = 18000;
  const paidAmount = payments
    .filter((payment) => payment.payment_status === "SUCCESS")
    .reduce((sum, payment) => sum + Number(payment.amount || 0), 0);
  const dueAmount = Math.max(totalFees - paidAmount, 0);
  const paymentRisk = payments.some((payment) => payment.payment_status === "FAILED")
    ? "High payment risk due to failed transactions."
    : dueAmount > 0
      ? "Payment due in 3 days."
      : "No immediate payment risk.";

  return (
    <div className="page-shell">
      <section className="page-header-card">
        <div>
          <p className="eyebrow">Payments</p>
          <h1 className="page-title">Fees, history, and due alerts</h1>
          <p className="page-description">
            Review your fee summary, payment history, status, and risk warnings.
          </p>
        </div>
      </section>
      {error ? <div className="message message-error">{error}</div> : null}

      <div className="stats-grid">
        <div className="card"><strong>Total fees</strong><p>{formatCurrency(totalFees)}</p></div>
        <div className="card"><strong>Paid</strong><p>{formatCurrency(paidAmount)}</p></div>
        <div className="card"><strong>Due</strong><p>{formatCurrency(dueAmount)}</p></div>
      </div>

      <section className="card">
        <div className="card-header"><h2 className="card-title">Payment alerts</h2></div>
        <div className="list-row">{paymentRisk}</div>
      </section>

      <section className="card">
        <div className="card-header"><h2 className="card-title">Payment history</h2></div>
        <div className="list-stack">
          {payments.length ? payments.map((payment) => (
            <div key={payment.payment_id} className="list-row">
              {payment.payment_date} / {formatCurrency(payment.amount)} / {payment.payment_status}
            </div>
          )) : <div className="table-empty">No payments available.</div>}
        </div>
      </section>
    </div>
  );
}

export default StudentPayments;
