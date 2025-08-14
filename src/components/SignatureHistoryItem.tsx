import React from 'react';
import './SignatureHistoryItem.css';

interface SignatureHistoryItemProps {
  message: string;
  signature: string;
  timestamp: string;
  isVerified?: boolean;
  onVerify?: () => void;
}

const SignatureHistoryItem: React.FC<SignatureHistoryItemProps> = ({
  message,
  signature,
  timestamp,
  isVerified = false,
  onVerify
}) => {
  return (
    <div className="history-item">
      <div className="history-header">
        <span className="timestamp">{timestamp}</span>
      </div>
      <div className="history-message">
        <strong>Message:</strong> {message}
      </div>
      <div className="history-signature">
        <div className="signature-header">
          <strong>Signature:</strong>
          <div className="signature-actions">
            <span className={`verification-badge ${isVerified ? 'verified' : 'not-verified'}`}>
              {isVerified ? 'Verified' : 'Not Verified'}
            </span>
            {!isVerified && onVerify && (
              <button className="verify-button" onClick={onVerify}>
                Verify
              </button>
            )}
          </div>
        </div>
        <span className="signature-text">{signature}</span>
      </div>
    </div>
  );
};

export default SignatureHistoryItem;