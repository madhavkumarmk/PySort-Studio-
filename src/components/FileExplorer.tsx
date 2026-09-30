import React, { useState, useMemo } from 'react';
import { 
  Folder, 
  FolderCheck, 
  Search, 
  Grid, 
  List, 
  ArrowRight, 
  FolderPlus,
  Filter,
  CheckCircle2,
  FileQuestion,
  Download,
  Upload
} from 'lucide-react';
import { FileItem, OrganizeConfig } from '../types';
import { FileCard } from './FileCard';
import { formatBytes } from '../utils/fileSystem';

interface FileExplorerProps {
  files: FileItem[];
  config: OrganizeConfig;
  onPreviewFile: (file: FileItem) => void;
  onOpenFolder: () => void;
  onExportZip: () => void;
  onAddCustomFile: (file: File) => void;
  movedCount: number;
}

export const FileExplorer: React.FC<FileExplorerProps> = ({
  files,
  config,
  onPreviewFile,
  onOpenFolder,
  onExportZip,
  onAddCustomFile,
  movedCount,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [extFilter, setExtFilter] = useState<'all' | 'jpg' | 'other'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [activePane, setActivePane] = useState<'all' | 'source' | 'destination'>('all');

  const sourceFiles = useMemo(() => {
    return files.filter(f => f.status !== 'moved');
  }, [files]);

  const destinationFiles = useMemo(() => {
    return files.filter(f => f.status === 'moved');
  }, [files]);

  // Filtered lists based on search & extension
  const filterList = (list: FileItem[]) => {
    return list.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
      const isTargetExt = config.targetExtensions.map(e => e.toLowerCase()).includes(item.extension.toLowerCase());
      if (extFilter === 'jpg') return matchesSearch && isTargetExt;
      if (extFilter === 'other') return matchesSearch && !isTargetExt;
      return matchesSearch;
    });
  };

  const filteredSource = useMemo(() => filterList(sourceFiles), [sourceFiles, searchQuery, extFilter, config.targetExtensions]);
  const filteredDest = useMemo(() => filterList(destinationFiles), [destinationFiles, searchQuery, extFilter, config.targetExtensions]);

  // Aggregate metrics
  const totalBytes = useMemo(() => files.reduce((acc, f) => acc + f.size, 0), [files]);
  const movedBytes = useMemo(() => destinationFiles.reduce((acc, f) => acc + f.size, 0), [destinationFiles]);
  const targetMatchCount = useMemo(() => {
    return files.filter(f => config.targetExtensions.map(e => e.toLowerCase()).includes(f.extension.toLowerCase())).length;
  }, [files, config.targetExtensions]);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      Array.from(e.dataTransfer.files).forEach(file => onAddCustomFile(file));
    }
  };

  return (
    <div 
      className="flex flex-col gap-5 w-full"
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
    >
      {/* Metric Banner: Clean scannable figures with tabular numerals */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-white dark:bg-neutral-900/60 p-3.5 rounded-lg border border-neutral-200 dark:border-neutral-800 shadow-xs transition-colors">
        <div>
          <span className="text-[11px] text-neutral-500 uppercase tracking-wider font-mono">Source Scanned</span>
          <div className="text-xl font-mono font-semibold tabular-nums text-neutral-900 dark:text-neutral-100 mt-0.5">
            {files.length} <span className="text-xs font-normal text-neutral-500 dark:text-neutral-400">files</span>
          </div>
          <div className="text-[11px] text-neutral-500 font-mono mt-0.5">
            {formatBytes(totalBytes)} total
          </div>
        </div>

        <div>
          <span className="text-[11px] text-neutral-500 uppercase tracking-wider font-mono">Target Matches ({config.targetExtensions.map(e => `.${e}`).join(', ')})</span>
          <div className="text-xl font-mono font-semibold tabular-nums text-amber-600 dark:text-amber-400 mt-0.5">
            {targetMatchCount} <span className="text-xs font-normal text-neutral-500 dark:text-neutral-400">matching</span>
          </div>
          <div className="text-[11px] text-neutral-500 font-mono mt-0.5">
            Filter: lowercase .endswith()
          </div>
        </div>

        <div>
          <span className="text-[11px] text-neutral-500 uppercase tracking-wider font-mono">Organized into Dest</span>
          <div className="text-xl font-mono font-semibold tabular-nums text-emerald-600 dark:text-emerald-400 mt-0.5">
            {destinationFiles.length} <span className="text-xs font-normal text-neutral-500 dark:text-neutral-400">moved</span>
          </div>
          <div className="text-[11px] text-neutral-500 font-mono mt-0.5">
            {formatBytes(movedBytes)} organized
          </div>
        </div>

        <div>
          <span className="text-[11px] text-neutral-500 uppercase tracking-wider font-mono">Preserved in Source</span>
          <div className="text-xl font-mono font-semibold tabular-nums text-neutral-800 dark:text-neutral-300 mt-0.5">
            {sourceFiles.length} <span className="text-xs font-normal text-neutral-500 dark:text-neutral-400">retained</span>
          </div>
          <div className="text-[11px] text-neutral-500 font-mono mt-0.5">
            Non-target formats safe
          </div>
        </div>
      </div>

      {/* Control Bar: Search & View Modes */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-neutral-100/90 dark:bg-neutral-900/40 p-2.5 rounded-lg border border-neutral-200 dark:border-neutral-800 transition-colors">
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-neutral-400 dark:text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search filename or extension..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs font-mono bg-white dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-800 rounded-md text-neutral-900 dark:text-neutral-200 placeholder:text-neutral-400 dark:placeholder:text-neutral-600 focus:outline-none focus:border-amber-500/80 shadow-xs"
            />
          </div>

          {/* Interactive filter tabs */}
          <div className="flex items-center gap-1 p-0.5 bg-neutral-200/70 dark:bg-neutral-950 rounded-md border border-neutral-300 dark:border-neutral-800 text-xs">
            <button
              onClick={() => setExtFilter('all')}
              className={`px-2.5 py-1 rounded transition-colors font-mono ${
                extFilter === 'all' 
                  ? 'bg-white dark:bg-neutral-800 text-neutral-950 dark:text-neutral-100 font-medium shadow-xs' 
                  : 'text-neutral-600 dark:text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-300'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setExtFilter('jpg')}
              className={`px-2.5 py-1 rounded transition-colors font-mono ${
                extFilter === 'jpg' 
                  ? 'bg-white dark:bg-neutral-800 text-amber-600 dark:text-amber-400 font-medium shadow-xs' 
                  : 'text-neutral-600 dark:text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-300'
              }`}
            >
              JPG Only
            </button>
            <button
              onClick={() => setExtFilter('other')}
              className={`px-2.5 py-1 rounded transition-colors font-mono ${
                extFilter === 'other' 
                  ? 'bg-white dark:bg-neutral-800 text-neutral-950 dark:text-neutral-100 font-medium shadow-xs' 
                  : 'text-neutral-600 dark:text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-300'
              }`}
            >
              Others
            </button>
          </div>
        </div>

        {/* View Switcher and Pane Tabs */}
        <div className="flex items-center gap-2 justify-end">
          {/* Mobile Pane switcher */}
          <div className="flex lg:hidden items-center gap-1 p-0.5 bg-neutral-200/70 dark:bg-neutral-950 rounded-md border border-neutral-300 dark:border-neutral-800 text-xs font-mono">
            <button
              onClick={() => setActivePane('all')}
              className={`px-2 py-1 rounded ${activePane === 'all' ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-xs' : 'text-neutral-600 dark:text-neutral-500'}`}
            >
              Split
            </button>
            <button
              onClick={() => setActivePane('source')}
              className={`px-2 py-1 rounded ${activePane === 'source' ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-xs' : 'text-neutral-600 dark:text-neutral-500'}`}
            >
              Source
            </button>
            <button
              onClick={() => setActivePane('destination')}
              className={`px-2 py-1 rounded ${activePane === 'destination' ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-xs' : 'text-neutral-600 dark:text-neutral-500'}`}
            >
              Destination
            </button>
          </div>

          {/* Grid vs Table */}
          <div className="flex items-center gap-1 p-0.5 bg-neutral-200/70 dark:bg-neutral-950 rounded-md border border-neutral-300 dark:border-neutral-800">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded transition-colors ${
                viewMode === 'grid' ? 'bg-white dark:bg-neutral-800 text-amber-600 dark:text-amber-400 shadow-xs' : 'text-neutral-600 dark:text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-300'
              }`}
              title="Grid view"
            >
              <Grid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded transition-colors ${
                viewMode === 'table' ? 'bg-white dark:bg-neutral-800 text-amber-600 dark:text-amber-400 shadow-xs' : 'text-neutral-600 dark:text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-300'
              }`}
              title="Table view"
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Dual Workspace: Left = Source Directory | Right = Organized_Jpg_Files */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Pane 1: Source Directory */}
        <div className={`flex flex-col rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950/60 overflow-hidden shadow-xs transition-colors ${activePane === 'destination' ? 'hidden lg:flex' : 'flex'}`}>
          <div className="flex items-center justify-between px-4 py-3 bg-neutral-50 dark:bg-neutral-900/80 border-b border-neutral-200 dark:border-neutral-800">
            <div className="flex items-center gap-2">
              <Folder className="w-4 h-4 text-neutral-500 dark:text-neutral-400" />
              <span className="text-xs font-mono font-medium text-neutral-800 dark:text-neutral-200">
                {config.sourceDirName || 'Source_Folder'}
              </span>
              <span className="text-neutral-400 dark:text-neutral-600 text-xs">/</span>
              <span className="text-xs text-neutral-500 font-mono tabular-nums">
                ({filteredSource.length} files)
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <label 
                className="cursor-pointer flex items-center gap-1 px-2 py-1 text-[11px] font-mono text-neutral-600 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-neutral-200 bg-neutral-100 hover:bg-neutral-200 dark:bg-transparent dark:hover:bg-neutral-800 rounded transition-colors"
                title="Add custom files to test"
              >
                <Upload className="w-3 h-3" />
                <span>Add Files</span>
                <input
                  type="file"
                  multiple
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files) {
                      Array.from(e.target.files).forEach(f => onAddCustomFile(f));
                    }
                  }}
                />
              </label>
            </div>
          </div>

          <div className="p-4 flex-1 min-h-[380px] max-h-[640px] overflow-y-auto">
            {filteredSource.length === 0 ? (
              <div className="h-64 flex flex-col items-center justify-center text-center p-6 text-neutral-400 dark:text-neutral-600 space-y-2">
                <Folder className="w-10 h-10 opacity-30 text-neutral-400" />
                <p className="text-xs font-mono text-neutral-600 dark:text-neutral-400">
                  {destinationFiles.length > 0 && files.length === destinationFiles.length
                    ? 'All matching files have been organized into destination folder!'
                    : 'No files in source directory matching criteria.'}
                </p>
                <p className="text-[11px] text-neutral-500 dark:text-neutral-600 font-mono">
                  Drag and drop files here, click "Add Files", or open a local folder.
                </p>
              </div>
            ) : viewMode === 'grid' ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {filteredSource.map(file => (
                  <FileCard
                    key={file.id}
                    file={file}
                    viewMode="grid"
                    onPreview={onPreviewFile}
                  />
                ))}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-neutral-200 dark:border-neutral-800 text-[11px] font-mono text-neutral-500 uppercase">
                      <th className="py-2 px-3">File</th>
                      <th className="py-2 px-3">Ext</th>
                      <th className="py-2 px-3 text-right">Size</th>
                      <th className="py-2 px-3 text-right hidden sm:table-cell">Date</th>
                      <th className="py-2 px-3 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSource.map(file => (
                      <FileCard
                        key={file.id}
                        file={file}
                        viewMode="table"
                        onPreview={onPreviewFile}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Pane 2: Destination Directory (Organized_Jpg_Files) */}
        <div className={`flex flex-col rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950/60 overflow-hidden shadow-xs transition-colors ${activePane === 'source' ? 'hidden lg:flex' : 'flex'}`}>
          <div className="flex items-center justify-between px-4 py-3 bg-neutral-50 dark:bg-neutral-900/80 border-b border-neutral-200 dark:border-neutral-800">
            <div className="flex items-center gap-2">
              <FolderCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span className="text-xs font-mono font-medium text-emerald-700 dark:text-emerald-300">
                {config.destinationFolderName || 'Organized_Jpg_Files'}
              </span>
              <span className="text-neutral-400 dark:text-neutral-600 text-xs">/</span>
              <span className="text-xs text-neutral-500 font-mono tabular-nums">
                ({filteredDest.length} files)
              </span>
            </div>

            {destinationFiles.length > 0 && (
              <button
                onClick={onExportZip}
                className="flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-mono font-medium text-emerald-700 dark:text-emerald-300 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/50 dark:hover:bg-emerald-900/60 border border-emerald-300 dark:border-emerald-700/50 rounded transition-colors shadow-xs"
                title="Download organized folder as ZIP"
              >
                <Download className="w-3 h-3" />
                <span>Download ZIP</span>
              </button>
            )}
          </div>

          <div className="p-4 flex-1 min-h-[380px] max-h-[640px] overflow-y-auto">
            {filteredDest.length === 0 ? (
              <div className="h-64 flex flex-col items-center justify-center text-center p-6 text-neutral-400 dark:text-neutral-600 space-y-2">
                <FolderPlus className="w-10 h-10 opacity-30 text-neutral-400 dark:text-neutral-500" />
                <p className="text-xs font-mono text-neutral-600 dark:text-neutral-400">
                  Folder is empty.
                </p>
                <p className="text-[11px] text-neutral-500 dark:text-neutral-500 font-mono max-w-xs">
                  Run the Python script to scan source files and automatically move all .jpg files here.
                </p>
              </div>
            ) : viewMode === 'grid' ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {filteredDest.map(file => (
                  <FileCard
                    key={file.id}
                    file={file}
                    viewMode="grid"
                    onPreview={onPreviewFile}
                  />
                ))}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-neutral-200 dark:border-neutral-800 text-[11px] font-mono text-neutral-500 uppercase">
                      <th className="py-2 px-3">File</th>
                      <th className="py-2 px-3">Ext</th>
                      <th className="py-2 px-3 text-right">Size</th>
                      <th className="py-2 px-3 text-right hidden sm:table-cell">Date</th>
                      <th className="py-2 px-3 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredDest.map(file => (
                      <FileCard
                        key={file.id}
                        file={file}
                        viewMode="table"
                        onPreview={onPreviewFile}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
