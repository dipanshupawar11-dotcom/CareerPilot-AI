import { useState } from "react";
import { supabase } from "../lib/supabase";

function Login() {
  const [isSignup, setIsSignup] = useState(false);
  const [showOtp, setShowOtp] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // =========================
  // CREATE ACCOUNT / LOGIN
  // =========================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setMessage("");

    try {
      // =========================
      // SIGN UP
      // =========================

      if (isSignup) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });

        if (error) {
          setMessage(error.message);
          return;
        }

        // Email confirmation required
        if (data.user && !data.session) {
          setShowOtp(true);

          setMessage(
            "Verification code sent to your email. Please enter the OTP."
          );
        } else {
          setMessage("Account created successfully!");

          setIsSignup(false);
        }

        return;
      }

      // =========================
      // LOGIN
      // =========================

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setMessage(error.message);
        return;
      }

      setMessage("Login successful!");

      // Go to dashboard
      setTimeout(() => {
        window.location.href = "/dashboard";
      }, 500);
    } catch (error) {
      setMessage("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // VERIFY OTP
  // =========================

  const handleVerifyOtp = async (e) => {
    e.preventDefault();

    setLoading(true);
    setMessage("");

    try {
      const { error } = await supabase.auth.verifyOtp({
        email,
        token: otp,
        type: "email",
      });

      if (error) {
        setMessage(error.message);
        return;
      }

      setMessage(
        "Email verified successfully! Account created."
      );

      setShowOtp(false);
      setIsSignup(false);
      setOtp("");
    } catch (error) {
      setMessage(
        "OTP verification failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // RESEND OTP
  // =========================

  const handleResendOtp = async () => {
    setLoading(true);
    setMessage("");

    try {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email,
      });

      if (error) {
        setMessage(error.message);
      } else {
        setMessage(
          "A new verification code has been sent to your email."
        );
      }
    } catch (error) {
      setMessage(
        "Unable to resend OTP. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // FORGOT PASSWORD
  // =========================

  const handleForgotPassword = async (e) => {
    e.preventDefault();

    setLoading(true);
    setMessage("");

    try {
      const { error } =
        await supabase.auth.resetPasswordForEmail(
          email,
          {
            redirectTo:
              `https://merry-nougat-be4ddc.netlify.app/reset-password`,
          }
        );

      if (error) {
        setMessage(error.message);
        return;
      }

      setMessage(
        "Password reset link has been sent to your email."
      );
    } catch (error) {
      setMessage(
        "Unable to send reset email. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // OTP SCREEN
  // =========================

  if (showOtp) {
    return (
      <div className="login-page">
        <div className="login-card">

          <h1>CareerPilot AI</h1>

          <p className="subtitle">
            Verify your email address
          </p>

          <p>
            We sent a verification code to:
          </p>

          <strong>{email}</strong>

          <form onSubmit={handleVerifyOtp}>

            <input
              type="text"
              placeholder="Enter 6-digit OTP"
              value={otp}
              onChange={(e) =>
                setOtp(
                  e.target.value
                    .replace(/\D/g, "")
                    .slice(0, 6)
                )
              }
              maxLength={6}
              inputMode="numeric"
              required
            />

            <button
              type="submit"
              disabled={
                loading || otp.length !== 6
              }
            >
              {loading
                ? "Verifying..."
                : "Verify OTP"}
            </button>

          </form>

          {message && (
            <p className="message">
              {message}
            </p>
          )}

          <button
            type="button"
            className="switch-button"
            onClick={handleResendOtp}
            disabled={loading}
          >
            Resend OTP
          </button>

          <br />

          <button
            type="button"
            className="switch-button"
            onClick={() => {
              setShowOtp(false);
              setMessage("");
              setOtp("");
            }}
          >
            Back to Signup
          </button>

        </div>
      </div>
    );
  }

  // =========================
  // FORGOT PASSWORD SCREEN
  // =========================

  if (showForgotPassword) {
    return (
      <div className="login-page">
        <div className="login-card">

          <h1>CareerPilot AI</h1>

          <p className="subtitle">
            Reset your password
          </p>

          <form onSubmit={handleForgotPassword}>

            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              required
            />

            <button
              type="submit"
              disabled={loading}
            >
              {loading
                ? "Sending..."
                : "Send Reset Link"}
            </button>

          </form>

          {message && (
            <p className="message">
              {message}
            </p>
          )}

          <button
            type="button"
            className="switch-button"
            onClick={() => {
              setShowForgotPassword(false);
              setMessage("");
            }}
          >
            Back to Login
          </button>

        </div>
      </div>
    );
  }

  // =========================
  // LOGIN / SIGNUP SCREEN
  // =========================

  return (
    <div className="login-page">

      <div className="login-card">

        <h1>CareerPilot AI</h1>

        <p className="subtitle">
          {isSignup
            ? "Create your career account"
            : "Your AI-powered career companion"}
        </p>

        <form onSubmit={handleSubmit}>

          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) =>
              setEmail(e.target.value)
            }
            required
          />

          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) =>
              setPassword(e.target.value)
            }
            required
            minLength={6}
          />

          <button
            type="submit"
            disabled={loading}
          >
            {loading
              ? "Please wait..."
              : isSignup
              ? "Create Account"
              : "Login"}
          </button>

        </form>

        {message && (
          <p className="message">
            {message}
          </p>
        )}

        {/* Forgot Password */}

        {!isSignup && (
          <button
            type="button"
            className="switch-button"
            onClick={() => {
              setShowForgotPassword(true);
              setMessage("");
            }}
          >
            Forgot Password?
          </button>
        )}

        {/* Login / Signup Switch */}

        <p className="switch-text">

          {isSignup
            ? "Already have an account?"
            : "Don't have an account?"}

          <button
            type="button"
            className="switch-button"
            onClick={() => {
              setIsSignup(!isSignup);
              setMessage("");
              setShowForgotPassword(false);
            }}
          >
            {isSignup
              ? " Login"
              : " Sign Up"}
          </button>

        </p>

      </div>

    </div>
  );
}

export default Login;
