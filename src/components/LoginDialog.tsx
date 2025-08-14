import React, { useState } from "react";
import {
  useConnectWithOtp,
  useEmbeddedWallet,
  useDynamicContext,
} from "@dynamic-labs/sdk-react-core";
import "./LoginDialog.css";

interface LoginDialogProps {
  onClose?: () => void;
}

const LoginDialog: React.FC<LoginDialogProps> = () => {
  const [email, setEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [waitingForOtp, setWaitingForOtp] = useState(false);
  const [waitingForAuth, setWaitingForAuth] = useState(false);
  const [error, setError] = useState("");

  const dynamicContext = useDynamicContext();
  const { sdkHasLoaded } = dynamicContext;
  const { createEmbeddedWallet } = useEmbeddedWallet();
  const { connectWithEmail, verifyOneTimePassword } = useConnectWithOtp();

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    setIsLoading(true);
    setWaitingForOtp(true);
    setError("");

    try {
      console.log("Sending verification code to:", email);
      await connectWithEmail(email);
      setIsLoading(false);
    } catch (err: unknown) {
      console.error("Email login error:", err);
      setError(
        (err as Error).message ||
          "Failed to send verification code. Please try again."
      );
      setIsLoading(false);
      setWaitingForOtp(false);
    }
  };

  const handleVerificationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verificationCode.trim()) {
      setError("Please enter the verification code.");
      return;
    }

    setIsLoading(true);
    setWaitingForAuth(true);
    setWaitingForOtp(false);
    setError("");

    try {
      console.log("Verifying code:", verificationCode, "for email:", email);

      await verifyOneTimePassword(verificationCode);
      await createEmbeddedWallet();

      setIsLoading(false);
      setWaitingForAuth(false);
      console.log("Email verification and wallet creation successful!");
    } catch (err: unknown) {
      console.error("Verification error:", err);
      setError(
        (err as Error).message || "Invalid verification code. Please try again."
      );
      setIsLoading(false);
      setWaitingForAuth(false);
      setWaitingForOtp(true); // Go back to OTP waiting state
    }
  };

  if (!sdkHasLoaded) {
    return (
      <div className="login-overlay">
        <div className="login-dialog">
          <div className="loading">Loading SDK...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="login-overlay">
      <div className="login-dialog">
        <div className="login-header">
          <h2>Log In to wallet</h2>
          {waitingForOtp && !waitingForAuth && (
            <button
              className="back-button"
              onClick={() => {
                setWaitingForOtp(false);
                setError("");
              }}
              disabled={isLoading}
            >
              ← Back
            </button>
          )}
        </div>

        {!waitingForOtp && (
          <form onSubmit={handleEmailSubmit} className="login-form">
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                disabled={isLoading}
                required
              />
            </div>

            {error && <div className="error-message">{error}</div>}

            <button
              type="submit"
              className="login-button"
              disabled={isLoading || !email.trim()}
            >
              {isLoading ? "Sending..." : "Log In"}
            </button>
          </form>
        )}

        {waitingForOtp && !waitingForAuth && (
          <form onSubmit={handleVerificationSubmit} className="login-form">
            <div className="verification-info">
              <p>We sent a verification code to {email}.</p>
              <p>Please check your email and enter the verification code.</p>
            </div>

            <div className="form-group">
              <label htmlFor="code">Verification Code</label>
              <input
                id="code"
                type="text"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                placeholder="123456"
                disabled={isLoading}
                maxLength={6}
                required
              />
            </div>

            {error && <div className="error-message">{error}</div>}

            <button
              type="submit"
              className="login-button"
              disabled={isLoading || !verificationCode.trim()}
            >
              {isLoading ? "Verifying..." : "Verify"}
            </button>
          </form>
        )}

        {waitingForAuth && (
          <div className="loading-state">
            <p>Creating your wallet...</p>
            <div className="loading">Please wait...</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoginDialog;
