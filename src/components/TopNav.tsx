import React from 'react';
import { Play, FolderOpen, Download, Terminal, Code2, Sliders, RefreshCw, Undo2, Sun, Moon } from 'lucide-react';
import { ViewTab } from '../types';

interface TopNavProps {
  activeTab: ViewTab;
  setActiveTab: (tab: ViewTab) => void;
  isRunning: boolean;
  onRunScript: () => void;
  onOpenFolder: () => void;
  onExportZip: () => void;
  onResetSandbox: () => void;
  onUndo: () => void;
  canUndo: boolean;
  onOpenConfig: () => void;
  onOpenCodeModal: () => void;
  movedCount: number;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

export const TopNav: React.FC<TopNavProps> = ({
  activeTab,
  setActiveTab,
  isRunning,
  onRunScript,
  onOpenFolder,
  onExportZip,
  onResetSandbox,
  onUndo,
  canUndo,
  onOpenConfig,
  onOpenCodeModal,
  movedCount,
  theme,
  onToggleTheme,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-neutral-200 dark:border-neutral-800 bg-white/90 dark:bg-neutral-950/90 backdrop-blur-md transition-colors duration-200">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
        {/* Zone 1: Single text wordmark */}
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
            <span className="font-mono text-sm font-bold">Py</span>
          </div>
          <span className="text-base font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
            PySort Studio
          </span>
          <span className="hidden sm:inline text-xs text-neutral-500 font-mono">
            JPG Media Organizer
          </span>
        </div>

        {/* Zone 2: Navigation Links / Primary Views */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          <button
            onClick={() => setActiveTab('explorer')}
            className={`transition-colors py-1 ${
              activeTab === 'explorer'
                ? 'text-neutral-900 dark:text-neutral-100 border-b-2 border-amber-500'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200'
            }`}
          >
            File Explorer
          </button>
          <button
            onClick={() => setActiveTab('terminal')}
            className={`flex items-center gap-1.5 transition-colors py-1 ${
              activeTab === 'terminal'
                ? 'text-neutral-900 dark:text-neutral-100 border-b-2 border-amber-500'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200'
            }`}
          >
            <Terminal className="h-3.5 w-3.5" />
            <span>Python Terminal</span>
          </button>
          <button
            onClick={onOpenCodeModal}
            className="flex items-center gap-1.5 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200 transition-colors py-1"
          >
            <Code2 className="h-3.5 w-3.5" />
            <span>Python Script</span>
          </button>
          <button
            onClick={onOpenConfig}
            className="flex items-center gap-1.5 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200 transition-colors py-1"
          >
            <Sliders className="h-3.5 w-3.5" />
            <span>Settings</span>
          </button>
        </nav>

        {/* Zone 3: Primary Actions */}
        <div className="flex items-center gap-2">
          {/* Light / Dark Mode Toggle */}
          <button
            onClick={onToggleTheme}
            title={theme === 'dark' ? 'Switch to White/Light mode' : 'Switch to Dark mode'}
            className="flex items-center justify-center w-8 h-8 rounded-md border border-neutral-300 dark:border-neutral-700/80 bg-neutral-100 dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 hover:text-neutral-950 dark:hover:text-white transition-colors"
            aria-label="Toggle color theme"
          >
            {theme === 'dark' ? (
              <Sun className="h-4 w-4 text-amber-400 hover:rotate-45 transition-transform" />
            ) : (
              <Moon className="h-4 w-4 text-neutral-700 hover:-rotate-12 transition-transform" />
            )}
          </button>

          {canUndo && (
            <button
              onClick={onUndo}
              title="Undo last file movements"
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:text-neutral-950 dark:hover:text-white bg-neutral-100 dark:bg-neutral-900 hover:bg-neutral-200 dark:hover:bg-neutral-800 rounded-md border border-neutral-300 dark:border-neutral-700/60 transition-colors"
            >
              <Undo2 className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Undo</span>
            </button>
          )}

          <button
            onClick={onResetSandbox}
            title="Reset sandbox files"
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200 bg-neutral-100/80 dark:bg-neutral-900/60 hover:bg-neutral-200/90 dark:hover:bg-neutral-800/80 rounded-md border border-neutral-300 dark:border-neutral-800 transition-colors"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span className="hidden lg:inline">Reset Sandbox</span>
          </button>

          <button
            onClick={onOpenFolder}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-800 dark:text-neutral-200 hover:text-black dark:hover:text-white bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-md border border-neutral-300 dark:border-neutral-700 transition-colors"
          >
            <FolderOpen className="h-3.5 w-3.5" />
            <span>Open Folder</span>
          </button>

          {movedCount > 0 && (
            <button
              onClick={onExportZip}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-amber-700 dark:text-amber-300 hover:text-amber-800 dark:hover:text-amber-200 bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-900/50 rounded-md border border-amber-300 dark:border-amber-600/40 transition-colors"
            >
              <Download className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Export ZIP</span>
            </button>
          )}

          <button
            onClick={onRunScript}
            disabled={isRunning}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-md transition-colors shadow-sm ${
              isRunning
                ? 'bg-neutral-300 dark:bg-neutral-800 text-neutral-500 cursor-not-allowed'
                : 'bg-amber-500 hover:bg-amber-400 text-neutral-950'
            }`}
          >
            <Play className={`h-3.5 w-3.5 fill-current ${isRunning ? 'animate-spin' : ''}`} />
            <span>{isRunning ? 'Running Script...' : 'Run Organize'}</span>
          </button>
        </div>
      </div>
    </header>
  );
};

