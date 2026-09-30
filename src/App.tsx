import React, { useState, useEffect, useCallback, useRef } from 'react';
import confetti from 'canvas-confetti';
import { TopNav } from './components/TopNav';
import { TerminalConsole } from './components/TerminalConsole';
import { FileExplorer } from './components/FileExplorer';
import { ConfigPanel } from './components/ConfigPanel';
import { CodeExportModal } from './components/CodeExportModal';
import { FilePreviewModal } from './components/FilePreviewModal';
import { FileItem, OrganizeConfig, LogMessage, ViewTab } from './types';
import { getDefaultSampleFiles } from './utils/sampleData';
import { 
  pickNativeDirectory, 
  parseFileList, 
  exportOrganizedZip, 
  downloadBlob, 
  getFileExtension 
} from './utils/fileSystem';

const DEFAULT_CONFIG: OrganizeConfig = {
  sourceDirName: 'Media_Source',
  destinationFolderName: 'Organized_Jpg_Files',
  targetExtensions: ['jpg', 'jpeg'],
  action: 'move',
  organizationMode: 'flat',
  conflictResolution: 'rename',
  recursive: false,
  caseInsensitive: true,
};

export default function App() {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('pysort_theme');
    if (saved === 'light' || saved === 'dark') return saved;
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  });

  const [files, setFiles] = useState<FileItem[]>(() => getDefaultSampleFiles());
  const [config, setConfig] = useState<OrganizeConfig>(DEFAULT_CONFIG);
  const [logs, setLogs] = useState<LogMessage[]>([]);
  const [activeTab, setActiveTab] = useState<ViewTab>('explorer');
  const [isRunning, setIsRunning] = useState(false);
  const [speed, setSpeed] = useState<'instant' | 'normal' | 'slow'>('normal');
  const [canUndo, setCanUndo] = useState(false);
  const [history, setHistory] = useState<FileItem[][]>([]);

  // Modals
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [isCodeModalOpen, setIsCodeModalOpen] = useState(false);
  const [previewFile, setPreviewFile] = useState<FileItem | null>(null);

  // Hidden folder input fallback
  const folderInputRef = useRef<HTMLInputElement>(null);

  // Sync theme with html root class
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('pysort_theme', theme);
  }, [theme]);

  // Initial welcome log
  useEffect(() => {
    setLogs([
      {
        id: 'init-1',
        text: 'Python 3.12.2 (tags/v3.12.2:6abddd9, Oct 2026)',
        type: 'dim',
        timestamp: Date.now() - 2000,
      },
      {
        id: 'init-2',
        text: '$ python organize_jpg.py',
        type: 'command',
        timestamp: Date.now() - 1000,
      },
      {
        id: 'init-3',
        text: 'Interactive environment ready. 12 sample files loaded in sandbox.',
        type: 'info',
        timestamp: Date.now(),
      }
    ]);
  }, []);

  const addLog = useCallback((text: string, type: LogMessage['type'] = 'info') => {
    setLogs(prev => [
      ...prev,
      {
        id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        text,
        type,
        timestamp: Date.now(),
      }
    ]);
  }, []);

  // Check how many files have been moved
  const movedCount = files.filter(f => f.status === 'moved').length;

  /**
   * Run the Python Organization Automation
   */
  const handleRunScript = useCallback(async () => {
    if (isRunning) return;

    // Save current state for undo
    setHistory(prev => [...prev, JSON.parse(JSON.stringify(files))]);
    setCanUndo(true);
    setIsRunning(true);

    const sourcePath = config.sourceDirName || 'Source_Folder';
    const destPath = config.destinationFolderName || 'Organized_Jpg_Files';

    addLog(`\n$ python organize_jpg.py`, 'command');
    addLog(`Enter the path of the source folder (leave blank for current directory): ${sourcePath}`, 'info');

    // Simulate directory creation log if destination empty
    const currentMoved = files.filter(f => f.status === 'moved').length;
    if (currentMoved === 0) {
      addLog(`Created destination folder: ${sourcePath}/${destPath}`, 'success');
    }

    const actionText = config.action === 'copy' ? 'copying' : 'moving';
    const extsDisplay = config.targetExtensions.map(e => `.${e}`).join(', ');
    addLog(`\nScanning and ${actionText} ${extsDisplay} files...`, 'info');

    const delay = speed === 'instant' ? 0 : speed === 'slow' ? 350 : 120;

    let localMovedCount = 0;
    const updatedFiles = [...files];

    for (let i = 0; i < updatedFiles.length; i++) {
      const file = updatedFiles[i];

      // Check if matches configured target extensions
      const isMatch = config.targetExtensions.some(ext => 
        file.extension.toLowerCase() === ext.toLowerCase()
      );

      if (isMatch && file.status !== 'moved') {
        if (delay > 0) {
          await new Promise(r => setTimeout(r, delay));
        }

        updatedFiles[i] = {
          ...file,
          status: 'moved',
          targetFolder: destPath,
          movedAt: Date.now(),
        };

        const actionWord = config.action === 'copy' ? 'Copied' : 'Moved';
        addLog(`${actionWord}: ${file.name} -> ${destPath}`, 'success');
        localMovedCount++;
        
        // Update files incrementally if running in animated mode
        if (delay > 0) {
          setFiles([...updatedFiles]);
        }
      }
    }

    // Final state commit
    setFiles(updatedFiles);

    addLog(`\n==============================`, 'dim');
    addLog(`Automation Complete! Total files ${actionText}: ${localMovedCount}`, 'success');
    addLog(`==============================`, 'dim');

    setIsRunning(false);

    if (localMovedCount > 0) {
      try {
        confetti({
          particleCount: 40,
          spread: 50,
          origin: { y: 0.8 },
          colors: ['#f59e0b', '#10b981', '#3b82f6'],
        });
      } catch {
        // Confetti silent fallback
      }
    }
  }, [isRunning, files, config, speed, addLog]);

  /**
   * Undo Last Move
   */
  const handleUndo = useCallback(() => {
    if (history.length === 0) return;
    const lastState = history[history.length - 1];
    setFiles(lastState);
    setHistory(prev => prev.slice(0, -1));
    if (history.length <= 1) setCanUndo(false);
    addLog(`[REVERT] Undid last file operation. Restored ${lastState.length} files to source.`, 'warning');
  }, [history, addLog]);

  /**
   * Reset Sandbox to Default Mock Files
   */
  const handleResetSandbox = useCallback(() => {
    const samples = getDefaultSampleFiles();
    setFiles(samples);
    setHistory([]);
    setCanUndo(false);
    addLog(`[RESET] Sandbox refreshed with fresh sample photos & media.`, 'info');
  }, [addLog]);

  /**
   * Open Local Folder (Native File System Access API or input fallback)
   */
  const handleOpenFolder = useCallback(async () => {
    if ('showDirectoryPicker' in window) {
      try {
        const { dirHandle, files: loadedFiles } = await pickNativeDirectory();
        if (loadedFiles.length > 0) {
          setFiles(loadedFiles);
          setConfig(prev => ({
            ...prev,
            sourceDirName: dirHandle.name,
          }));
          setHistory([]);
          setCanUndo(false);
          addLog(`[MOUNT] Opened local folder: "${dirHandle.name}" (${loadedFiles.length} files loaded)`, 'success');
          setActiveTab('explorer');
        }
      } catch (err: unknown) {
        if ((err as Error).name !== 'AbortError') {
          // Fallback to standard input
          folderInputRef.current?.click();
        }
      }
    } else {
      folderInputRef.current?.click();
    }
  }, [addLog]);

  /**
   * Fallback folder input change handler
   */
  const handleFolderInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const parsed = await parseFileList(e.target.files);
      const folderName = e.target.files[0]?.webkitRelativePath?.split('/')[0] || 'Uploaded_Folder';
      setFiles(parsed);
      setConfig(prev => ({ ...prev, sourceDirName: folderName }));
      setHistory([]);
      setCanUndo(false);
      addLog(`[MOUNT] Loaded ${parsed.length} files from "${folderName}"`, 'success');
      setActiveTab('explorer');
    }
  };

  /**
   * Add a single custom file or drop
   */
  const handleAddCustomFile = useCallback(async (file: File) => {
    const ext = getFileExtension(file.name);
    let thumbnailUrl: string | undefined = undefined;
    if (['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg'].includes(ext)) {
      try {
        thumbnailUrl = URL.createObjectURL(file);
      } catch {
        // ignore
      }
    }

    const newFile: FileItem = {
      id: `custom-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      name: file.name,
      originalName: file.name,
      extension: ext,
      size: file.size,
      lastModified: file.lastModified,
      realFile: file,
      thumbnailUrl,
      status: 'pending',
      originalFolder: config.sourceDirName || 'Source_Folder',
      targetFolder: config.destinationFolderName || 'Organized_Jpg_Files',
    };

    setFiles(prev => [newFile, ...prev]);
    addLog(`Added file to source: ${file.name}`, 'info');
  }, [config, addLog]);

  /**
   * Export Organized ZIP
   */
  const handleExportZip = useCallback(async () => {
    try {
      addLog('Compressing organized files into ZIP archive...', 'info');
      const zipBlob = await exportOrganizedZip(files, config);
      const zipFilename = `${config.destinationFolderName || 'Organized_Jpg_Files'}.zip`;
      downloadBlob(zipBlob, zipFilename);
      addLog(`[DOWNLOAD] Successfully generated ${zipFilename}`, 'success');
    } catch (err) {
      addLog(`[ERROR] Failed to export ZIP: ${(err as Error).message}`, 'error');
    }
  }, [files, config, addLog]);

  return (
    <div className="min-h-screen flex flex-col bg-neutral-950 text-neutral-100 selection:bg-amber-500/20 selection:text-amber-200">
      {/* Hidden folder input fallback */}
      <input
        type="file"
        ref={folderInputRef}
        onChange={handleFolderInputChange}
        // @ts-expect-error - webkitdirectory standard attribute for folder selection
        webkitdirectory="true"
        directory="true"
        multiple
        className="hidden"
      />

      {/* Top Bar Contract Header */}
      <TopNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isRunning={isRunning}
        onRunScript={handleRunScript}
        onOpenFolder={handleOpenFolder}
        onExportZip={handleExportZip}
        onResetSandbox={handleResetSandbox}
        onUndo={handleUndo}
        canUndo={canUndo}
        onOpenConfig={() => setIsConfigOpen(true)}
        onOpenCodeModal={() => setIsCodeModalOpen(true)}
        movedCount={movedCount}
        theme={theme}
        onToggleTheme={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}
      />

      {/* Main Viewport Container */}
      <main className="flex-1 w-full max-w-7xl mx-auto p-4 sm:p-6 flex flex-col gap-6">
        {/* Workspace Title & Python Script Context */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-neutral-200 dark:border-neutral-800 pb-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
              Photo &amp; Media Sorter Automation
            </h1>
            <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 mt-1">
              Automates scanning <code className="text-amber-700 dark:text-amber-300 font-mono">.jpg</code> files and moving them into{' '}
              <code className="text-amber-700 dark:text-amber-300 font-mono">{config.destinationFolderName}</code> with Python standard library.
            </p>
          </div>

          {/* Quick Stats & Action Pills as unboxed metadata */}
          <div className="flex items-center gap-2 text-xs font-mono text-neutral-500 dark:text-neutral-400">
            <span>Extensions: <span className="text-neutral-800 dark:text-neutral-200">{config.targetExtensions.map(e => `.${e}`).join(', ')}</span></span>
            <span aria-hidden="true">·</span>
            <span>Operation: <span className="text-neutral-800 dark:text-neutral-200">{config.action === 'move' ? 'shutil.move' : 'shutil.copy2'}</span></span>
            <span aria-hidden="true">·</span>
            <button
              onClick={() => setIsConfigOpen(true)}
              className="text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 underline underline-offset-2 transition-colors"
            >
              Configure
            </button>
          </div>
        </div>

        {/* Dynamic Workspace View */}
        {activeTab === 'explorer' ? (
          <FileExplorer
            files={files}
            config={config}
            onPreviewFile={(file) => setPreviewFile(file)}
            onOpenFolder={handleOpenFolder}
            onExportZip={handleExportZip}
            onAddCustomFile={handleAddCustomFile}
            movedCount={movedCount}
          />
        ) : (
          <div className="flex-1 min-h-[500px] flex flex-col">
            <TerminalConsole
              logs={logs}
              isRunning={isRunning}
              onClear={() => setLogs([])}
              onRun={handleRunScript}
              speed={speed}
              setSpeed={setSpeed}
            />
          </div>
        )}

        {/* Pinned Bottom Mini-Terminal (Visible in Explorer mode for immediate feedback) */}
        {activeTab === 'explorer' && (
          <div className="mt-2 border border-neutral-200 dark:border-neutral-800/80 rounded-lg overflow-hidden bg-white dark:bg-neutral-950 shadow-xs transition-colors">
            <div className="flex items-center justify-between px-3 py-1.5 bg-neutral-50 dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 text-[11px] font-mono text-neutral-600 dark:text-neutral-400">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                <span>Console Log (Python Automation Output)</span>
              </div>
              <button
                onClick={() => setActiveTab('terminal')}
                className="text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 transition-colors"
              >
                Expand Terminal &rarr;
              </button>
            </div>
            <div className="p-3 max-h-32 overflow-y-auto font-mono text-xs text-neutral-800 dark:text-neutral-300 space-y-1">
              {logs.slice(-4).map(l => (
                <div key={l.id} className="truncate">
                  <span className="text-neutral-400 dark:text-neutral-600 select-none mr-2">
                    {new Date(l.timestamp).toTimeString().split(' ')[0]}
                  </span>
                  <span>{l.text}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Modals */}
      <ConfigPanel
        isOpen={isConfigOpen}
        onClose={() => setIsConfigOpen(false)}
        config={config}
        onChangeConfig={setConfig}
        onResetDefaults={() => setConfig(DEFAULT_CONFIG)}
      />

      <CodeExportModal
        isOpen={isCodeModalOpen}
        onClose={() => setIsCodeModalOpen(false)}
        config={config}
      />

      <FilePreviewModal
        file={previewFile}
        onClose={() => setPreviewFile(null)}
        destinationFolder={config.destinationFolderName}
      />
    </div>
  );
}
