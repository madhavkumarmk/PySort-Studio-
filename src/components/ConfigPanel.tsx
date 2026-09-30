import React, { useState } from 'react';
import { Sliders, X, Check, Folder, Tag, Layers, RefreshCw } from 'lucide-react';
import { OrganizeConfig } from '../types';

interface ConfigPanelProps {
  isOpen: boolean;
  onClose: () => void;
  config: OrganizeConfig;
  onChangeConfig: (newConfig: OrganizeConfig) => void;
  onResetDefaults: () => void;
}

const COMMON_EXTENSIONS = [
  { ext: 'jpg', label: '.jpg (Default)' },
  { ext: 'jpeg', label: '.jpeg' },
  { ext: 'png', label: '.png' },
  { ext: 'webp', label: '.webp' },
  { ext: 'cr2', label: '.cr2 (Canon RAW)' },
  { ext: 'heic', label: '.heic (Apple HEIF)' },
  { ext: 'mp4', label: '.mp4 (Video)' },
  { ext: 'pdf', label: '.pdf (Documents)' },
];

export const ConfigPanel: React.FC<ConfigPanelProps> = ({
  isOpen,
  onClose,
  config,
  onChangeConfig,
  onResetDefaults,
}) => {
  const [customExtInput, setCustomExtInput] = useState('');

  if (!isOpen) return null;

  const toggleExtension = (ext: string) => {
    const cleanExt = ext.toLowerCase().replace(/^\./, '');
    let next: string[];
    if (config.targetExtensions.includes(cleanExt)) {
      if (config.targetExtensions.length === 1) return; // Keep at least one
      next = config.targetExtensions.filter(e => e !== cleanExt);
    } else {
      next = [...config.targetExtensions, cleanExt];
    }
    onChangeConfig({ ...config, targetExtensions: next });
  };

  const handleAddCustomExt = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customExtInput.trim()) return;
    const cleanExt = customExtInput.trim().toLowerCase().replace(/^\./, '');
    if (!config.targetExtensions.includes(cleanExt)) {
      onChangeConfig({ ...config, targetExtensions: [...config.targetExtensions, cleanExt] });
    }
    setCustomExtInput('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 dark:bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div 
        className="w-full max-w-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] transition-colors"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950/60">
          <div className="flex items-center gap-2.5">
            <Sliders className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
              Automation Configuration
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200 hover:bg-neutral-200/60 dark:hover:bg-neutral-800 rounded-md transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-5 overflow-y-auto space-y-5 text-xs font-mono">
          {/* Destination Folder Name */}
          <div className="space-y-1.5">
            <label className="text-neutral-800 dark:text-neutral-200 font-medium flex items-center gap-1.5">
              <Folder className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span>Destination Folder Name</span>
            </label>
            <p className="text-[11px] text-neutral-500 font-sans">
              Relative to source directory (Python script: <code className="text-amber-700 dark:text-amber-300">destination_folder = os.path.join(source_dir, ...)</code>)
            </p>
            <input
              type="text"
              value={config.destinationFolderName}
              onChange={(e) => onChangeConfig({ ...config, destinationFolderName: e.target.value })}
              className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-800 rounded-md text-neutral-900 dark:text-neutral-100 focus:outline-none focus:border-amber-500"
              placeholder="Organized_Jpg_Files"
            />
          </div>

          {/* Target File Extensions */}
          <div className="space-y-2">
            <label className="text-neutral-800 dark:text-neutral-200 font-medium flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span>Target File Extensions (file.lower().endswith)</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {COMMON_EXTENSIONS.map(item => {
                const checked = config.targetExtensions.includes(item.ext);
                return (
                  <button
                    key={item.ext}
                    type="button"
                    onClick={() => toggleExtension(item.ext)}
                    className={`flex items-center justify-between p-2 rounded-md border text-left transition-colors ${
                      checked
                        ? 'bg-amber-50 dark:bg-amber-500/10 border-amber-400 dark:border-amber-500/40 text-amber-700 dark:text-amber-300 font-medium shadow-xs'
                        : 'bg-neutral-50 dark:bg-neutral-950 border-neutral-200 dark:border-neutral-800/80 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200'
                    }`}
                  >
                    <span>{item.label}</span>
                    {checked && <Check className="w-3 h-3 text-amber-600 dark:text-amber-400 shrink-0" />}
                  </button>
                );
              })}
            </div>

            {/* Custom extension addition */}
            <form onSubmit={handleAddCustomExt} className="flex gap-2 pt-1">
              <input
                type="text"
                value={customExtInput}
                onChange={(e) => setCustomExtInput(e.target.value)}
                placeholder="Add other ext (e.g. avi, webm, bmp)"
                className="flex-1 px-3 py-1.5 bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-800 rounded-md text-neutral-900 dark:text-neutral-200 focus:outline-none focus:border-amber-500 text-xs"
              />
              <button
                type="submit"
                className="px-3 py-1.5 bg-neutral-200 hover:bg-neutral-300 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 rounded-md text-xs transition-colors"
              >
                + Add
              </button>
            </form>
          </div>

          {/* Action Method */}
          <div className="space-y-1.5">
            <label className="text-neutral-800 dark:text-neutral-200 font-medium flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span>File Operation</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => onChangeConfig({ ...config, action: 'move' })}
                className={`p-3 rounded-lg border text-left transition-colors ${
                  config.action === 'move'
                    ? 'bg-amber-50 dark:bg-amber-500/10 border-amber-400 dark:border-amber-500/50 text-neutral-900 dark:text-neutral-100 shadow-xs'
                    : 'bg-neutral-50 dark:bg-neutral-950 border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400'
                }`}
              >
                <div className="font-semibold text-amber-600 dark:text-amber-400">Move (shutil.move)</div>
                <div className="text-[11px] text-neutral-500 font-sans mt-0.5">
                  Relocates file from source into destination folder.
                </div>
              </button>

              <button
                type="button"
                onClick={() => onChangeConfig({ ...config, action: 'copy' })}
                className={`p-3 rounded-lg border text-left transition-colors ${
                  config.action === 'copy'
                    ? 'bg-amber-50 dark:bg-amber-500/10 border-amber-400 dark:border-amber-500/50 text-neutral-900 dark:text-neutral-100 shadow-xs'
                    : 'bg-neutral-50 dark:bg-neutral-950 border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400'
                }`}
              >
                <div className="font-semibold text-amber-600 dark:text-amber-400">Copy (shutil.copy2)</div>
                <div className="text-[11px] text-neutral-500 font-sans mt-0.5">
                  Duplicates file, preserving original in source folder.
                </div>
              </button>
            </div>
          </div>

          {/* Organization Hierarchy */}
          <div className="space-y-1.5">
            <label className="text-neutral-800 dark:text-neutral-200 font-medium">Folder Organization Hierarchy</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => onChangeConfig({ ...config, organizationMode: 'flat' })}
                className={`p-2.5 rounded-lg border text-left transition-colors ${
                  config.organizationMode === 'flat'
                    ? 'bg-amber-50 dark:bg-neutral-800/80 border-amber-400 dark:border-amber-500/50 text-neutral-900 dark:text-neutral-100 shadow-xs'
                    : 'bg-neutral-50 dark:bg-neutral-950 border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400'
                }`}
              >
                <div className="font-semibold text-neutral-900 dark:text-neutral-200">Flat Directory</div>
                <div className="text-[11px] text-neutral-500 font-sans mt-0.5">
                  Directly into <code>{config.destinationFolderName}/</code>
                </div>
              </button>

              <button
                type="button"
                onClick={() => onChangeConfig({ ...config, organizationMode: 'by-date' })}
                className={`p-2.5 rounded-lg border text-left transition-colors ${
                  config.organizationMode === 'by-date'
                    ? 'bg-amber-50 dark:bg-neutral-800/80 border-amber-400 dark:border-amber-500/50 text-neutral-900 dark:text-neutral-100 shadow-xs'
                    : 'bg-neutral-50 dark:bg-neutral-950 border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400'
                }`}
              >
                <div className="font-semibold text-neutral-900 dark:text-neutral-200">By Date (YYYY/MM)</div>
                <div className="text-[11px] text-neutral-500 font-sans mt-0.5">
                  Organized by file modification timestamp
                </div>
              </button>
            </div>
          </div>

          {/* Conflict Resolution */}
          <div className="space-y-1.5">
            <label className="text-neutral-800 dark:text-neutral-200 font-medium">Name Collision Strategy</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => onChangeConfig({ ...config, conflictResolution: 'rename' })}
                className={`p-2 rounded-md border text-center transition-colors ${
                  config.conflictResolution === 'rename'
                    ? 'bg-amber-50 dark:bg-neutral-800 border-amber-400 dark:border-amber-500/40 text-amber-700 dark:text-amber-300 font-medium shadow-xs'
                    : 'bg-neutral-50 dark:bg-neutral-950 border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400'
                }`}
              >
                Auto-Rename (1)
              </button>
              <button
                type="button"
                onClick={() => onChangeConfig({ ...config, conflictResolution: 'overwrite' })}
                className={`p-2 rounded-md border text-center transition-colors ${
                  config.conflictResolution === 'overwrite'
                    ? 'bg-amber-50 dark:bg-neutral-800 border-amber-400 dark:border-amber-500/40 text-amber-700 dark:text-amber-300 font-medium shadow-xs'
                    : 'bg-neutral-50 dark:bg-neutral-950 border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400'
                }`}
              >
                Overwrite
              </button>
              <button
                type="button"
                onClick={() => onChangeConfig({ ...config, conflictResolution: 'skip' })}
                className={`p-2 rounded-md border text-center transition-colors ${
                  config.conflictResolution === 'skip'
                    ? 'bg-amber-50 dark:bg-neutral-800 border-amber-400 dark:border-amber-500/40 text-amber-700 dark:text-amber-300 font-medium shadow-xs'
                    : 'bg-neutral-50 dark:bg-neutral-950 border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400'
                }`}
              >
                Skip Existing
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950/80">
          <button
            onClick={onResetDefaults}
            className="flex items-center gap-1.5 text-xs text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-200 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset to Python Script Defaults</span>
          </button>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-neutral-950 bg-amber-500 hover:bg-amber-400 rounded-md transition-colors shadow-xs"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
