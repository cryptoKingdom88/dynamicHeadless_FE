import React, { useState, useEffect } from "react";
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import { isEthereumWallet } from "@dynamic-labs/ethereum";
import SignatureHistoryItem from "./SignatureHistoryItem";
import { verifySignature } from "../utils/signatureVerification";
import "./MessageSigner.css";

interface SignedMessage {
  message: string;
  signature: string;
  timestamp: string;
  isVerified?: boolean;
  walletAddress?: string;
  verifiedSigner?: string; // Signer address from backend verification
}

const STORAGE_KEY = "dynamic-signed-messages";

const MessageSigner: React.FC = () => {
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [signedMessages, setSignedMessages] = useState<SignedMessage[]>([]);

  const { primaryWallet, user } = useDynamicContext();

  // Load messages from localStorage on component mount
  useEffect(() => {
    const loadStoredMessages = () => {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        console.log(
          "Loading from localStorage:",
          stored ? "found data" : "no data"
        );

        if (stored) {
          const parsedMessages: SignedMessage[] = JSON.parse(stored);
          console.log("Loaded messages:", parsedMessages.length);
          setSignedMessages(parsedMessages);
        }

        // Mark as initialized after loading (or attempting to load)
        setIsInitialized(true);
      } catch (error) {
        console.error("Failed to load stored messages:", error);
        setIsInitialized(true); // Still mark as initialized even on error
      }
    };

    loadStoredMessages();
  }, []);

  // Save messages to localStorage whenever signedMessages changes
  // But skip the initial empty array to avoid overwriting stored data
  const [isInitialized, setIsInitialized] = useState(false);

  // Debug: Log current localStorage content
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    console.log("Current localStorage content:", stored);
  });

  useEffect(() => {
    if (isInitialized) {
      try {
        console.log(
          "Saving to localStorage:",
          signedMessages.length,
          "messages"
        );
        localStorage.setItem(STORAGE_KEY, JSON.stringify(signedMessages));
      } catch (error) {
        console.error("Failed to save messages to localStorage:", error);
      }
    }
  }, [signedMessages, isInitialized]);

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
      console.log("Message as bytes:", new TextEncoder().encode(messageToSign));

      // Force string type with multiple methods to ensure it's treated as text
      let finalMessage = messageToSign;

      // If the message is purely numeric, add a prefix to force text interpretation
      if (/^\d+$/.test(messageToSign)) {
        console.log(
          "Detected numeric-only message, ensuring text interpretation"
        );
        // Don't modify the actual message, but ensure Dynamic SDK treats it as text
        finalMessage = messageToSign; // Keep original but log the detection
      }

      // Ensure it's definitely a string
      finalMessage = String(finalMessage);
      console.log("Final message:", finalMessage);
      console.log("Final message type:", typeof finalMessage);
      console.log("Is numeric only:", /^\d+$/.test(finalMessage));

      // Use Dynamic SDK's direct signMessage method (same as Methods.tsx)
      const signature = await primaryWallet.signMessage(finalMessage);

      console.log("Signature:", signature);

      if (!signature) {
        throw new Error("No signature returned from wallet");
      }

      // Add to signed messages history
      const newSignedMessage: SignedMessage = {
        message: finalMessage, // Use the processed message
        signature,
        timestamp: new Date().toLocaleString(),
        isVerified: false, // Default to not verified
        walletAddress: primaryWallet.address,
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

  const handleVerifySignature = async (signature: string, message: string) => {
    try {
      console.log("Verifying signature:", signature);

      const result = await verifySignature(message, signature);

      // Update the message in the list with verification result and signer
      setSignedMessages((prev) =>
        prev.map((msg) =>
          msg.signature === signature
            ? {
                ...msg,
                isVerified: result.isValid,
                verifiedSigner: result.signer, // Store the signer from backend
              }
            : msg
        )
      );

      console.log("Verification result:", result);
    } catch (error) {
      console.error("Verification failed:", error);
    }
  };

  return (
    <div className="message-signer">
      <div className="wallet-info">
        <h3>Connected Wallet</h3>
        {user?.email && (
          <div className="user-email">
            <strong>Email:</strong>
            <span className="email-address">{user.email}</span>
          </div>
        )}
        {primaryWallet?.address && (
          <div className="wallet-address-info">
            <strong>Address:</strong>
            <span className="wallet-address">{primaryWallet.address}</span>
          </div>
        )}
        {!user?.email && !primaryWallet?.address && (
          <p className="wallet-address">Unknown</p>
        )}
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
          <div className="history-header">
            <h4>Message History</h4>
            <button
              className="clear-history-button"
              onClick={() => {
                setSignedMessages([]);
                // Also clear from localStorage immediately
                localStorage.removeItem(STORAGE_KEY);
                console.log("Cleared localStorage");
              }}
            >
              Clear History
            </button>
          </div>
          <div className="history-list">
            {signedMessages.map((item, index) => (
              <SignatureHistoryItem
                key={`${item.signature}-${index}`}
                message={item.message}
                signature={item.signature}
                timestamp={item.timestamp}
                isVerified={item.isVerified}
                verifiedSigner={item.verifiedSigner}
                onVerify={() =>
                  handleVerifySignature(item.signature, item.message)
                }
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MessageSigner;
