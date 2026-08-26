import PropTypes from "prop-types";
import { useState, useMemo, useCallback } from "react";
import { instance } from "../api/api_instance";
import { UserContext } from "./Contexts";
import { useToast } from "../hooks/useToast";
import { getErrorMessage } from "../utils/Helpers";

export function UserProvider({ children }) {
  const toast = useToast();
  const [userData, setUserData] = useState();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState();

  const fetchUserData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await instance.get("user/me");
      const data = res.data.data;
      setUserData(data);
    } catch (err) {
      console.error("Failed to fetch user data:", err);
      setError(err);
      toast.error(getErrorMessage(err, "Failed to load your profile"));
    } finally {
      setLoading(false);
    }
  }, [setError, setLoading, toast]);

  return (
    <UserContext.Provider
      value={useMemo(
        () => ({
          userData,
          loading,
          error,
          fetchUserData,
          setUserData,
        }),
        [userData, loading, error, fetchUserData]
      )}
    >
      {children}
    </UserContext.Provider>
  );
}

UserProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
