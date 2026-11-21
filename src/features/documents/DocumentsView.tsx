import React, { useState, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Database, Upload, FileText, Trash2 } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { TableSkeleton } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { ErrorState } from '../../components/ui/ErrorState';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { uploadService } from '../../services/upload.service';
import { ProjectDocument } from '../../types/api';

export const DocumentsView: React.FC = () => {
  const { activeProject } = useAuth();
  const { success, error: showError } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const projectId = activeProject?.id || '';

  const {
    data: documents = [],
    isLoading,
    error,
    refetch,
  } = useQuery<ProjectDocument[]>({
    queryKey: ['project-documents', projectId],
    queryFn: () => uploadService.listProjectDocuments(projectId),
    enabled: !!projectId,
  });

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0 || !projectId) return;

    setIsUploading(true);
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const isValid =
          file.type === 'application/pdf' ||
          file.type === 'text/markdown' ||
          /\.(pdf|md|markdown)$/i.test(file.name);
        if (!isValid) {
          showError('Unsupported File', `${file.name} — only PDF and Markdown are supported.`);
          continue;
        }
        if (file.size > 10 * 1024 * 1024) {
          showError('File Too Large', `${file.name} — maximum size is 10MB.`);
          continue;
        }
        await uploadService.uploadProjectDocument(projectId, file);
      }
      success('Document Uploaded', 'Document sent to QuickBit Live knowledge base for indexing.');
      refetch();
    } catch (err: any) {
      showError('Upload Failed', err.message || 'Error uploading document.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDelete = async (docId: string) => {
    if (!projectId) return;
    try {
      await uploadService.deleteProjectDocument(projectId, docId);
      success('Document Deleted', 'Removed from project knowledge index.');
      refetch();
    } catch (err: any) {
      showError('Delete Failed', err.message);
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'Unknown size';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="p-4 lg:p-6 max-w-7xl mx-auto space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-line-light dark:border-ink-2">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold tracking-tight text-ink dark:text-white flex items-center gap-2">
            <Database className="w-6 h-6 text-brand dark:text-indigo-400" />
            Knowledge Base & Documents
          </h1>
          <p className="text-xs text-muted dark:text-slate-400 mt-1">
            Upload PRDs, architecture specifications, user interview transcripts, and customer research.
          </p>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.md,.markdown,application/pdf,text/markdown"
          className="hidden"
          onChange={(e) => handleFileUpload(e.target.files)}
        />

        <Button
          variant="primary"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          isLoading={isUploading}
          leftIcon={<Upload className="w-3.5 h-3.5" />}
        >
          Upload Documents
        </Button>
      </div>

      {/* Drag & drop upload target */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          handleFileUpload(e.dataTransfer.files);
        }}
        onClick={() => fileInputRef.current?.click()}
        className={`p-8 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
          isDragging
            ? 'border-brand bg-brand-soft dark:bg-indigo-950/30'
            : 'border-[#CBD5E1] dark:border-slate-700 bg-white dark:bg-ink hover:border-brand dark:hover:border-indigo-500 hover:bg-surface dark:hover:bg-ink-2/40'
        }`}
      >
        <div className="p-3 bg-brand-soft dark:bg-indigo-950/60 border border-brand-border dark:border-indigo-800/60 rounded-2xl text-brand dark:text-indigo-400 mb-3 shadow-2xs">
          <Upload className="w-5 h-5" />
        </div>
        <div className="text-sm font-bold text-ink dark:text-white">
          Click to upload or drag and drop
        </div>
        <p className="text-xs text-muted dark:text-slate-400 mt-1">
          Supports PDF and Markdown (Max 10MB per file)
        </p>
      </div>

      {/* Documents List */}
      {isLoading ? (
        <TableSkeleton rows={4} columns={4} />
      ) : error ? (
        <ErrorState
          title="Could not load documents"
          message="Failed to retrieve documents for this project."
          onRetry={() => refetch()}
        />
      ) : documents.length === 0 ? (
        <EmptyState
          icon={<FileText className="w-8 h-8 text-muted-light dark:text-slate-500" />}
          title="No documents uploaded"
          description="Upload product specifications, user transcripts, or support manuals to ground your AI engine."
          actionLabel="Upload First Document"
          onAction={() => fileInputRef.current?.click()}
        />
      ) : (
        <div className="border border-line-light dark:border-ink-2 rounded-2xl bg-white dark:bg-ink overflow-hidden shadow-2xs">
          <div className="flex items-center justify-between p-4 border-b border-line-light dark:border-ink-2 bg-surface dark:bg-ink-2/60 text-xs font-bold text-muted dark:text-slate-400 uppercase tracking-wider">
            <span className="flex-1">Document Name</span>
            <span className="w-32 hidden sm:block">Size</span>
            <span className="w-32 hidden md:block">Status</span>
            <span className="w-32 hidden sm:block">Date</span>
            <span className="w-16 text-right">Action</span>
          </div>

          <div className="divide-y divide-line-light dark:divide-ink-2">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center justify-between p-4 hover:bg-surface dark:hover:bg-ink-2/60 transition-colors text-xs"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0 pr-4">
                  <FileText className="w-4 h-4 text-brand dark:text-indigo-400 shrink-0" />
                  <span className="font-semibold text-ink dark:text-white truncate">
                    {doc.filename || doc.title || 'Document'}
                  </span>
                </div>

                <div className="w-32 text-muted dark:text-slate-400 font-mono hidden sm:block font-medium">
                  {formatFileSize(doc.file_size)}
                </div>

                <div className="w-32 hidden md:block">
                  <Badge variant={doc.status === 'ready' || doc.status === 'indexed' ? 'success' : 'neutral'} size="sm">
                    {doc.status || 'indexed'}
                  </Badge>
                </div>

                <div className="w-32 text-muted dark:text-slate-400 font-mono hidden sm:block font-medium">
                  {doc.created_at ? new Date(doc.created_at).toLocaleDateString() : 'Recent'}
                </div>

                <div className="w-16 text-right">
                  <button
                    onClick={() => handleDelete(doc.id)}
                    className="p-1 text-muted-light hover:text-rose-600 dark:hover:text-rose-400 transition-colors cursor-pointer"
                    title="Delete document"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
