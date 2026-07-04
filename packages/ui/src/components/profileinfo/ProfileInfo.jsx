import { useContext } from "react";
import styles from "./ProfileInfo.module.css";
import UserInfo from "../userinfo/UserInfo";
import ChangePassword from "../changepassword/ChangePassword";
import SettingCard from "../settings/SettingCard";
import CurrentPlan from "../currentplan/CurrentPlan";
import { UserContext } from "../../contexts/Contexts";

export default function ProfileInfo() {
  const { userData } = useContext(UserContext);
  const isGuest = userData?.role === "GUEST";

  return (
    <div className={styles.container}>
      <div className={styles.grid}>
        <div className={styles.card}>
          <h2 className={styles.heading}>User Info</h2>
          {userData && (
            <UserInfo
              name={userData.name}
              email={userData.email}
              isGuest={isGuest}
            />
          )}
        </div>

        <div className={styles.card}>
          <h2 className={styles.heading}>Change Password</h2>
          <div className={styles.section}>
            <ChangePassword isGuest={isGuest} />
          </div>
        </div>

        <div className={styles.card}>
          <h2 className={styles.heading}>Plan</h2>
          <CurrentPlan isGuest={isGuest} />
        </div>

        <div className={styles.card}>
          <h2 className={styles.heading}>Data Management</h2>
          <div className={styles.section}>
            <SettingCard isGuest={isGuest} />
          </div>
        </div>
      </div>
    </div>
  );
}
