import React, { useState } from 'react';
import { X, Copy, Check, Download, Terminal, Code, FileCode } from 'lucide-react';
import { OrganizeConfig } from '../types';
import { generatePythonScript, generateBashScript, generatePowerShellScript } from '../utils/scriptGenerator';

interface CodeExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: OrganizeConfig;
}

export const CodeExportModal: React.FC<CodeExportModalProps> = ({
  isOpen,
  onClose,
  config,
}) => {
  const [activeLang, setActiveLang] = useState<'python' | 'bash' | 'powershell'>('python');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const getCode = () => {
    switch (activeLang) {
      case 'python':
        return generatePythonScript(config);
      case 'bash':
        return generateBashScript(config);
      case 'powershell':
        return generatePowerShellScript(config);
    }
  };

  const getFilename = () => {
    switch (activeLang) {
      case 'python':
        return 'organize_jpg_files.py';
      case 'bash':
        return 'organize_jpg_files.sh';
      case 'powershell':
        return 'organize_jpg_files.ps1';
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(getCode());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const code = getCode();
    const blob = new Blob([code], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = getFilename();
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const lines = getCode().split('\n');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 dark:bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div 
        className="w-full max-w-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] transition-colors"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950/70">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 p-1 bg-neutral-200/70 dark:bg-neutral-900 rounded-lg border border-neutral-300 dark:border-neutral-800">
              <button
                onClick={() => setActiveLang('python')}
                className={`flex items-center gap-1.5 px-3 py-1 text-xs font-mono rounded transition-colors ${
                  activeLang === 'python'
                    ? 'bg-amber-500 text-neutral-950 font-semibold shadow-xs'
                    : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200'
                }`}
              >
                <Code className="w-3.5 h-3.5" />
                <span>Python (.py)</span>
              </button>

              <button
                onClick={() => setActiveLang('bash')}
                className={`flex items-center gap-1.5 px-3 py-1 text-xs font-mono rounded transition-colors ${
                  activeLang === 'bash'
                    ? 'bg-amber-500 text-neutral-950 font-semibold shadow-xs'
                    : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200'
                }`}
              >
                <Terminal className="w-3.5 h-3.5" />
                <span>Bash (.sh)</span>
              </button>

              <button
                onClick={() => setActiveLang('powershell')}
                className={`flex items-center gap-1.5 px-3 py-1 text-xs font-mono rounded transition-colors ${
                  activeLang === 'powershell'
                    ? 'bg-amber-500 text-neutral-950 font-semibold shadow-xs'
                    : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200'
                }`}
              >
                <FileCode className="w-3.5 h-3.5" />
                <span>PowerShell (.ps1)</span>
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono text-neutral-700 dark:text-neutral-200 hover:text-neutral-950 dark:hover:text-white bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 rounded-md border border-neutral-300 dark:border-neutral-700 transition-colors shadow-xs"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied!' : 'Copy Code'}</span>
            </button>

            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-medium text-amber-700 dark:text-amber-300 hover:text-amber-800 dark:hover:text-amber-200 bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-900/50 rounded-md border border-amber-300 dark:border-amber-600/40 transition-colors shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download {getFilename()}</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200 hover:bg-neutral-200/60 dark:hover:bg-neutral-800 rounded-md transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Code View with Tabular Line Numbers */}
        <div className="flex-1 overflow-y-auto bg-neutral-950 p-4 font-mono text-xs leading-relaxed">
          <div className="flex">
            <div className="select-none pr-4 text-right text-neutral-600 tabular-nums border-r border-neutral-800/80">
              {lines.map((_, i) => (
                <div key={i}>{i + 1}</div>
              ))}
            </div>
            <pre className="pl-4 text-neutral-200 overflow-x-auto flex-1 font-mono">
              <code>{getCode()}</code>
            </pre>
          </div>
        </div>

        {/* Footer command instruction */}
        <div className="px-5 py-3 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs font-mono text-neutral-600 dark:text-neutral-400">
          <div className="flex items-center gap-2">
            <span className="text-neutral-500">Run locally:</span>
            <code className="px-2 py-0.5 bg-neutral-200/80 dark:bg-neutral-900 rounded border border-neutral-300 dark:border-neutral-800 text-amber-700 dark:text-amber-300">
              {activeLang === 'python'
                ? 'python organize_jpg_files.py'
                : activeLang === 'bash'
                ? 'bash organize_jpg_files.sh'
                : 'powershell -ExecutionPolicy Bypass -File organize_jpg_files.ps1'}
            </code>
          </div>
          <span className="text-neutral-500 text-[11px]">
            Uses standard library only (no pip install required)
          </span>
        </div>
      </div>
    </div>
  );
};
