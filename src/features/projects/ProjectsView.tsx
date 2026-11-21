import React, { useState, useEffect } from 'react';
import { FolderGit2, Save, Trash2, Globe, Users, CheckCircle2, Database, ArrowRight, Minus, Plus } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import { Select } from '../../components/ui/Select';
import { Modal } from '../../components/ui/Modal';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { projectsService } from '../../services/projects.service';
import { ProjectType } from '../../types/api';

interface ProjectsViewProps {
  onNavigate: (tab: string) => void;
}

export const ProjectsView: React.FC<ProjectsViewProps> = ({ onNavigate }) => {
  const { activeWorkspace, activeProject, projects, refreshProjects, setActiveProject } = useAuth();
  const { success, error: showError } = useToast();

  const [name, setName] = useState('');
  const [projectType, setProjectType] = useState<ProjectType>('saas');
  const [customProjectType, setCustomProjectType] = useState('');
  const [description, setDescription] = useState('');
  const [url, setUrl] = useState('');
  const [industry, setIndustry] = useState('');
  const [companySize, setCompanySize] = useState('10-50');
  const [mission, setMission] = useState('');
  const [vision, setVision] = useState('');
  const [values, setValues] = useState('');
  const [foundedYear, setFoundedYear] = useState<number | null | undefined>(undefined);
  const [maxUsers, setMaxUsers] = useState<number | null | undefined>(undefined);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const knownTypes = ['saas','fintech','healthtech','ecommerce','enterprise','marketplace','edtech','social','gaming','logistics','other'];

  useEffect(() => {
    if (activeProject) {
      setName(activeProject.name || '');
      const pt = activeProject.project_type || 'saas';
      if (knownTypes.includes(pt)) {
        setProjectType(pt as ProjectType);
        setCustomProjectType('');
      } else {
        setProjectType('other');
        setCustomProjectType(pt);
      }
      setDescription(activeProject.description || '');
      setUrl(activeProject.url || '');
      setIndustry(activeProject.industry || '');
      setCompanySize(activeProject.company_size || '10-50');
      setMission(activeProject.mission || '');
      setVision(activeProject.vision || '');
      setValues(activeProject.values || '');
      setFoundedYear(activeProject.founded_year);
      setMaxUsers(activeProject.max_users);
    }
  }, [activeProject]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeWorkspace?.id || !activeProject?.id) return;

    setIsSaving(true);
    try {
      const updated = await projectsService.update(activeWorkspace.id, activeProject.id, {
        name,
        project_type: projectType,
        custom_project_type: projectType === 'other' ? customProjectType.trim() : undefined,
        description,
        url: url || undefined,
        industry: industry || undefined,
        company_size: companySize || undefined,
        mission: mission || undefined,
        vision: vision || undefined,
        values: values || undefined,
        founded_year: foundedYear ? Number(foundedYear) : undefined,
        max_users: maxUsers ? Number(maxUsers) : undefined,
      });

      setActiveProject(updated);
      await refreshProjects(activeWorkspace.id);
      success('Project Updated', 'Project settings and profile saved.');
    } catch (err: any) {
      showError('Save failed', err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteProject = async () => {
    if (!activeWorkspace?.id || !activeProject?.id) return;

    setIsDeleting(true);
    try {
      await projectsService.delete(activeWorkspace.id, activeProject.id);
      success('Project Deleted', 'The project was removed.');
      setIsDeleteModalOpen(false);
      await refreshProjects(activeWorkspace.id);
    } catch (err: any) {
      showError('Failed to delete project', err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  const projectList = (
    <section className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div><h2 className="text-sm font-bold text-ink dark:text-white">Projects in {activeWorkspace?.name || 'this workspace'}</h2><p className="mt-1 text-xs text-muted dark:text-slate-400">Select a project to view or edit its profile.</p></div>
        <span className="rounded-full bg-brand-soft px-2.5 py-1 text-[11px] font-bold text-brand dark:bg-indigo-950/50 dark:text-indigo-300">{projects.length} {projects.length === 1 ? 'project' : 'projects'}</span>
      </div>
      {projects.length === 0 ? <div className="rounded-2xl border border-dashed border-line p-6 text-center text-xs text-muted dark:border-slate-700 dark:text-slate-400">No projects found in this workspace. Create a project from the Create menu to begin.</div> : <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">{projects.map((project) => {
        const isSelected = project.id === activeProject?.id;
        return <button key={project.id} onClick={() => setActiveProject(project)} className={`rounded-2xl border p-4 text-left transition-all ${isSelected ? 'border-brand bg-brand-soft/60 shadow-sm dark:border-indigo-500 dark:bg-indigo-950/30' : 'border-line bg-white hover:border-brand-border dark:border-slate-800 dark:bg-ink dark:hover:border-indigo-800'}`}>
          <div className="flex items-start justify-between gap-2"><div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-brand shadow-2xs dark:bg-slate-800 dark:text-indigo-300"><FolderGit2 className="h-4 w-4" /></div>{isSelected && <CheckCircle2 className="h-4 w-4 text-brand dark:text-indigo-400" />}</div>
          <h3 className="mt-3 truncate text-sm font-bold text-ink dark:text-white">{project.name}</h3><p className="mt-1 line-clamp-2 min-h-8 text-xs leading-relaxed text-muted dark:text-slate-400">{project.description || 'No project description yet.'}</p>
          <div className="mt-3 flex flex-wrap gap-2 text-[10px] font-semibold text-muted dark:text-slate-400"><span className="inline-flex items-center gap-1"><Globe className="h-3 w-3" />{project.project_type}</span>{project.max_users && <span className="inline-flex items-center gap-1"><Users className="h-3 w-3" />{project.max_users.toLocaleString()}</span>}</div>
        </button>;
      })}</div>}
    </section>
  );

  if (!activeProject) {
    return (
      <div className="p-4 lg:p-6 max-w-6xl mx-auto space-y-4">
        <div><h1 className="text-xl lg:text-2xl font-bold tracking-tight text-ink dark:text-white flex items-center gap-2"><FolderGit2 className="w-6 h-6 text-brand dark:text-indigo-400" />Projects</h1><p className="text-xs text-muted dark:text-slate-400 mt-1">Choose a project to manage its product profile and configuration.</p></div>
        {projectList}
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6 max-w-6xl mx-auto space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-line-light dark:border-ink-2">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold tracking-tight text-ink dark:text-white flex items-center gap-2">
            <FolderGit2 className="w-6 h-6 text-brand dark:text-indigo-400" />
            Projects
          </h1>
          <p className="text-xs text-muted dark:text-slate-400 mt-1">
            Select a project, then manage its product configuration, classification, and metadata.
          </p>
        </div>

        <Button
          type="button"
          variant="danger"
          size="sm"
          onClick={() => setIsDeleteModalOpen(true)}
          leftIcon={<Trash2 className="w-3.5 h-3.5" />}
        >
          Delete Project
        </Button>
      </div>

      {projectList}

      {/* Form */}
      <form onSubmit={handleSave} className="max-w-4xl space-y-6">
        {/* Basic Info */}
        <div className="p-6 bg-white dark:bg-ink border border-line-light dark:border-ink-2 rounded-2xl shadow-2xs space-y-4">
          <h3 className="text-xs font-bold text-ink dark:text-white uppercase tracking-wider">
            Product Profile
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Product / Project Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />

            <Select
              label="Project Classification"
              value={projectType}
              onChange={(e) => setProjectType(e.target.value as ProjectType)}
            >
              <option value="saas">SaaS</option>
              <option value="fintech">Fintech</option>
              <option value="healthtech">Healthtech</option>
              <option value="ecommerce">E-Commerce</option>
              <option value="enterprise">Enterprise</option>
              <option value="marketplace">Marketplace</option>
              <option value="edtech">Edtech</option>
              <option value="social">Social</option>
              <option value="gaming">Gaming</option>
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

          <Textarea
            label="Product Description"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Public Website / App URL"
              placeholder="https://example.com"
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
        </div>

        {/* Company & Strategy Metadata */}
        <div className="p-6 bg-white dark:bg-ink border border-line-light dark:border-ink-2 rounded-2xl shadow-2xs space-y-4">
          <h3 className="text-xs font-bold text-ink dark:text-white uppercase tracking-wider">
            Strategic Alignment & Metadata
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
              label="Founded Year"
              type="number"
              value={foundedYear || ''}
              onChange={(e) => setFoundedYear(e.target.value ? Number(e.target.value) : undefined)}
              rightElement={
                <div className="flex items-center">
                  <button type="button" aria-label="Decrease year" onClick={() => setFoundedYear((v) => Math.max(1990, (v ?? new Date().getFullYear()) - 1))} className="p-1 rounded-md text-muted hover:text-ink hover:bg-surface dark:hover:bg-slate-700 transition-colors cursor-pointer">
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <button type="button" aria-label="Increase year" onClick={() => setFoundedYear((v) => Math.min(2100, (v ?? new Date().getFullYear()) + 1))} className="p-1 rounded-md text-muted hover:text-ink hover:bg-surface dark:hover:bg-slate-700 transition-colors cursor-pointer">
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              }
            />

            <Input
              label="Active User Capacity"
              type="number"
              value={maxUsers || ''}
              onChange={(e) => setMaxUsers(e.target.value ? Number(e.target.value) : undefined)}
              rightElement={
                <div className="flex items-center">
                  <button type="button" aria-label="Decrease capacity" onClick={() => setMaxUsers((v) => Math.max(0, (v ?? 0) - 10))} className="p-1 rounded-md text-muted hover:text-ink hover:bg-surface dark:hover:bg-slate-700 transition-colors cursor-pointer">
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <button type="button" aria-label="Increase capacity" onClick={() => setMaxUsers((v) => (v ?? 0) + 10)} className="p-1 rounded-md text-muted hover:text-ink hover:bg-surface dark:hover:bg-slate-700 transition-colors cursor-pointer">
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              }
            />
          </div>

          <Input
            label="Product Mission"
            placeholder="What is this product's mission?"
            value={mission}
            onChange={(e) => setMission(e.target.value)}
          />

          <Input
            label="Product Vision"
            placeholder="Where will this product be in 3 years?"
            value={vision}
            onChange={(e) => setVision(e.target.value)}
          />

          <Input
            label="Core Values"
            placeholder="e.g. Speed, Reliability, Delight"
            value={values}
            onChange={(e) => setValues(e.target.value)}
          />
        </div>

        <div className="flex justify-end">
          <Button
            type="submit"
            variant="primary"
            size="md"
            isLoading={isSaving}
            leftIcon={<Save className="w-3.5 h-3.5" />}
          >
            Save Project Settings
          </Button>
        </div>
      </form>

      {/* Knowledge Base & Documents */}
      <div className="p-6 bg-white dark:bg-ink border border-line-light dark:border-ink-2 rounded-2xl shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5 min-w-0">
            <div className="w-11 h-11 rounded-xl bg-brand-soft dark:bg-indigo-950/50 text-brand dark:text-indigo-400 flex items-center justify-center shrink-0">
              <Database className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-bold text-ink dark:text-white">
                Knowledge Base &amp; Documents
              </h3>
              <p className="text-xs text-muted dark:text-slate-400 mt-1 leading-relaxed">
                Upload PRDs, architecture specifications, user interview transcripts, and customer research to power the Iris RAG assistant.
              </p>
            </div>
          </div>
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={() => onNavigate('documents')}
            rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
          >
            Manage Knowledge Base
          </Button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Project"
        description={`Are you sure you want to permanently delete "${activeProject.name}"? All associated signals, clusters, and RAG knowledge vectors will be permanently removed.`}
        footer={
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsDeleteModalOpen(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={handleDeleteProject}
              isLoading={isDeleting}
            >
              Delete Permanently
            </Button>
          </>
        }
      >
        <p className="text-xs text-rose-600 dark:text-rose-400">
          This action cannot be undone. All ingested data will be wiped.
        </p>
      </Modal>
    </div>
  );
};
