import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

interface NewWorkspaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const NewWorkspaceModal: React.FC<NewWorkspaceModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { createWorkspace } = useAuth();
  const { success, error: showError } = useToast();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showError('Workspace name required', 'Please provide a name for the workspace.');
      return;
    }

    setIsLoading(true);
    try {
      await createWorkspace({
        name: name.trim(),
        description: description.trim() || null,
      });

      success('Workspace Created', `Workspace "${name}" is now active.`);
      setName('');
      setDescription('');
      onClose();
      if (onSuccess) onSuccess();
    } catch (err: any) {
      showError('Failed to create workspace', err.message || 'Error from QuickBit Live API');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create Workspace"
      description="Set up a new workspace to organize projects, signals, and team members."
      maxWidth="md"
      footer={
        <>
          <Button variant="outline" size="sm" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" onClick={handleSubmit} isLoading={isLoading}>
            Create Workspace
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Workspace Name"
            placeholder="e.g. QuickBit Live Cloud"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          autoFocus
        />

        <Textarea
          label="Description (Optional)"
          placeholder="What is this workspace for?"
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </form>
    </Modal>
  );
};
