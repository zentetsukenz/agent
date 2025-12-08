import { useState, useEffect } from "react";
import { endpointsAPI } from "../services/endpoints";

export const useEndpoints = () => {
  const [endpoints, setEndpoints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchEndpoints = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await endpointsAPI.getAll();
      setEndpoints(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEndpoints();
  }, []);

  return { endpoints, loading, error, refetch: fetchEndpoints };
};
