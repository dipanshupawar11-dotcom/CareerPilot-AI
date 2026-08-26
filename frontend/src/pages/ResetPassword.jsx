import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [message, setMessage] = useState("");
  const [sessionReady, setSessionReady] = useState(false);

  useEffect(() => {
    let mounted = true;

    const checkRecoverySession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();

        if (!mounted) return;

        if (error) {
          setMessage(error.message);
          setSessionReady(false);
          return;
        }

        if (data?.session) {
          setSessionReady(true);
        } else {
          setSessionReady(false);
          setMessage(
            "Reset link is invalid or expired. Please request a new password reset link."
          );
        }
      } catch (error) {
        if (mounted) {
          setMessage(
            "Unable to verify reset session. Please request a new reset link."
          );
        }
      } finally {
        if (mounted) {
          setCheckingSession(false);
        }
      }
    };

    checkRecoverySession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return;

      if (event === "PASSWORD_RECOVERY" && session) {
        setSessionReady(true);
        setMessage("");
        setCheckingSession(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const handleResetPassword = async (e) => {
    e.preventDefault();

    setMessage("");

    if (!sessionReady) {
      setMessage(
        "Your reset session is not active. Please request a new reset link."
      );
      return;
    }

    if (password.length < 6) {
      setMessage("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password,
      });

      if (error) {
        setMessage(error.message);
        return;
      }

      setMessage("Password updated successfully! You can now login.");

      setPassword("");
      setConfirmPassword("");

      setTimeout(async () => {
        await supabase.auth.signOut();
        window.location.href = "/";
      }, 1500);
    } catch (error) {
      setMessage("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (checkingSession) {
    return (
      <div className="login-page">
        <div className="login-card">
          <h1>CareerPilot AI</h1>
          <p className="subtitle">Verifying password reset link...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <h1>CareerPilot AI</h1>

        <p className="subtitle">
          Create your new password
        </p>

        {!sessionReady ? (
          <>
            <p className="message">
              {message ||
                "Reset link is invalid or expired. Please request a new one."}
            </p>

            <button
              type="button"
              onClick={() => {
                window.location.href = "/";
              }}
            >
              Back to Login
            </button>
          </>
        ) : (
          <form onSubmit={handleResetPassword}>
            <input
              type="password"
              placeholder="Enter new password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={6}
              required
            />

            <input
              type="password"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              minLength={6}
              required
            />

            <button type="submit" disabled={loading}>
              {loading ? "Updating..." : "Update Password"}
            </button>
          </form>
        )}

        {message && sessionReady && (
          <p className="message">
            {message}
          </p>
        )}
      </div>
    </div>
  );
}

export default ResetPassword;