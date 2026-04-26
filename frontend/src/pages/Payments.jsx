import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import EntityPage from "../components/EntityPage";
import Table from "../components/Table";
import { createRecord, fetchCollection, getErrorMessage } from "../services/authApi";

const paymentColumns = [
  { header: "ID", accessor: "payment_id" },
  { header: "Student", accessor: "full_name" },
  { header: "Amount", accessor: "amount" },
  {
    header: "Status",
    accessor: "payment_status",
    render: (value) => <span className={`badge badge-${value?.toLowerCase()}`}>{value}</span>,
  },
  { header: "Date", accessor: "payment_date" },
  { header: "Risk", accessor: "student_payment_risk" },
];

const Payments = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [formState, setFormState] = useState({
    booking_id: "",
    amount: "",
    payment_date: "",
    payment_status: "SUCCESS",
  });
  const [submitMessage, setSubmitMessage] = useState("");
  const [submitError, setSubmitError] = useState("");

  const isFormOpen = searchParams.get("action") === "new";

  useEffect(() => {
    let isMounted = true;

    const loadPayments = async () => {
      try {
        const data = await fetchCollection("/payments");
        if (!isMounted) return;
        setPayments(data);
        setError("");
      } catch (err) {
        if (!isMounted) return;
        setPayments([]);
        setError(getErrorMessage(err, "Unable to load payments."));
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadPayments();

    return () => {
      isMounted = false;
    };
  }, []);

  const openForm = () => {
    setSearchParams({ action: "new" });
    setSubmitMessage("");
    setSubmitError("");
  };

  const closeForm = () => {
    setSearchParams({});
    setSubmitError("");
  };

  const handleChange = ({ target: { name, value } }) => {
    setFormState((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      await createRecord("/payments", {
        ...formState,
        booking_id: Number(formState.booking_id),
        amount: Number(formState.amount),
      });

      const data = await fetchCollection("/payments");
      setPayments(data);
      setFormState({
        booking_id: "",
        amount: "",
        payment_date: "",
        payment_status: "SUCCESS",
      });
      setSubmitError("");
      setSubmitMessage("Payment saved successfully.");
      setSearchParams({});
    } catch (err) {
      setSubmitMessage("");
      setSubmitError(getErrorMessage(err, "Unable to save payment."));
    }
  };

  if (loading) {
    return <p className="loading">Loading payments...</p>;
  }

  return (
    <EntityPage
      title="Payments"
      description="Record transactions and keep payment status updated against bookings."
      actionLabel="New Payment"
      isFormOpen={isFormOpen}
      onOpenForm={openForm}
      onCloseForm={closeForm}
      formTitle="Add payment"
      formDescription="Enter booking, amount, payment date, and settlement status."
      message={submitError || error || submitMessage}
      messageType={submitError || error ? "error" : "success"}
      formContent={
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="booking_id">
                Booking ID
              </label>
              <input
                id="booking_id"
                name="booking_id"
                type="number"
                min="1"
                className="form-input"
                value={formState.booking_id}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="amount">
                Amount
              </label>
              <input
                id="amount"
                name="amount"
                type="number"
                min="0"
                step="0.01"
                className="form-input"
                value={formState.amount}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="payment_status">
                Status
              </label>
              <select
                id="payment_status"
                name="payment_status"
                className="form-select"
                value={formState.payment_status}
                onChange={handleChange}
              >
                <option value="SUCCESS">Success</option>
                <option value="PENDING">Pending</option>
                <option value="FAILED">Failed</option>
                <option value="REFUNDED">Refunded</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="payment_date">
                Payment Date
              </label>
              <input
                id="payment_date"
                name="payment_date"
                type="date"
                className="form-input"
                value={formState.payment_date}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          <div className="form-actions">
            <button type="submit" className="btn btn-primary">
              Save Payment
            </button>
          </div>
        </form>
      }
    >
      <div className="section-heading">
        <h2 className="card-title">Payment list</h2>
      </div>
      <Table columns={paymentColumns} data={payments} />
    </EntityPage>
  );
};

export default Payments;
