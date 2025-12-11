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
      const response = await endpointsAPI.getAll();
      setEndpoints(response.data || []);
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
