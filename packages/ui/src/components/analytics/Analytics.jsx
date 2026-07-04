import AnalyticsCard from "./AnalyticsCard";
import styles from "./Analytics.module.css";
import { useEffect } from "react";
import { useApi } from "../../hooks/useApi";
import { useToast } from "../../hooks/useToast";
import LoadingSpinner from "../common/loadingspinner/LoadingSpinner";

function Analytics() {
  const toast = useToast();
  const { makeRequest, data, errorMsg, loading } = useApi({
    method: "GET",
    url: "/catalog/stats",
  });
  const stats = data?.data || [];

  useEffect(() => {
    if (errorMsg) {
      toast.error(errorMsg);
    }
  }, [errorMsg, toast]);

  useEffect(() => {
    makeRequest();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className={styles.analytics} data-testid="analytics">
      {loading && (
        <div className={styles["analytics-loader"]}>
          <LoadingSpinner color="blue" size={40} border={4} />
        </div>
      )}
      {!loading &&
        stats.map((item) => (
          <AnalyticsCard key={item.title} title={item.title} api={item.value} />
        ))}
    </div>
  );
}

export default Analytics;
