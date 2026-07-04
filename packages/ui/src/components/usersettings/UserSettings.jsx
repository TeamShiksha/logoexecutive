import { useContext, useState } from "react";
import styles from "./UserSettings.module.css";
import { Shield, User, MonitorSmartphone } from "lucide-react";
import TwoFactorAuth from "../twofactorauth/TwoFactorAuth";
import ProfileInfo from "../profileinfo/ProfileInfo";
import DeviceSessionCard from "../devicesession/DeviceSessionCard";
import { UserContext } from "../../contexts/Contexts";

function headerCopy(activeTab) {
  switch (activeTab) {
    case "profile":
      return {
        title: "Profile Info",
        subtitle:
          "Manage your personal details and account security preferences.",
      };
    case "sessions":
      return {
        title: "Active Sessions",
        subtitle:
          "View devices where you're signed in and revoke access you don't recognize.",
      };
    case "2fa":
    default:
      return {
        title: "Security Settings",
        subtitle: "Manage your account security and two-factor authentication.",
      };
  }
}

export default function UserSettings() {
  const [activeTab, setActiveTab] = useState("profile");
  const { userData } = useContext(UserContext);
  const isGuest = userData?.role === "GUEST";

  const menuItems = [
    { id: "profile", label: "Profile Info", icon: <User size={20} /> },
    { id: "2fa", label: "2FA Settings", icon: <Shield size={20} /> },
    {
      id: "sessions",
      label: "Sessions",
      icon: <MonitorSmartphone size={20} />,
    },
  ];

  const { title: headerTitle, subtitle: headerSubtitle } =
    headerCopy(activeTab);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.title}>
          <h1>{headerTitle}</h1>
          <p>{headerSubtitle}</p>
        </div>
      </div>

      <div className={styles.grid}>
        {/* Sidebar */}
        <aside className={styles.sidebar}>
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`${styles.navItem} ${
                activeTab === item.id ? styles.navItemActive : ""
              }`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </aside>

        {/* Content Area */}
        <div className={styles.content}>
          {activeTab === "profile" && <ProfileInfo />}
          {activeTab === "2fa" && <TwoFactorAuth />}
          {activeTab === "sessions" && (
            <div className={styles.card}>
              <div className={styles.cardBody}>
                <DeviceSessionCard isGuest={isGuest} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
