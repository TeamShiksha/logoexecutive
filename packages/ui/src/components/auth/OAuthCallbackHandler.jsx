import { useEffect, useContext, useRef } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { instance } from "../../api/api_instance";
import { AuthContext } from "../../contexts/Contexts";
import LoadingSpinner from "../common/loadingspinner/LoadingSpinner";
import { useToast } from "../../hooks/useToast";

const OAuthCallbackHandler = () => {
  const { provider } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { setIsAuthenticated } = useContext(AuthContext);
  const hasProcessed = useRef(false);

  useEffect(() => {
    if (hasProcessed.current) return;
    hasProcessed.current = true;

    const code = searchParams.get("code");
    const state = searchParams.get("state");
    const error = searchParams.get("error");

    if (error) {
      const errorMsg =
        error === "access_denied"
          ? "Google sign-in was cancelled."
          : `OAuth error: ${error}`;
      toast.error(errorMsg);
      navigate("/", { replace: true });
      return;
    }

    if (!code) {
      toast.error("No authorization code found.");
      navigate("/", { replace: true });
      return;
    }

    // Forward callback parameters to backend endpoint
    instance
      .get(`/auth/${provider}/callback`, {
        params: { code, state },
      })
      .then(() => {
        setIsAuthenticated(true);
        window.location.href = "/dashboard";
      })
      .catch((err) => {
        let msg =
          err.response?.data?.message || err.message || "Authentication failed";
        if (msg === "invalid_state") {
          msg = "Security token mismatch. Please try signing in again.";
        } else if (msg === "account_deleted") {
          msg = "This account has been deleted.";
        } else if (msg === "no_email_provided") {
          msg = "No email was provided by your OAuth account.";
        } else if (msg === "oauth_failed" || msg === "ERR_BAD_REQUEST") {
          msg = "Google authentication failed. Please try again.";
        }
        toast.error(msg);
        navigate("/", { replace: true });
      });
  }, [provider, searchParams, navigate, setIsAuthenticated, toast]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "60vh",
        gap: "1rem",
      }}
    >
      <LoadingSpinner size={40} border={4} color="var(--primary)" />
      <p style={{ color: "var(--description)" }}>
        Completing authentication...
      </p>
    </div>
  );
};

export default OAuthCallbackHandler;
