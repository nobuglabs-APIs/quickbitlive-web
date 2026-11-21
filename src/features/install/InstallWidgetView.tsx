import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Plug,
  Copy,
  Check,
  Key,
  Plus,
  Trash2,
  Code2,
  Terminal,
  SlidersHorizontal,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { authService } from '../../services/auth.service';
import { ApiKeyResponse } from '../../types/api';
import { Modal } from '../../components/ui/Modal';
import { IrisPreview } from '../../components/widget/IrisPreview';
import { IrisWidgetConfigurator } from '../../components/widget/IrisWidgetConfigurator';

export const InstallWidgetView: React.FC = () => {
  const { activeProject } = useAuth();
  const { success, error: showError } = useToast();

  const [activeSection, setActiveSection] = useState<'customize' | 'embed' | 'keys'>('embed');

  // ── API Keys State ──
  const [copiedType, setCopiedType] = useState<string | null>(null);
  const [newKeyName, setNewKeyName] = useState('');
  const [isCreatingKey, setIsCreatingKey] = useState(false);
  const [createdKey, setCreatedKey] = useState<ApiKeyResponse | null>(null);

  const {
    data: apiKeys = [],
    refetch: refetchKeys,
  } = useQuery<ApiKeyResponse[]>({
    queryKey: ['api-keys'],
    queryFn: () => authService.listApiKeys(),
  });

  const displayProjectId = activeProject?.id || 'YOUR_PROJECT_ID';
  const projectApiKeys = activeProject
    ? apiKeys.filter((key) => key.project_id === activeProject.id)
    : apiKeys;
  const defaultApiKey = createdKey?.key || 'YOUR_QUICKBIT_LIVE_API_KEY';

  const widgetCdnUrl = 'https://cdn.quickbit.live/widget.js';

  const htmlSnippet = `<script
  src="${widgetCdnUrl}"
  data-api-key="${defaultApiKey}"
  async
></script>`;

  const npmSnippet = `npm install quickbit-widget`;

  const reactSnippet = `import { QuickBitWidget } from 'quickbit-widget';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        <QuickBitWidget
          apiKey="${defaultApiKey}"
          scriptUrl="${widgetCdnUrl}"
        />
      </body>
    </html>
  );
}`;

  const programmaticSnippet = `import { QuickBit } from 'quickbit-widget';

// Loads Iris and initializes the assistant / feedback collector
await QuickBit.init({
  apiKey: '${defaultApiKey}',
  scriptUrl: '${widgetCdnUrl}',
});

// Open the widget from anywhere in your app
QuickBit.show();

// Track a custom action or funnel event
QuickBit.track('checkout', 'submit_payment', 'success', { amount: 49 });`;

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    success('Copied to Clipboard', 'Integration code snippet copied.');
    setTimeout(() => setCopiedType(null), 2500);
  };

  const handleCreateKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyName.trim()) return;
    setIsCreatingKey(true);
    try {
      const key = await authService.createApiKey({
        name: newKeyName.trim(),
        project_id: displayProjectId !== 'YOUR_PROJECT_ID' ? displayProjectId : '',
      });
      setCreatedKey(key);
      success('API Key Created', 'Copy the QuickBit Live key now — it will only be shown once.');
      setNewKeyName('');
      refetchKeys();
    } catch (err: any) {
      showError('Failed to create key', err.message);
    } finally {
      setIsCreatingKey(false);
    }
  };

  const handleDeleteKey = async (keyId: string) => {
    try {
      await authService.deleteApiKey(keyId);
      success('API Key Revoked', 'The key has been deleted.');
      refetchKeys();
    } catch (err: any) {
      showError('Delete failed', err.message);
    }
  };

  return (
    <div className="p-4 lg:p-6 max-w-7xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-line-light dark:border-ink-2">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold tracking-tight text-ink dark:text-white flex items-center gap-2">
            <Plug className="w-6 h-6 text-brand dark:text-indigo-400" />
            Install QuickBit Live Feedback Widget
          </h1>
          <p className="text-xs text-muted dark:text-slate-400 mt-1">
            Customize Iris, embed the feedback collector into your web application, and manage API keys.
          </p>
        </div>

        {/* Pill-style tab switcher */}
        <div className="flex items-center p-1 bg-white dark:bg-ink-2 border border-line dark:border-slate-700 rounded-xl shadow-2xs">
          <button
            onClick={() => setActiveSection('customize')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              activeSection === 'customize'
                ? 'bg-brand text-white shadow-xs'
                : 'text-muted dark:text-slate-400 hover:text-ink dark:hover:text-white'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5 inline mr-1.5" />
            Customize Iris
          </button>
          <button
            onClick={() => setActiveSection('embed')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              activeSection === 'embed'
                ? 'bg-brand text-white shadow-xs'
                : 'text-muted dark:text-slate-400 hover:text-ink dark:hover:text-white'
            }`}
          >
            <Code2 className="w-3.5 h-3.5 inline mr-1.5" />
            Embed Code
          </button>
          <button
            onClick={() => setActiveSection('keys')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              activeSection === 'keys'
                ? 'bg-brand text-white shadow-xs'
                : 'text-muted dark:text-slate-400 hover:text-ink dark:hover:text-white'
            }`}
          >
            <Key className="w-3.5 h-3.5 inline mr-1.5" />
            API Keys
          </button>
        </div>
      </div>

      {/* ── Tab: Customize Iris (kept mounted so unsaved edits survive tab switches) ── */}
      <div className={`grid grid-cols-1 lg:grid-cols-12 gap-8 ${activeSection === 'customize' ? '' : 'hidden'}`}>
        <IrisWidgetConfigurator
          renderPreview={(state) => (
            <IrisPreview
              skin={state.skin}
              primaryColor={state.primaryColor}
              screenColor={state.screenColor}
              greeting={state.greeting}
              tone={state.tone}
              formality={state.formality}
            />
          )}
        />
      </div>

      {/* ── Tab: Embed Code ── */}
      {activeSection === 'embed' && (
        <div className="max-w-3xl space-y-6">
          {/* Standard HTML Script Tag */}
          <div className="p-6 bg-white dark:bg-ink border border-line-light dark:border-ink-2 rounded-2xl shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Code2 className="w-4 h-4 text-brand dark:text-indigo-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-ink dark:text-white">
                  Standard HTML Script Tag
                </h3>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(htmlSnippet, 'html')}
                leftIcon={
                  copiedType === 'html' ? <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />
                }
              >
                {copiedType === 'html' ? 'Copied' : 'Copy Snippet'}
              </Button>
            </div>

            <p className="text-xs text-muted dark:text-slate-400">
              Paste this snippet right before the closing{' '}
              <code className="font-mono bg-surface dark:bg-ink-2 text-brand dark:text-indigo-300 px-1.5 py-0.5 rounded-md border border-line dark:border-slate-700">
                &lt;/body&gt;
              </code>{' '}
              tag of your HTML. The script loads Iris from <code className="font-mono text-brand dark:text-indigo-300">{widgetCdnUrl}</code>{' '}
              and sends signals to your QuickBit Live API.
            </p>

            <pre className="p-4 bg-ink dark:bg-[#020617] border border-ink-2 dark:border-slate-800 text-indigo-200 rounded-xl font-mono text-xs overflow-x-auto leading-relaxed">
              {htmlSnippet}
            </pre>
          </div>

          {/* Install via npm / React */}
          <div className="p-6 bg-white dark:bg-ink border border-line-light dark:border-ink-2 rounded-2xl shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-brand dark:text-indigo-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-ink dark:text-white">
                  Install via npm (React / Next.js / Vue / Svelte)
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(npmSnippet, 'npm')}
                  leftIcon={
                    copiedType === 'npm' ? <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />
                  }
                >
                  {copiedType === 'npm' ? 'Copied' : 'Copy Install'}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(reactSnippet, 'react')}
                  leftIcon={
                    copiedType === 'react' ? <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />
                  }
                >
                  {copiedType === 'react' ? 'Copied' : 'Copy Component'}
                </Button>
              </div>
            </div>

            <p className="text-xs text-muted dark:text-slate-400">
              Install the published package from the npm registry and use the{' '}
              <code className="font-mono bg-surface dark:bg-ink-2 text-brand dark:text-indigo-300 px-1.5 py-0.5 rounded-md border border-line dark:border-slate-700">QuickBitWidget</code>{' '}
              component in your root layout — SSR-safe, no manual script injection needed.
            </p>

            <pre className="p-4 bg-ink dark:bg-[#020617] border border-ink-2 dark:border-slate-800 text-emerald-300 rounded-xl font-mono text-xs overflow-x-auto leading-relaxed">
              {npmSnippet}
            </pre>
            <pre className="p-4 bg-ink dark:bg-[#020617] border border-ink-2 dark:border-slate-800 text-indigo-200 rounded-xl font-mono text-xs overflow-x-auto leading-relaxed">
              {reactSnippet}
            </pre>
          </div>

          {/* Programmatic API */}
          <div className="p-6 bg-white dark:bg-ink border border-line-light dark:border-ink-2 rounded-2xl shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Code2 className="w-4 h-4 text-brand dark:text-indigo-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-ink dark:text-white">
                  Programmatic API (Any Framework)
                </h3>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(programmaticSnippet, 'programmatic')}
                leftIcon={
                  copiedType === 'programmatic' ? <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />
                }
              >
                {copiedType === 'programmatic' ? 'Copied' : 'Copy Code'}
              </Button>
            </div>

            <p className="text-xs text-muted dark:text-slate-400">
              Control the widget imperatively from anywhere in your frontend — open Iris, track custom actions and funnels, or teardown on route change.
            </p>

            <pre className="p-4 bg-ink dark:bg-[#020617] border border-ink-2 dark:border-slate-800 text-indigo-200 rounded-xl font-mono text-xs overflow-x-auto leading-relaxed">
              {programmaticSnippet}
            </pre>
          </div>
        </div>
      )}

      {/* ── Tab: API Keys ── */}
      {activeSection === 'keys' && (
        <div className="max-w-3xl space-y-6">
          <div className="p-6 bg-white dark:bg-ink border border-line-light dark:border-ink-2 rounded-2xl shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-ink dark:text-white flex items-center gap-2">
                  <Key className="w-4 h-4 text-brand dark:text-indigo-400" />
                  QuickBit Live Project API Keys
                </h3>
                <p className="text-xs text-muted dark:text-slate-400 mt-0.5">
                  Keys authenticate requests from your web widget and REST API webhooks. The secret is shown only once, immediately after creation.
                </p>
              </div>
            </div>

            {/* Generate key form */}
            <form onSubmit={handleCreateKey} className="flex gap-2">
              <Input
                placeholder="Key label (e.g. Production Web Widget)"
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
                className="flex-1"
              />
              <Button
                type="submit"
                variant="primary"
                size="md"
                isLoading={isCreatingKey}
                leftIcon={<Plus className="w-3.5 h-3.5" />}
              >
                Generate Key
              </Button>
            </form>

            {/* Keys List */}
            <div className="divide-y divide-line-light dark:divide-ink-2 border border-line-light dark:border-ink-2 rounded-xl overflow-hidden">
              {projectApiKeys.length === 0 ? (
                <div className="p-4 text-center text-xs text-muted dark:text-slate-400">
                  No API keys generated yet. Click Generate Key above to create one.
                </div>
              ) : (
                projectApiKeys.map((k) => (
                  <div
                    key={k.id}
                    className="p-3.5 flex items-center justify-between hover:bg-surface dark:hover:bg-ink-2/60 text-xs transition-colors"
                  >
                    <div className="space-y-0.5">
                      <div className="font-semibold text-ink dark:text-white">{k.name || 'API Key'}</div>
                      <div className="text-[11px] text-muted dark:text-slate-400">Secret stored securely — shown once at creation.</div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleDeleteKey(k.id)}
                        className="p-1 text-muted-light hover:text-rose-600 dark:hover:text-rose-400 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Created key modal */}
      <Modal
        isOpen={!!createdKey}
        onClose={() => setCreatedKey(null)}
        title="Copy your QuickBit Live API key"
        description="For your security, this secret will not be shown again after you close this dialog."
        footer={<Button variant="primary" size="sm" onClick={() => setCreatedKey(null)}>I've saved it</Button>}
      >
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-100">
          Store this key in a secure secret manager. Do not commit it to source control or share it publicly.
        </div>
        <div className="rounded-xl border border-line bg-surface p-3 font-mono text-xs break-all text-ink dark:border-slate-700 dark:bg-slate-900 dark:text-white">
          {createdKey?.key}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => createdKey?.key && copyToClipboard(createdKey.key, 'created-key')}
          leftIcon={copiedType === 'created-key' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
        >
          {copiedType === 'created-key' ? 'Copied' : 'Copy key'}
        </Button>
      </Modal>
    </div>
  );
};