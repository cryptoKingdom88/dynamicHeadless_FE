import React, { useState } from "react";
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import { isEthereumWallet } from "@dynamic-labs/ethereum";
import SignatureHistoryItem from "./SignatureHistoryItem";
import "./MessageSigner.css";

const MessageSigner: React.FC = () => {
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [signedMessages, setSignedMessages] = useState<
    Array<{
      message: string;
      signature: string;
      timestamp: string;
      isVerified?: boolean;
    }>
  >([]);

  const { primaryWallet, user } = useDynamicContext();

  const signMessage = async () => {
    if (!primaryWallet || !isEthereumWallet(primaryWallet) || !message.trim()) {
      setError("Please enter a message to sign");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      console.log("Signing message with Dynamic SDK...");
      console.log("Original message:", message);
      
      // Ensure message is treated as UTF-8 string, not as bytes
      const messageToSign = String(message).trim();
      console.log("Message to sign:", messageToSign);
      console.log("Message type:", typeof messageToSign);
      console.log("Message length:", messageToSign.length);

      // Use Dynamic SDK's direct signMessage method (same as Methods.tsx)
      const signature = await primaryWallet.signMessage(messageToSign);

      console.log("Signature:", signature);
      
      if (!signature) {
        throw new Error("No signature returned from wallet");
      }
      
      // Add to signed messages history
      const newSignedMessage = {
        message,
        signature,
        timestamp: new Date().toLocaleString(),
        isVerified: false, // Default to not verified
      };
      setSignedMessages((prev) => [newSignedMessage, ...prev]);

      // Clear the message input
      setMessage("");
    } catch (err: unknown) {
      console.error("Signing error:", err);
      setError((err as Error).message || "Failed to sign message");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    signMessage();
  };

  return (
    <div className="message-signer">
      <div className="wallet-info">
        <h3>Connected Wallet</h3>
        <p className="wallet-address">
          {primaryWallet?.address || user?.email || "Unknown"}
        </p>
      </div>

      <div className="sign-section">
        <h4>Sign Message</h4>
        <form onSubmit={handleSubmit} className="sign-form">
          <div className="input-group">
            <textarea
              value={message}
              onChange={(e) => setMessage(String(e.target.value))}
              placeholder="Enter your message to sign..."
              rows={4}
              disabled={isLoading}
              required
            />
            <button
              type="submit"
              className="sign-button"
              disabled={isLoading || !message.trim()}
            >
              {isLoading ? "Signing..." : "Sign"}
            </button>
          </div>
        </form>

        {error && <div className="error-message">{error}</div>}

      </div>

      {signedMessages.length > 0 && (
        <div className="message-history">
          <h4>Message History</h4>
          <div className="history-list">
            {signedMessages.map((item, index) => (
              <SignatureHistoryItem
                key={index}
                message={item.message}
                signature={item.signature}
                timestamp={item.timestamp}
                isVerified={item.isVerified}
                onVerify={() => {
                  // TODO: Implement backend verification
                  console.log('Verify signature:', item.signature);
                }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MessageSigner;
