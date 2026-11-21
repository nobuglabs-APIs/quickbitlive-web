import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { RotateCcw, Save } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Switch } from '../ui/Switch';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { irisService } from '../../services/iris.service';
import {
  IrisConfig,
  IrisSkin,
  IrisTone,
  IrisFormality,
} from '../../types/api';

const COLOR_PRESETS = ['#4F46E5', '#06B6D4', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#0F172A', '#FFFFFF'];

/* Color swatch + hex field + presets (styled replacement for raw color inputs) */
const ColorField: React.FC<{ label: string; value: string; onChange: (v: string) => void }> = ({ label, value, onChange }) => (
  <div className="space-y-2">
    <span className="text-[13px] font-medium text-ink dark:text-white">{label}</span>
    <div className="flex items-center gap-2">
      <label
        className="relative h-9 w-12 shrink-0 cursor-pointer overflow-hidden rounded-xl border border-line dark:border-slate-700 transition-shadow hover:shadow-sm"
        title="Pick a custom color"
      >
        <span className="absolute inset-0" style={{ backgroundColor: value }} />
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
          aria-label={label}
        />
      </label>
      <Input value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
    <div className="flex items-center gap-1.5">
      {COLOR_PRESETS.map((c) => {
        const isActive = c.toLowerCase() === value.toLowerCase();
        return (
          <button
            key={c}
            type="button"
            onClick={() => onChange(c)}
            aria-label={`Use color ${c}`}
            title={c}
            style={{ backgroundColor: c }}
            className={`h-5 w-5 rounded-full border border-black/10 dark:border-white/20 transition-transform hover:scale-110 ${
              isActive ? 'ring-2 ring-brand ring-offset-1 ring-offset-white dark:ring-offset-ink' : ''
            }`}
          />
        );
      })}
    </div>
  </div>
);

const skinOptions: IrisSkin[] = [
  'default',
  'saas',
  'golden',
  'detective',
  'astronaut',
  'cyberpunk',
  'steampunk',
  'doctor',
  'gamer',
  'singer',
  'electrician',
  'model',
  'christmas',
  'death',
  'reaper',
  'halloween',
  'toy',
  'wizard',
];

export interface IrisWidgetConfiguratorState {
  skin: IrisSkin;
  greeting: string;
  tone: IrisTone;
  formality: IrisFormality;
  language: string;
  primaryColor: string;
  screenColor: string;
  idleAnim: boolean;
  particlesAnim: boolean;
  blinkAnim: boolean;
}

interface IrisWidgetConfiguratorProps {
  renderPreview: (state: IrisWidgetConfiguratorState) => React.ReactNode;
  renderActions?: (handlers: {
    handleSave: () => void;
    handleReset: () => void;
    isSaving: boolean;
  }) => React.ReactNode;
}

export const IrisWidgetConfigurator: React.FC<IrisWidgetConfiguratorProps> = ({
  renderPreview,
  renderActions,
}) => {
  const { activeWorkspace, activeProject } = useAuth();
  const { success, error: showError } = useToast();

  const workspaceId = activeWorkspace?.id || '';
  const projectId = activeProject?.id || '';

  const {
    data: fetchedConfig,
    refetch: refetchIris,
  } = useQuery<IrisConfig | null>({
    queryKey: ['iris-config', workspaceId, projectId],
    queryFn: () => irisService.getIrisConfig(workspaceId, projectId),
    enabled: !!workspaceId && !!projectId,
  });

  const [skin, setSkin] = useState<IrisSkin>('default');
  const [greeting, setGreeting] = useState('Hi! How can I help improve your product experience today?');
  const [tone, setTone] = useState<IrisTone>('friendly');
  const [formality, setFormality] = useState<IrisFormality>('casual');
  const [language, setLanguage] = useState('en');
  const [primaryColor, setPrimaryColor] = useState('#4F46E5');
  const [screenColor, setScreenColor] = useState('#0F172A');
  const [idleAnim, setIdleAnim] = useState(true);
  const [particlesAnim, setParticlesAnim] = useState(true);
  const [blinkAnim, setBlinkAnim] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (fetchedConfig) {
      if (fetchedConfig.skin) setSkin(fetchedConfig.skin);
      if (fetchedConfig.personality?.greeting) setGreeting(fetchedConfig.personality.greeting);
      if (fetchedConfig.personality?.tone) setTone(fetchedConfig.personality.tone);
      if (fetchedConfig.personality?.formality) setFormality(fetchedConfig.personality.formality);
      if (fetchedConfig.personality?.language) setLanguage(fetchedConfig.personality.language);
      if (fetchedConfig.colors?.primary) setPrimaryColor(fetchedConfig.colors.primary);
      if (fetchedConfig.colors?.screen) setScreenColor(fetchedConfig.colors.screen);
      if (fetchedConfig.animations) {
        setIdleAnim(fetchedConfig.animations.idle !== false);
        setParticlesAnim(fetchedConfig.animations.particles !== false);
        setBlinkAnim(fetchedConfig.animations.blink !== false);
      }
    }
  }, [fetchedConfig]);

  const handleSave = async () => {
    if (!workspaceId || !projectId) return;
    setIsSaving(true);
    try {
      const configToSave: IrisConfig = {
        skin,
        personality: { greeting, tone, formality, language },
        colors: { primary: primaryColor, screen: screenColor },
        animations: { idle: idleAnim, particles: particlesAnim, blink: blinkAnim },
      };
      await irisService.updateIrisConfig(workspaceId, projectId, configToSave);
      success('Widget Configured', 'Iris mascot appearance and behavior updated.');
      refetchIris();
    } catch (err: unknown) {
      showError('Failed to save config', err instanceof Error ? err.message : 'Unexpected error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = async () => {
    if (!workspaceId || !projectId) return;
    try {
      await irisService.resetIrisConfig(workspaceId, projectId);
      success('Config Reset', 'Iris configuration restored to default settings.');
      refetchIris();
    } catch (err: unknown) {
      showError('Reset failed', err instanceof Error ? err.message : 'Unexpected error');
    }
  };

  const state: IrisWidgetConfiguratorState = {
    skin,
    greeting,
    tone,
    formality,
    language,
    primaryColor,
    screenColor,
    idleAnim,
    particlesAnim,
    blinkAnim,
  };

  return (
    <>
      {/* Left 7 cols: Controls */}
      <div className="lg:col-span-7 space-y-6">
        {/* Skin selector */}
        <div className="p-6 bg-white dark:bg-ink border border-line-light dark:border-ink-2 rounded-2xl shadow-2xs space-y-3">
          <label className="text-xs font-bold text-ink dark:text-white uppercase tracking-wider block">
            Mascot Skin / Archetype
          </label>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
            {skinOptions.map((s) => (
              <button
                key={s}
                onClick={() => setSkin(s)}
                className={`p-2.5 text-xs font-semibold rounded-xl border text-center capitalize transition-all cursor-pointer ${
                  skin === s
                    ? 'border-brand bg-brand text-white shadow-2xs'
                    : 'border-line dark:border-slate-800 bg-white dark:bg-ink-2 text-muted-strong dark:text-slate-300 hover:border-brand dark:hover:border-indigo-500'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Personality & Language */}
        <div className="p-6 bg-white dark:bg-ink border border-line-light dark:border-ink-2 rounded-2xl shadow-2xs space-y-4">
          <label className="text-xs font-bold text-ink dark:text-white uppercase tracking-wider block">
            Personality & Language
          </label>

          <Input
            label="Default Greeting Message"
            value={greeting}
            onChange={(e) => setGreeting(e.target.value)}
          />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Select
              label="Tone of Voice"
              value={tone}
              onChange={(e) => setTone(e.target.value as IrisTone)}
            >
              <option value="friendly">Friendly</option>
              <option value="professional">Professional</option>
              <option value="witty">Witty / Playful</option>
              <option value="empathetic">Empathetic</option>
              <option value="concise">Concise</option>
            </Select>

            <Select
              label="Formality"
              value={formality}
              onChange={(e) => setFormality(e.target.value as IrisFormality)}
            >
              <option value="casual">Casual</option>
              <option value="balanced">Balanced</option>
              <option value="formal">Formal</option>
            </Select>

            <Select
              label="Language"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
            >
              <option value="en">English (US)</option>
              <option value="pt">Portuguese (PT/BR)</option>
              <option value="es">Spanish (ES)</option>
              <option value="fr">French (FR)</option>
              <option value="de">German (DE)</option>
            </Select>
          </div>
        </div>

        {/* Colors & Animation */}
        <div className="p-6 bg-white dark:bg-ink border border-line-light dark:border-ink-2 rounded-2xl shadow-2xs space-y-4">
          <label className="text-xs font-bold text-ink dark:text-white uppercase tracking-wider block">
            Appearance & Animation
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ColorField label="Primary Accent Color" value={primaryColor} onChange={setPrimaryColor} />
            <ColorField label="Screen / Frame Color" value={screenColor} onChange={setScreenColor} />
          </div>

          <div className="pt-3 border-t border-line-light dark:border-ink-2 flex flex-wrap items-center gap-x-6 gap-y-3">
            <Switch label="Idle Hover Animation" checked={idleAnim} onChange={setIdleAnim} />
            <Switch label="Sparkle Particles" checked={particlesAnim} onChange={setParticlesAnim} />
            <Switch label="Eye Blink Loop" checked={blinkAnim} onChange={setBlinkAnim} />
          </div>
        </div>

        {/* Save / Reset */}
        {renderActions ? renderActions({ handleSave, handleReset, isSaving }) : (
          <div className="flex items-center justify-end gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
              leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
            >
              Reset Defaults
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleSave}
              isLoading={isSaving}
              leftIcon={<Save className="w-3.5 h-3.5" />}
            >
              Save Changes
            </Button>
          </div>
        )}
      </div>

      {/* Right 5 cols: Live Preview */}
      <div className="lg:col-span-5 flex flex-col">
        <div className="sticky top-20">
          {renderPreview(state)}
        </div>
      </div>
    </>
  );
};