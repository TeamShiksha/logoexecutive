import { useState, useEffect } from "react";
import styles from "./TwoFactorAuth.module.css";
import Button from "../common/button/Button";
import { ShieldCheck, QrCode } from "lucide-react";
import { useApi } from "../../hooks/useApi";
import { useToast } from "../../hooks/useToast";

export default function TwoFactorAuth() {
  const [isMFAEnabled, setIsMFAEnabled] = useState(false);
  const [mode, setMode] = useState("INITIAL"); // INITIAL, SETUP, VERIFIED, DISABLE
  const [verificationCode, setVerificationCode] = useState("");
  const [qrData, setQRData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [password, setPassword] = useState("");
  const toast = useToast();

  const { fetchRequest: checkMFARequest } = useApi({
    method: "GET",
    url: "/auth/mfa/status",
  });

  const { fetchRequest: fetchQR } = useApi({
    method: "POST",
    url: "/auth/mfa/enable",
  });

  const { fetchRequest: verifyRequest } = useApi({
    method: "POST",
    url: "/auth/mfa/verify",
  });

  const { fetchRequest: cancelRequest } = useApi({
    method: "POST",
    url: "/auth/mfa/cancel",
  });

  const { fetchRequest: disableRequest } = useApi({
    method: "POST",
    url: "/auth/mfa/disable",
  });

  const handleChange = (e) => {
    setPassword(e.target.value);
  };
  useEffect(() => {
    const checkMFAStatus = async () => {
      setIsLoading(true);
      const { success, data, error } = await checkMFARequest();
      if (success && data?.isMfaEnabled !== undefined) {
        setIsMFAEnabled(data.isMfaEnabled);
        setMode(data.isMfaEnabled ? "VERIFIED" : "INITIAL");
        setIsLoading(false);
      } else {
        setIsMFAEnabled(false);
        setMode("INITIAL");
        toast.error(error);
        setIsLoading(false);
      }
    };
    checkMFAStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleEnableClick = async () => {
    setMode("SETUP");
    setIsLoading(true);
    const { data, success, error } = await fetchQR();
    if (success) {
      setQRData(data.data);
      toast.success("QR code generated successfully");
    } else {
      toast.error(error);
      setMode("INITIAL");
    }
    setIsLoading(false);
  };

  const handleCancelSetup = async () => {
    setMode("INITIAL");
    setVerificationCode("");
    setQRData(null);
    const { success, error } = await cancelRequest();
    if (success) {
      toast.success("2FA setup cancelled");
    } else {
      toast.error(error);
    }
  };

  const handleFinishSetup = async () => {
    if (verificationCode.length !== 6) {
      toast.error("Please enter a valid verification code");
      return;
    }
    setIsLoading(true);
    const { success, error } = await verifyRequest({
      data: { token: verificationCode },
    });
    if (success) {
      setQRData(null);
      setIsMFAEnabled(true);
      setMode("VERIFIED");
      toast.success("2FA enabled successfully");
      setVerificationCode("");
    } else {
      toast.error(error);
    }
    setIsLoading(false);
  };

  const handleDisable = async () => {
    if (password.length === 0) {
      toast.error("Please enter your password");
      return;
    }
    setIsLoading(true);
    const { success, error } = await disableRequest({
      data: {
        password: password,
      },
    });
    if (success) {
      setPassword("");
      setIsMFAEnabled(false);
      setMode("INITIAL");
      toast.success("2FA disabled successfully");
    } else {
      toast.error(error);
    }
    setIsLoading(false);
  };

  const cancelDisableMfa = () => {
    setMode("VERIFIED");
    setPassword("");
  };

  const getStatusText = () => {
    if (isMFAEnabled) return "Active";
    if (mode === "SETUP") return "Setup Required";
    return "Not Configured";
  };

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <div className={styles.headerGroup}>
          <div className={styles.iconBox}>
            <ShieldCheck size={28} />
          </div>
          <div>
            <h2 className={styles.title}>Two-Factor Authentication</h2>
            <p className={styles.description}>
              Add an extra layer of security to your account.
            </p>
          </div>
        </div>
        <span
          className={`${styles.statusBadge} ${isMFAEnabled ? styles.successBadge : styles.pendingBadge}`}
        >
          {getStatusText()}
        </span>
      </div>

      <div className={styles.cardBody}>
        {mode === "INITIAL" && !isMFAEnabled && (
          <div className={styles.initialState}>
            <div className={styles.qrPlaceholderIcon}>
              <QrCode size={48} className={styles.textMuted} />
            </div>
            <h3 className={styles.heading}>Secure your account</h3>
            <p className={styles.subtext}>
              Generate a unique QR code to link your account with an
              authenticator app like Google Authenticator or Authy.
            </p>
            <Button
              variant="primary"
              onClick={handleEnableClick}
              className={styles.actionBtn}
              isLoading={isLoading}
            >
              Generate QR Code
            </Button>
          </div>
        )}

        {mode === "SETUP" && !isMFAEnabled && (
          <div className={styles.setupContent}>
            <div className={styles.setupGrid}>
              {/* Step 1 */}
              <div>
                <h3 className={styles.stepTitle}>Step 1: Scan QR Code</h3>
                <div className={styles.qrContainer}>
                  {qrData && <img src={qrData.qrCode} alt="QR Code" />}
                  {!qrData && (
                    <div className={styles.qrPattern}>
                      <div className={styles.qrInner} />
                    </div>
                  )}
                </div>
                <p className={styles.helperText}>
                  Scan this code using an authenticator app like Google
                  Authenticator or Authy.
                </p>
              </div>

              {/* Step 2 */}
              <div className={styles.stepTwoColumn}>
                {/* Verification Input */}
                <div>
                  <h3 className={styles.stepTitle}>
                    Step 2: Enter Verification Code
                  </h3>
                  <div className={styles.verificationRow}>
                    <input
                      type="text"
                      maxLength={6}
                      value={verificationCode}
                      onChange={(e) =>
                        setVerificationCode(
                          e.target.value.replaceAll(/\D/g, "")
                        )
                      }
                      className={styles.codeInput}
                      placeholder="000000"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {mode === "VERIFIED" && isMFAEnabled && (
          <div className={styles.verifiedState}>
            <div className={styles.successIconWrapper}>
              <ShieldCheck size={64} className={styles.successIcon} />
            </div>
            <h3 className={styles.heading}>2FA is Active</h3>
            <p className={styles.subtext}>
              Your account is secured with two-factor authentication.
            </p>
          </div>
        )}

        {mode === "DISABLE" && isMFAEnabled && (
          <div className={styles.disableCard}>
            <div className={styles.disableContent}>
              <h3 className={styles.heading}>Disable 2FA</h3>
              <p className={styles.subtext}>
                Enter your password to confirm you want to disable 2FA.
              </p>
              <input
                type="password"
                placeholder="Current Password"
                className={styles.disableInput}
                value={password}
                onChange={handleChange}
              />
            </div>
            <Button variant="danger" onClick={handleDisable}>
              Disable
            </Button>
            <Button
              variant="primary"
              className={styles.disableCancelBtn}
              onClick={cancelDisableMfa}
            >
              Cancel
            </Button>
          </div>
        )}
      </div>

      {mode === "SETUP" && !isMFAEnabled && (
        <div className={styles.footer}>
          <Button variant="secondary" onClick={handleCancelSetup}>
            Cancel Setup
          </Button>
          <Button
            variant="primary"
            onClick={handleFinishSetup}
            disabled={isLoading}
          >
            {isLoading ? "Verifying..." : "Finish Configuration"}
          </Button>
        </div>
      )}

      {mode === "VERIFIED" && isMFAEnabled && (
        <div className={styles.footer}>
          <Button
            variant="danger"
            onClick={() => setMode("DISABLE")}
            disabled={isLoading}
          >
            Disable 2FA
          </Button>
        </div>
      )}
    </div>
  );
}
