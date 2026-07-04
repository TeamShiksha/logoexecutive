import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { useState, useEffect, useMemo, useContext } from "react";
import PropTypes from "prop-types";
import styles from "./Graph.module.css";
import { useApi } from "../../hooks/useApi";
import { ThemeContext } from "../../contexts/Contexts";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const getBaseOptions = (isDarkMode) => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    title: { display: false },
    tooltip: {
      backgroundColor: isDarkMode ? "rgb(31, 41, 55)" : "rgb(255, 255, 255)",
      titleColor: isDarkMode ? "rgb(255, 255, 255)" : "rgb(17, 24, 39)",
      bodyColor: isDarkMode ? "rgb(209, 213, 219)" : "rgb(75, 85, 99)",
      borderColor: isDarkMode
        ? "rgba(75, 85, 99, 0.3)"
        : "rgb(177, 179, 183, 0.3)",
      borderWidth: 1,
      padding: 12,
      displayColors: false,
      callbacks: {
        title: function (context) {
          return context[0].label;
        },
        label: function (context) {
          return `Requests: ${context.parsed.y}`;
        },
      },
    },
  },
  scales: {
    x: {
      offset: true,
      align: "center",
      grid: {
        color: isDarkMode
          ? "rgba(75, 85, 99, 0.1)"
          : "rgba(177, 179, 183, 0.1)",
        drawBorder: true,
        lineWidth: 1,
      },
      ticks: {
        color: isDarkMode ? "rgb(156, 163, 175)" : "rgb(107, 114, 128)",
        font: {
          size: 11,
        },
      },
    },
    y: {
      grid: {
        color: isDarkMode ? "rgba(75, 85, 99, 0.1)" : "rgba(243, 244, 246, 1)",
        drawBorder: false,
      },
      ticks: {
        color: isDarkMode ? "rgb(156, 163, 175)" : "rgb(156, 163, 175)",
        font: {
          size: 11,
        },
      },
    },
  },
  elements: {
    point: {
      pointOffset: 0,
    },
  },
});

function generateDummyData(period) {
  const days = period === "week" ? 7 : 30;
  const today = new Date();
  const labels = [];
  const counts = [];
  const weekSeed = [4, 7, 3, 12, 9, 15, 6];
  const monthSeed = [
    2, 5, 3, 8, 6, 11, 9, 4, 7, 13, 10, 8, 15, 12, 6, 9, 11, 7, 14, 10, 5, 8,
    12, 9, 6, 11, 8, 13, 10, 7,
  ];
  const seed = period === "week" ? weekSeed : monthSeed;
  for (let offset = days - 1; offset >= 0; offset--) {
    const date = new Date(today);
    date.setDate(date.getDate() - offset);
    labels.push(
      new Intl.DateTimeFormat("en-GB", {
        day: "2-digit",
        month: "short",
      }).format(date)
    );
    counts.push(seed[days - 1 - offset] ?? 0);
  }
  return [labels, counts];
}

function parseStatsDataForPeriod(apiData) {
  const data = apiData?.data;
  if (!Array.isArray(data) || !apiData.startDate || !apiData.endDate) {
    return [[], []];
  }

  const startTime = Date.parse(apiData.startDate);
  const endTime = Date.parse(apiData.endDate);

  if (Number.isNaN(startTime) || Number.isNaN(endTime)) {
    return [[], []];
  }

  const dateRange = [];
  const dayInMs = 24 * 60 * 60 * 1000;
  for (let time = startTime; time <= endTime; time += dayInMs) {
    dateRange.push(new Date(time));
  }

  const dateToCount = new Map();
  data.forEach((item) => {
    if (item?.date && item.count !== undefined) {
      const key = item.date.split("T")[0];
      dateToCount.set(key, Number(item.count) || 0);
    }
  });

  const labels = [];
  const counts = [];

  dateRange.forEach((date) => {
    const key = date.toISOString().split("T")[0];
    const count = dateToCount.get(key) || 0;

    const label = new Intl.DateTimeFormat("en-GB", {
      day: "2-digit",
      month: "short",
      timeZone: "UTC",
    }).format(date);

    labels.push(label);
    counts.push(count);
  });

  return [labels, counts];
}

function niceStep(maxValue, targetTicks = 10) {
  if (maxValue <= 0) {
    return 1;
  }

  const roughStep = Math.ceil(maxValue / targetTicks);
  const powerOfTen = Math.pow(10, Math.floor(Math.log10(roughStep)));
  const normalized = Math.ceil(roughStep / powerOfTen);

  let rounded;

  if (normalized <= 1) {
    rounded = 1;
  } else if (normalized <= 2) {
    rounded = 2;
  } else if (normalized <= 5) {
    rounded = 5;
  } else {
    rounded = 10;
  }

  return rounded * powerOfTen;
}

export default function Graph({ isGuest = false }) {
  const { isDarkMode } = useContext(ThemeContext);
  const [selectedPeriod, setSelectedPeriod] = useState("week");
  const [chartData, setChartData] = useState({
    labels: [],
    dataPoints: [],
  });
  const [cachedWeekData, setCachedWeekData] = useState(null);
  const [cachedMonthData, setCachedMonthData] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const {
    fetchRequest: fetchWeekData,
    data: weekResponse,
    errorMsg: weekError,
    isSuccess: weekLoaded,
  } = useApi({
    method: "get",
    url: "/logo-requests/stats?period=week",
  });

  const {
    fetchRequest: fetchMonthData,
    data: monthResponse,
    errorMsg: monthError,
    isSuccess: monthLoaded,
  } = useApi({
    method: "get",
    url: "/logo-requests/stats?period=month",
  });

  useEffect(() => {
    if (isGuest) {
      const [labels, counts] = generateDummyData(selectedPeriod);
      setChartData({ labels, dataPoints: counts });
    }
  }, [isGuest, selectedPeriod]);

  useEffect(() => {
    if (isGuest) {
      return;
    }

    fetchWeekData();
    fetchMonthData();
  }, [isGuest, fetchWeekData, fetchMonthData]);

  useEffect(() => {
    if (weekLoaded && weekResponse) {
      setCachedWeekData(weekResponse);
    }
  }, [weekLoaded, weekResponse]);

  useEffect(() => {
    if (monthLoaded && monthResponse) {
      setCachedMonthData(monthResponse);
    }
  }, [monthLoaded, monthResponse]);

  useEffect(() => {
    const currentCache =
      selectedPeriod === "week" ? cachedWeekData : cachedMonthData;

    if (currentCache?.data?.data) {
      const [labels, counts] = parseStatsDataForPeriod(currentCache.data);
      setChartData({ labels, dataPoints: counts });
    }
  }, [selectedPeriod, cachedWeekData, cachedMonthData]);

  const { yMax, step } = useMemo(() => {
    const values = chartData.dataPoints;
    const max = values.length ? Math.max(...values) : 0;

    if (max <= 10) {
      return { yMax: 15, step: 3 };
    }

    const stepSize = niceStep(max, 10);
    const adjustedMax = Math.ceil(max / stepSize) * stepSize + 10;

    return { yMax: adjustedMax, step: stepSize };
  }, [chartData]);

  const options = useMemo(() => {
    const maxTicks = Math.min(100, Math.ceil(yMax / step) + 1);
    const baseOptions = getBaseOptions(isDarkMode);

    return {
      ...baseOptions,
      scales: {
        ...baseOptions.scales,
        x: {
          ...baseOptions.scales.x,
          type: "category",
          offset: false,
          align: "center",
          ticks: {
            ...baseOptions.scales.x.ticks,
          },
        },
        y: {
          ...baseOptions.scales.y,
          beginAtZero: true,
          min: 0,
          max: yMax,
          ticks: {
            ...baseOptions.scales.y.ticks,
            stepSize: step,
            autoSkip: false,
            maxTicksLimit: maxTicks,
          },
        },
      },
    };
  }, [yMax, step, isDarkMode]);

  const dataConfig = useMemo(
    () => ({
      labels: chartData.labels,
      datasets: [
        {
          label: "Requests",
          data: chartData.dataPoints,
          borderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6,
          pointBackgroundColor: "#ffffff",
          pointBorderColor: "#4f46e5",
          pointBorderWidth: 2,
          pointHoverBackgroundColor: "#ffffff",
          pointHoverBorderColor: "#4f46e5",
          tension: 0.4,
          borderColor: "#818cf8",
          spanGaps: true,
          fill: false,
          clip: false,
          pointHitRadius: 10,
          pointOffset: 0,
        },
      ],
    }),
    [chartData]
  );

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([fetchWeekData(), fetchMonthData()]);
    setIsRefreshing(false);
  };

  const error = selectedPeriod === "week" ? weekError : monthError;
  if (error) {
    return <div className={styles["error"]}>Error loading chart data</div>;
  }

  const isLoading = !isGuest && !cachedWeekData && !cachedMonthData;

  return (
    <div className={styles["graph-container"]}>
      <div className={styles["card-header"]}>
        <h2 className={styles["card-title"]}>Requests</h2>
        <button
          className={styles["refresh-btn"]}
          onClick={isGuest ? undefined : handleRefresh}
          disabled={isRefreshing || isGuest}
          aria-label={isGuest ? "Sign up to refresh data" : "Refresh"}
          title={isGuest ? "Sign up to refresh live data" : undefined}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M23 4v6h-6"></path>
            <path d="M1 20v-6h6"></path>
            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
          </svg>
        </button>
      </div>

      <div className={styles["chart-wrapper"]}>
        {isLoading ? (
          <div className={styles["loading"]}>Loading...</div>
        ) : (
          chartData.labels.length > 0 && (
            <Line
              key={`${selectedPeriod}-${yMax}-${step}`}
              data={dataConfig}
              options={options}
            />
          )
        )}
      </div>

      <div className={styles["chart-controls"]}>
        <div className={styles["segment-control"]}>
          <button
            className={`${styles["segment-btn"]} ${
              selectedPeriod === "month" ? styles["segment-btn-active"] : ""
            }`}
            onClick={() => setSelectedPeriod("month")}
          >
            Month
          </button>
          <button
            className={`${styles["segment-btn"]} ${
              selectedPeriod === "week" ? styles["segment-btn-active"] : ""
            }`}
            onClick={() => setSelectedPeriod("week")}
          >
            Week
          </button>
        </div>
      </div>
    </div>
  );
}

Graph.propTypes = {
  isGuest: PropTypes.bool,
};
