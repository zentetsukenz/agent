import { useState, useEffect, useCallback } from "react";
import { testsAPI } from "../services/tests";
import { TEST_STATUS, POLL_INTERVAL } from "../utils/constants";

export const useTestStatus = (testId) => {
  const [test, setTest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTestStatus = useCallback(async () => {
    if (!testId) return;

    try {
      const data = await testsAPI.getStatus(testId);
      setTest(data);
      setError(null);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [testId]);

  useEffect(() => {
    if (!testId) return;

    fetchTestStatus();

    // Poll while test is pending or running
    const interval = setInterval(async () => {
      const data = await fetchTestStatus();
      if (
        data &&
        data.status !== TEST_STATUS.PENDING &&
        data.status !== TEST_STATUS.RUNNING
      ) {
        clearInterval(interval);
      }
    }, POLL_INTERVAL);

    return () => clearInterval(interval);
  }, [testId, fetchTestStatus]);

  return { test, loading, error, refetch: fetchTestStatus };
};
