import React, { useState } from 'react';
import { Brain, Send, Trash2 } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Textarea } from '../../components/ui/Textarea';
import { Badge } from '../../components/ui/Badge';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { ragService } from '../../services/rag.service';
import { RAGQueryResponse } from '../../types/api';

export const RagQueryView: React.FC = () => {
  const { activeProject } = useAuth();
  const { success, error: showError } = useToast();

  const [question, setQuestion] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isInvalidating, setIsInvalidating] = useState(false);
  const [responseHistory, setResponseHistory] = useState<
    Array<{ question: string; response: RAGQueryResponse; timestamp: string }>
  >([]);

  const sampleQuestions = [
    'What are the most urgent customer pain points reported this month?',
    'Summarize all feature requests regarding third-party integrations and API export.',
    'Are there any recurring billing or churn concerns reported by enterprise users?',
    'What do customers praise most about our product experience?',
  ];

  const handleQuery = async (queryText?: string) => {
    const textToSubmit = queryText || question;
    if (!textToSubmit.trim() || !activeProject?.id) {
      if (!activeProject?.id) showError('Project Required', 'Please select a project first.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await ragService.query({
        project_id: activeProject.id,
        question: textToSubmit.trim(),
      });

      setResponseHistory((prev) => [
        {
          question: textToSubmit.trim(),
          response: res,
          timestamp: new Date().toLocaleTimeString(),
        },
        ...prev,
      ]);
      setQuestion('');
    } catch (err: any) {
      showError('RAG Query Failed', err.message || 'Error communicating with QuickBit Live RAG endpoint.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInvalidate = async () => {
    if (!activeProject?.id) return;
    setIsInvalidating(true);
    try {
      await ragService.invalidate(activeProject.id);
      success('Cache Invalidated', 'RAG knowledge index re-indexed with latest documents & signals.');
    } catch (err: any) {
      showError('Failed to invalidate cache', err.message);
    } finally {
      setIsInvalidating(false);
    }
  };

  return (
    <div className="p-4 lg:p-6 max-w-5xl mx-auto space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-line-light dark:border-ink-2">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold tracking-tight text-ink dark:text-white flex items-center gap-2">
            <Brain className="w-6 h-6 text-brand dark:text-indigo-400" />
            Product Knowledge RAG
          </h1>
          <p className="text-xs text-muted dark:text-slate-400 mt-1">
            Query across all customer feedback, project documents, decisions, and knowledge base.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={handleInvalidate}
          isLoading={isInvalidating}
          leftIcon={<Trash2 className="w-3.5 h-3.5" />}
          title="Invalidate and rebuild RAG vector cache for active project"
        >
          Invalidate Index Cache
        </Button>
      </div>

      {/* Query Form */}
      <div className="p-6 bg-white dark:bg-ink border border-line-light dark:border-ink-2 rounded-2xl shadow-2xs space-y-4">
        <Textarea
          placeholder="Ask a question about customer feedback, feature requests, or product issues..."
          rows={3}
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
              e.preventDefault();
              handleQuery();
            }
          }}
        />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 text-xs text-muted dark:text-slate-400">
            <span className="hidden sm:inline">Press</span>
            <kbd className="font-mono bg-surface dark:bg-ink-2 border border-line dark:border-slate-700 rounded-md px-1.5 py-0.5 text-[10px]">
              ⌘+Enter
            </kbd>
            <span className="hidden sm:inline">to submit</span>
          </div>

          <Button
            variant="primary"
            size="sm"
            onClick={() => handleQuery()}
            isLoading={isLoading}
            rightIcon={<Send className="w-3.5 h-3.5" />}
          >
            Ask RAG Engine
          </Button>
        </div>

        {/* Suggested Queries */}
        <div className="pt-3 border-t border-line-light dark:border-ink-2 space-y-2">
          <span className="text-[11px] font-bold text-muted dark:text-slate-400 uppercase tracking-wider block">
            Suggested Inquiries
          </span>
          <div className="flex flex-wrap gap-2">
            {sampleQuestions.map((q, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setQuestion(q);
                  handleQuery(q);
                }}
                className="text-xs px-3 py-1.5 bg-surface dark:bg-ink-2 hover:bg-brand-soft dark:hover:bg-indigo-950/40 border border-line dark:border-slate-700 hover:border-brand-border dark:hover:border-indigo-800/60 rounded-xl text-muted-strong dark:text-slate-300 hover:text-brand dark:hover:text-indigo-300 transition-colors text-left cursor-pointer font-medium"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Answers Stream */}
      {responseHistory.length > 0 && (
        <div className="space-y-4">
          <div className="text-xs font-bold text-muted dark:text-slate-400 uppercase tracking-wider px-1">
            Query Results ({responseHistory.length})
          </div>

          {responseHistory.map((item, idx) => (
            <div
              key={idx}
              className="p-6 bg-white dark:bg-ink border border-line-light dark:border-ink-2 rounded-2xl shadow-2xs space-y-4"
            >
              <div className="flex items-center justify-between text-xs pb-3 border-b border-line-light dark:border-ink-2">
                <div className="flex items-center gap-2">
                  <Badge variant="accent" size="sm">
                    Q
                  </Badge>
                  <span className="font-bold text-ink dark:text-white">{item.question}</span>
                </div>
                <span className="font-mono text-[11px] text-muted dark:text-slate-400">{item.timestamp}</span>
              </div>

              <div className="space-y-3">
                <div className="text-xs text-ink dark:text-slate-200 leading-relaxed whitespace-pre-wrap font-sans">
                  {item.response.answer || 'No direct answer returned.'}
                </div>

                {item.response.sources && item.response.sources.length > 0 && (
                  <div className="pt-3 border-t border-line-light dark:border-ink-2 space-y-2">
                    <span className="text-[11px] font-bold text-muted dark:text-slate-400 uppercase tracking-wider block">
                      Referenced Evidence Sources ({item.response.sources.length})
                    </span>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {item.response.sources.map((src: any, sIdx: number) => (
                        <div
                          key={sIdx}
                          className="p-3 bg-surface dark:bg-ink-2/60 border border-line dark:border-slate-800 rounded-xl text-xs space-y-1"
                        >
                          <div className="flex items-center justify-between text-[10px] text-muted dark:text-slate-400">
                            <span className="font-bold uppercase text-brand dark:text-indigo-400">
                              {src.source || src.title || 'Context Doc'}
                            </span>
                            {src.score && (
                              <span className="font-mono font-semibold">{Math.round(src.score * 100)}% Match</span>
                            )}
                          </div>
                          <p className="text-muted-strong dark:text-slate-300 line-clamp-3">
                            {src.content || src.text || 'No content available'}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
