import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Textarea } from '../ui/Textarea';
import { Select } from '../ui/Select';
import { engineService } from '../../services/engine.service';
import { Decision } from '../../types/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

interface DecisionOutcomeModalProps {
  decision: Decision | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const DecisionOutcomeModal: React.FC<DecisionOutcomeModalProps> = ({
  decision,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { activeWorkspace } = useAuth();
  const { success, error: showError } = useToast();

  const [solved, setSolved] = useState<boolean>(true);
  const [outcome, setOutcome] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!decision || !activeWorkspace?.id) return;

    setIsLoading(true);
    try {
      await engineService.submitDecisionOutcome(activeWorkspace.id, decision.id, {
        solved,
        outcome: outcome.trim() || undefined,
      });

      success('Outcome Recorded', 'Decision outcome logged to the QuickBit Live learning engine.');
      onClose();
      if (onSuccess) onSuccess();
    } catch (err: any) {
      showError('Failed to record outcome', err.message || 'Error communicating with QuickBit Live API');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Record Decision Outcome"
      description={`Document the real-world impact and results of executing "${decision?.title || 'Decision'}". This feeds the QuickBit Live learning loop.`}
      footer={
        <>
          <Button variant="outline" size="sm" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" onClick={handleSubmit} isLoading={isLoading}>
            Log Outcome
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Select
          label="Problem Solved Status"
          value={solved ? 'true' : 'false'}
          onChange={(e) => setSolved(e.target.value === 'true')}
        >
          <option value="true">Successfully Solved Problem (Positive Impact)</option>
          <option value="false">Did Not Fully Solve (Requires Further Iteration)</option>
        </Select>

        <Textarea
          label="Outcome & Impact Notes"
          placeholder="Describe measured metrics, customer reactions, retention changes, or key learnings..."
          rows={4}
          value={outcome}
          onChange={(e) => setOutcome(e.target.value)}
        />
      </form>
    </Modal>
  );
};
