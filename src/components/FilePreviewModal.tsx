import React from 'react';
import { X, Image, FileText, CheckCircle2, CornerDownRight, Download, Calendar, HardDrive, FileType } from 'lucide-react';
import { FileItem } from '../types';
import { formatBytes, formatDate } from '../utils/fileSystem';

interface FilePreviewModalProps {
  file: FileItem | null;
  onClose: () => void;
  destinationFolder: string;
}

export const FilePreviewModal: React.FC<FilePreviewModalProps> = ({
  file,
  onClose,
  destinationFolder,
}) => {
  if (!file) return null;

  const isImage = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg'].includes(file.extension.toLowerCase());

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 dark:bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-150">
      <div 
        className="w-full max-w-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] transition-colors"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950/70">
          <div className="flex items-center gap-2.5 min-w-0">
            {isImage ? <Image className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" /> : <FileText className="w-4 h-4 text-neutral-500 dark:text-neutral-400 shrink-0" />}
            <span className="text-xs font-mono font-medium text-neutral-900 dark:text-neutral-100 truncate">
              {file.name}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200 hover:bg-neutral-200/60 dark:hover:bg-neutral-800 rounded-md transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Preview Body */}
        <div className="p-5 overflow-y-auto space-y-4">
          {/* Main Visual Display */}
          <div className="w-full rounded-lg bg-neutral-100 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 flex items-center justify-center min-h-[260px] max-h-[420px] overflow-hidden relative">
            {file.thumbnailUrl ? (
              <img
                src={file.thumbnailUrl}
                alt={file.name}
                className="max-h-[380px] w-auto max-w-full object-contain"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="flex flex-col items-center justify-center gap-3 p-8 text-neutral-400 dark:text-neutral-500">
                <FileText className="w-16 h-16 stroke-1 text-neutral-400 dark:text-neutral-600" />
                <p className="font-mono text-xs">Binary / Non-visual File Asset</p>
                <p className="font-mono text-[11px] text-neutral-500 dark:text-neutral-600">Extension: .{file.extension}</p>
              </div>
            )}
          </div>

          {/* Metadata Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-neutral-50 dark:bg-neutral-950/80 p-3 rounded-lg border border-neutral-200 dark:border-neutral-800 text-xs font-mono">
            <div>
              <span className="text-[10px] text-neutral-500 uppercase flex items-center gap-1">
                <HardDrive className="w-3 h-3 text-neutral-400" />
                File Size
              </span>
              <div className="text-neutral-900 dark:text-neutral-200 tabular-nums font-semibold mt-1">
                {formatBytes(file.size)}
              </div>
            </div>

            <div>
              <span className="text-[10px] text-neutral-500 uppercase flex items-center gap-1">
                <FileType className="w-3 h-3 text-neutral-400" />
                Format
              </span>
              <div className="text-amber-600 dark:text-amber-400 uppercase font-semibold mt-1">
                .{file.extension}
              </div>
            </div>

            <div>
              <span className="text-[10px] text-neutral-500 uppercase flex items-center gap-1">
                <Calendar className="w-3 h-3 text-neutral-400" />
                Modified
              </span>
              <div className="text-neutral-800 dark:text-neutral-200 tabular-nums mt-1 text-[11px]">
                {formatDate(file.lastModified)}
              </div>
            </div>

            <div>
              <span className="text-[10px] text-neutral-500 uppercase flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-neutral-400" />
                Status
              </span>
              <div className="mt-1">
                {file.status === 'moved' ? (
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Organized</span>
                ) : (
                  <span className="text-neutral-500 dark:text-neutral-400">In Source</span>
                )}
              </div>
            </div>
          </div>

          {/* Path Resolution Box */}
          <div className="p-3 bg-neutral-50 dark:bg-neutral-950/50 rounded-lg border border-neutral-200 dark:border-neutral-800/80 text-xs font-mono space-y-1.5">
            <div className="flex items-center gap-2 text-neutral-600 dark:text-neutral-400">
              <span className="text-neutral-500">Source:</span>
              <span className="text-neutral-900 dark:text-neutral-300">./{file.originalFolder}/{file.name}</span>
            </div>
            <div className="flex items-center gap-2 text-neutral-600 dark:text-neutral-400">
              <span className="text-neutral-500">Destination:</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-medium">./{destinationFolder}/{file.name}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end px-5 py-3 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-mono font-medium text-neutral-700 dark:text-neutral-300 hover:text-neutral-950 dark:hover:text-white bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 rounded-md border border-neutral-300 dark:border-neutral-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
