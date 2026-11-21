import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { Select } from '../ui/Select';
import { projectsService } from '../../services/projects.service';
import { ProjectType } from '../../types/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

interface NewProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const NewProjectModal: React.FC<NewProjectModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { activeWorkspace, refreshProjects } = useAuth();
  const { success, error: showError } = useToast();

  const [name, setName] = useState('');
  const [projectType, setProjectType] = useState<ProjectType>('saas');
  const [customProjectType, setCustomProjectType] = useState('');
  const [description, setDescription] = useState('');
  const [url, setUrl] = useState('');
  const [industry, setIndustry] = useState('');
  const [companySize, setCompanySize] = useState('10-50');
  const [mission, setMission] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeWorkspace?.id) {
      showError('Workspace required', 'No active workspace selected.');
      return;
    }
    if (!name.trim()) {
      showError('Project name required', 'Please provide a name for the project.');
      return;
    }
    if (projectType === 'other' && !customProjectType.trim()) {
      showError('Custom type required', 'Please specify the project classification.');
      return;
    }

    setIsLoading(true);
    try {
      await projectsService.create(activeWorkspace.id, {
        name: name.trim(),
        project_type: projectType,
        custom_project_type: projectType === 'other' ? customProjectType.trim() : undefined,
        description: description.trim() || undefined,
        url: url.trim() || undefined,
        industry: industry.trim() || undefined,
        company_size: companySize || undefined,
        mission: mission.trim() || undefined,
      });

      success('Project Created', `Project "${name}" is now ready in QuickBit Live.`);
      setName('');
      setProjectType('saas');
      setCustomProjectType('');
      setDescription('');
      setUrl('');
      setIndustry('');
      setMission('');
      await refreshProjects(activeWorkspace.id);
      onClose();
      if (onSuccess) onSuccess();
    } catch (err: any) {
      showError('Failed to create project', err.message || 'Error from QuickBit Live API');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Project"
      description="Initialize a new product intelligence workspace for your SaaS, application, or platform."
      maxWidth="lg"
      footer={
        <>
          <Button variant="outline" size="sm" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" onClick={handleSubmit} isLoading={isLoading}>
            Create Project
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Input
            label="Project / Product Name"
            placeholder="e.g. QuickBit Live Cloud"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <Select
            label="Project Type"
            value={projectType}
            onChange={(e) => setProjectType(e.target.value as ProjectType)}
          >
            <option value="saas">SaaS / Cloud Software</option>
            <option value="fintech">Fintech & Payments</option>
            <option value="healthtech">Healthtech & Medical</option>
            <option value="ecommerce">E-Commerce & Retail</option>
            <option value="enterprise">Enterprise Platform</option>
            <option value="marketplace">Marketplace</option>
            <option value="edtech">Edtech & Learning</option>
            <option value="social">Social & Community</option>
            <option value="gaming">Gaming</option>
            <option value="logistics">Logistics & Supply</option>
            <option value="other">Other</option>
          </Select>
        </div>

        {projectType === 'other' && (
          <Input
            label="Specify Classification"
            placeholder="e.g. PropTech, AgriTech, LegalTech..."
            value={customProjectType}
            onChange={(e) => setCustomProjectType(e.target.value)}
            required
          />
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Input
            label="Product URL"
            placeholder="https://app.example.com"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />

          <Input
            label="Industry Domain"
            placeholder="e.g. B2B Productivity"
            value={industry}
            onChange={(e) => setIndustry(e.target.value)}
          />
        </div>

        <Textarea
          label="Product Description"
          placeholder="Brief overview of what this product solves for its users..."
          rows={2}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Select
            label="Company Size"
            value={companySize}
            onChange={(e) => setCompanySize(e.target.value)}
          >
            <option value="1-10">1-10 Employees</option>
            <option value="10-50">10-50 Employees</option>
            <option value="50-250">50-250 Employees</option>
            <option value="250-1000">250-1000 Employees</option>
            <option value="1000+">1000+ Enterprise</option>
          </Select>

          <Input
            label="Product Mission (Optional)"
            placeholder="e.g. Empower product teams to make verified AI decisions"
            value={mission}
            onChange={(e) => setMission(e.target.value)}
          />
        </div>
      </form>
    </Modal>
  );
};
