import { useState, useCallback, useRef } from "react";
import { instance } from "../api/api_instance.js";

/**
 * Custom React hook to make API requests using axios.
 *
 * @param {import("axios").AxiosRequestConfig} config - The axios request configuration.
 *
 * @returns - Contains the response data, a function to set the data, the error message if any, the loading state, and a function to make the request.
 */

export const useApi = (config) => {
  const configRef = useRef(config);
  configRef.current = config;

  const [data, setData] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const makeRequest = useCallback(async (dynamicConfig = {}) => {
    setErrorMsg(null);
    setIsSuccess(false);
    setLoading(true);

    const finalConfig = { ...configRef.current, ...dynamicConfig };
    let success = false;
    try {
      const response = await instance(finalConfig);
      setData(response.data);
      setIsSuccess(true);
      success = true;
    } catch (err) {
      setIsSuccess(false);
      setData(err?.response?.data || null);
      if (err?.response?.data?.message) {
        setErrorMsg(err?.response?.data?.message);
      } else {
        setErrorMsg(err?.message || "Network error");
      }
    } finally {
      setLoading(false);
    }
    return success;
  }, []);

  const fetchRequest = useCallback(async (dynamicConfig = {}) => {
    setErrorMsg(null);
    setIsSuccess(false);
    setLoading(true);

    const finalConfig = { ...configRef.current, ...dynamicConfig };
    try {
      const response = await instance(finalConfig);
      setData(response.data);
      setIsSuccess(true);

      return {
        success: true,
        data: response.data,
        error: null,
      };
    } catch (err) {
      setIsSuccess(false);
      setData(err?.response?.data || null);
      const msg =
        err?.response?.data?.message || err?.message || "Network error";
      setErrorMsg(msg);
      return { success: false, data: null, error: msg };
    } finally {
      setLoading(false);
    }
  }, []);
  return {
    data,
    setData,
    errorMsg,
    loading,
    setLoading,
    makeRequest,
    fetchRequest,
    isSuccess,
    setIsSuccess,
    setErrorMsg,
  };
};
