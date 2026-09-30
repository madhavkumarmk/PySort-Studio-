import React from 'react';
import { Image, FileText, Video, Archive, FileCode, CheckCircle2, CornerDownRight, HelpCircle } from 'lucide-react';
import { FileItem } from '../types';
import { formatBytes, formatDate } from '../utils/fileSystem';

interface FileCardProps {
  file: FileItem;
  viewMode: 'grid' | 'table';
  onPreview: (file: FileItem) => void;
}

export const FileCard: React.FC<FileCardProps> = ({ file, viewMode, onPreview }) => {
  const isJpg = ['jpg', 'jpeg'].includes(file.extension.toLowerCase());

  const renderIcon = () => {
    switch (file.extension.toLowerCase()) {
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'webp':
      case 'gif':
      case 'svg':
      case 'cr2':
      case 'heic':
        return <Image className="w-4 h-4 text-amber-400" />;
      case 'mp4':
      case 'mov':
      case 'avi':
        return <Video className="w-4 h-4 text-sky-400" />;
      case 'zip':
      case 'tar':
      case 'gz':
        return <Archive className="w-4 h-4 text-purple-400" />;
      case 'pdf':
      case 'txt':
      case 'doc':
        return <FileText className="w-4 h-4 text-rose-400" />;
      default:
        return <FileCode className="w-4 h-4 text-neutral-400" />;
    }
  };

  if (viewMode === 'table') {
    return (
      <tr
        onClick={() => onPreview(file)}
        className="group border-b border-neutral-200 dark:border-neutral-800/60 hover:bg-neutral-100/70 dark:hover:bg-neutral-900/60 cursor-pointer transition-colors text-xs"
      >
        <td className="py-2.5 px-3">
          <div className="flex items-center gap-2.5">
            {file.thumbnailUrl ? (
              <div className="w-7 h-7 rounded overflow-hidden bg-neutral-100 dark:bg-neutral-900 shrink-0 border border-neutral-200 dark:border-neutral-800">
                <img
                  src={file.thumbnailUrl}
                  alt={file.name}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
            ) : (
              <div className="w-7 h-7 rounded bg-neutral-100 dark:bg-neutral-900 flex items-center justify-center shrink-0 border border-neutral-200 dark:border-neutral-800">
                {renderIcon()}
              </div>
            )}
            <div className="min-w-0">
              <p className="font-mono text-neutral-900 dark:text-neutral-200 truncate group-hover:text-amber-600 dark:group-hover:text-amber-300 transition-colors">
                {file.name}
              </p>
              {file.status === 'moved' && (
                <p className="text-[10px] text-neutral-500 dark:text-neutral-400 font-mono flex items-center gap-1">
                  <CornerDownRight className="w-2.5 h-2.5 text-emerald-600 dark:text-emerald-400" />
                  <span>{file.targetFolder}</span>
                </p>
              )}
            </div>
          </div>
        </td>
        <td className="py-2.5 px-3 font-mono uppercase text-neutral-600 dark:text-neutral-400">
          .{file.extension}
        </td>
        <td className="py-2.5 px-3 font-mono tabular-nums text-neutral-600 dark:text-neutral-400 text-right">
          {formatBytes(file.size)}
        </td>
        <td className="py-2.5 px-3 font-mono tabular-nums text-neutral-500 dark:text-neutral-500 text-right hidden sm:table-cell">
          {formatDate(file.lastModified)}
        </td>
        <td className="py-2.5 px-3 text-right">
          {file.status === 'moved' ? (
            <span className="text-emerald-600 dark:text-emerald-400 font-mono text-[11px] inline-flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              <span>Moved</span>
            </span>
          ) : isJpg ? (
            <span className="text-amber-600 dark:text-amber-400 font-mono text-[11px]">
              Ready
            </span>
          ) : (
            <span className="text-neutral-400 dark:text-neutral-500 font-mono text-[11px]">
              Ignored
            </span>
          )}
        </td>
      </tr>
    );
  }

  // Grid Card View
  return (
    <div
      onClick={() => onPreview(file)}
      className="group relative flex flex-col bg-white dark:bg-neutral-900/50 hover:bg-neutral-50 dark:hover:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700/80 rounded-lg overflow-hidden cursor-pointer transition-all duration-150 shadow-xs"
    >
      {/* Thumbnail area */}
      <div className="aspect-[4/3] w-full bg-neutral-100 dark:bg-neutral-950 flex items-center justify-center relative overflow-hidden border-b border-neutral-200 dark:border-neutral-800/80">
        {file.thumbnailUrl ? (
          <img
            src={file.thumbnailUrl}
            alt={file.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="flex flex-col items-center justify-center gap-1.5 p-4 text-neutral-400 dark:text-neutral-600">
            {renderIcon()}
            <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-500">
              .{file.extension}
            </span>
          </div>
        )}

        {/* Status watermark */}
        <div className="absolute top-2 right-2 flex items-center gap-1 bg-white/90 dark:bg-neutral-950/80 backdrop-blur-sm px-1.5 py-0.5 rounded text-[10px] font-mono border border-neutral-200 dark:border-neutral-800 shadow-xs">
          {file.status === 'moved' ? (
            <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              <span>Organized</span>
            </span>
          ) : isJpg ? (
            <span className="text-amber-600 dark:text-amber-400 font-semibold">.jpg</span>
          ) : (
            <span className="text-neutral-500 dark:text-neutral-400">skip</span>
          )}
        </div>
      </div>

      {/* Info details */}
      <div className="p-2.5 flex flex-col gap-1">
        <p className="text-xs font-mono text-neutral-900 dark:text-neutral-200 truncate group-hover:text-amber-600 dark:group-hover:text-amber-300 transition-colors" title={file.name}>
          {file.name}
        </p>

        {/* Clean unboxed metadata separated by · */}
        <div className="flex items-center gap-1.5 text-[11px] text-neutral-500 font-mono tabular-nums">
          <span>{formatBytes(file.size)}</span>
          <span aria-hidden="true">·</span>
          <span>{file.extension.toUpperCase()}</span>
          {file.status === 'moved' && (
            <>
              <span aria-hidden="true">·</span>
              <span className="text-emerald-600 dark:text-emerald-500 truncate">{file.targetFolder}</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
