import { useCallback, useEffect, useState } from "react";
import { fetchCollection, getProfile } from "../services/authApi";

function useStudentData() {
  const [data, setData] = useState({
    profile: null,
    bookings: [],
    complaints: [],
    payments: [],
    outings: [],
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const profileRes = await getProfile();

      const [bookings, complaints, payments, outings] = await Promise.all([
        fetchCollection("/bookings"),
        fetchCollection("/complaints"),
        fetchCollection("/payments"),
        fetchCollection("/outings"),
      ]);

      setData({
        profile: profileRes?.data || profileRes,
        bookings: bookings || [],
        complaints: complaints || [],
        payments: payments || [],
        outings: outings || [],
      });
    } catch (err) {
      console.error(err);
      setError("Failed to load student data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { data, loading, error, refresh: load };
}

export default useStudentData;