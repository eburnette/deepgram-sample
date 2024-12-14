import React, { useEffect } from 'react';
import { Button } from "../../components/Button";
import "./InactivityModal.css";

interface InactivityModalProps {
  onContinue: () => void;
  onClose: () => void;
  timeout: number; // milliseconds
}

const InactivityModal: React.FC<InactivityModalProps> = ({ onContinue, onClose, timeout }) => {
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      onClose();
    }, timeout);

    return () => clearTimeout(timeoutId);
  }, [onClose, timeout]);

  return (
    <div className="modal">
      <div className="modal-content">
        <h2>Inactivity Warning</h2>
        <p>You have been inactive for a few minutes. Do you want to continue?</p>
        <Button onClick={onContinue} labelText='Yes'/>
        <Button onClick={onClose} labelText='No'/>
      </div>
    </div>
  );
};

export default InactivityModal;