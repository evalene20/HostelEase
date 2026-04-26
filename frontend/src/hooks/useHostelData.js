import { useCallback, useEffect, useState } from "react";
import { fetchCollection, getErrorMessage } from "../services/api";

const endpointMap = {
  students: "/students",
  rooms: "/rooms",
  bookings: "/bookings",
  complaints: "/complaints",
  payments: "/payments",
  staff: "/staff",
  mess: "/mess",
};

function useHostelData(keys = Object.keys(endpointMap)) {
  const dependencyKey = keys.join("|");
  const [data, setData] = useState(() =>
    keys.reduce((accumulator, key) => ({ ...accumulator, [key]: [] }), {})
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);

    try {
      const entries = await Promise.all(
        keys.map(async (key) => [key, await fetchCollection(endpointMap[key])])
      );

      setData(Object.fromEntries(entries));
      setError("");
    } catch (err) {
      setError(getErrorMessage(err, "Unable to load dashboard data."));
    } finally {
      setLoading(false);
    }
  }, [dependencyKey]);

  useEffect(() => {
    let isMounted = true;

    const loadSafely = async () => {
      setLoading(true);

      try {
        const entries = await Promise.all(
          keys.map(async (key) => [key, await fetchCollection(endpointMap[key])])
        );

        if (!isMounted) return;

        setData(Object.fromEntries(entries));
        setError("");
      } catch (err) {
        if (!isMounted) return;
        setError(getErrorMessage(err, "Unable to load dashboard data."));
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadSafely();

    return () => {
      isMounted = false;
    };
  }, [dependencyKey]);

  return { data, loading, error, refresh: load };
}

export default useHostelData;
