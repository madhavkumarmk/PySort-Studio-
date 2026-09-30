import React, { useRef, useEffect } from 'react';
import { Copy, Trash2, Check, Terminal, Play, FastForward, Pause } from 'lucide-react';
import { LogMessage } from '../types';

interface TerminalConsoleProps {
  logs: LogMessage[];
  isRunning: boolean;
  onClear: () => void;
  onRun: () => void;
  speed: 'instant' | 'normal' | 'slow';
  setSpeed: (speed: 'instant' | 'normal' | 'slow') => void;
}

export const TerminalConsole: React.FC<TerminalConsoleProps> = ({
  logs,
  isRunning,
  onClear,
  onRun,
  speed,
  setSpeed,
}) => {
  const terminalBottomRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = React.useState(false);

  useEffect(() => {
    terminalBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const handleCopyLogs = () => {
    const text = logs.map(l => l.text).join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const getLogColor = (type: LogMessage['type']) => {
    switch (type) {
      case 'command':
        return 'text-amber-400 font-semibold';
      case 'success':
        return 'text-emerald-400';
      case 'warning':
        return 'text-amber-300';
      case 'error':
        return 'text-rose-400';
      case 'dim':
        return 'text-neutral-500';
      default:
        return 'text-neutral-200';
    }
  };

  return (
    <div className="flex flex-col h-full rounded-lg border border-neutral-300 dark:border-neutral-800 bg-neutral-950 overflow-hidden shadow-lg dark:shadow-2xl transition-colors">
      {/* Terminal Title Bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-neutral-900/90 border-b border-neutral-800 select-none">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
          </div>
          <span className="text-xs font-mono text-neutral-400 ml-2 flex items-center gap-1.5">
            <Terminal className="w-3.5 h-3.5 text-neutral-500" />
            organize_jpg.py — bash session
          </span>
        </div>

        {/* Console Controls */}
        <div className="flex items-center gap-2">
          {/* Execution Speed Selector */}
          <div className="flex items-center gap-1 bg-neutral-950 p-0.5 rounded border border-neutral-800 text-[11px] font-mono">
            <button
              onClick={() => setSpeed('instant')}
              className={`px-2 py-0.5 rounded transition-colors ${
                speed === 'instant' ? 'bg-neutral-800 text-amber-300 font-semibold' : 'text-neutral-500 hover:text-neutral-300'
              }`}
              title="Execute instantly"
            >
              Instant
            </button>
            <button
              onClick={() => setSpeed('normal')}
              className={`px-2 py-0.5 rounded transition-colors ${
                speed === 'normal' ? 'bg-neutral-800 text-amber-300 font-semibold' : 'text-neutral-500 hover:text-neutral-300'
              }`}
              title="Simulated terminal output"
            >
              Live
            </button>
          </div>

          <button
            onClick={handleCopyLogs}
            disabled={logs.length === 0}
            className="flex items-center gap-1 px-2 py-1 text-xs text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 rounded transition-colors disabled:opacity-40"
            title="Copy terminal output"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span className="text-[11px] font-mono">{copied ? 'Copied' : 'Copy'}</span>
          </button>

          <button
            onClick={onClear}
            disabled={logs.length === 0}
            className="flex items-center gap-1 px-2 py-1 text-xs text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 rounded transition-colors disabled:opacity-40"
            title="Clear logs"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="text-[11px] font-mono">Clear</span>
          </button>

          <button
            onClick={onRun}
            disabled={isRunning}
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-mono font-medium text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded transition-colors disabled:opacity-40"
          >
            <Play className="w-3 h-3 fill-current" />
            <span>Run</span>
          </button>
        </div>
      </div>

      {/* Terminal Body */}
      <div className="flex-1 p-4 font-mono text-xs overflow-y-auto leading-relaxed space-y-1 select-text bg-neutral-950/80">
        {logs.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-neutral-600 space-y-2 select-none">
            <Terminal className="w-8 h-8 opacity-40" />
            <p className="text-neutral-500 text-xs">Ready for execution. Click "Run Organize" or test python script.</p>
            <p className="text-neutral-600 text-[11px]">Command: <span className="text-neutral-400">python organize_jpg.py</span></p>
          </div>
        ) : (
          logs.map((log) => (
            <div key={log.id} className={`flex items-start gap-2 ${getLogColor(log.type)}`}>
              <span className="select-none text-neutral-600 shrink-0 tabular-nums">
                {new Date(log.timestamp).toTimeString().split(' ')[0]}
              </span>
              <pre className="whitespace-pre-wrap font-mono flex-1 font-normal break-all">
                {log.text}
              </pre>
            </div>
          ))
        )}
        {isRunning && (
          <div className="flex items-center gap-2 text-amber-400 text-xs pt-1">
            <span className="w-1.5 h-3 bg-amber-400 animate-pulse" />
            <span className="text-neutral-500">Executing organize_jpg_files()...</span>
          </div>
        )}
        <div ref={terminalBottomRef} />
      </div>

      {/* Terminal Footer Info */}
      <div className="px-4 py-1.5 bg-neutral-900/60 border-t border-neutral-800/80 flex items-center justify-between text-[11px] font-mono text-neutral-500">
        <div className="flex items-center gap-3">
          <span>Python 3.12 (Standard Library: os, shutil)</span>
          <span>·</span>
          <span>Buffer: {logs.length} lines</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-500" />
          <span>Interpreter Ready</span>
        </div>
      </div>
    </div>
  );
};
