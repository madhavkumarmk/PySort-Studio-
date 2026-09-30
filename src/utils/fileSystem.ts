import JSZip from 'jszip';
import { FileItem, OrganizeConfig } from '../types';

export function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

export function formatDate(timestamp: number): string {
  const d = new Date(timestamp);
  return d.toISOString().split('T')[0] + ' ' + d.toTimeString().split(' ')[0].slice(0, 5);
}

export function getFileExtension(filename: string): string {
  const parts = filename.split('.');
  if (parts.length <= 1) return '';
  return parts[parts.length - 1].toLowerCase();
}

/**
 * Native File System Access API - Open Directory
 */
export async function pickNativeDirectory(): Promise<{
  dirHandle: FileSystemDirectoryHandle;
  files: FileItem[];
}> {
  if (!('showDirectoryPicker' in window)) {
    throw new Error('File System Access API is not supported in this browser. Please use standard folder upload or drag-and-drop.');
  }

  // @ts-expect-error - modern browser File System Access API
  const dirHandle: FileSystemDirectoryHandle = await window.showDirectoryPicker({
    mode: 'readwrite',
  });

  const files: FileItem[] = [];

  // Iterate over files in the selected directory
  for await (const [name, handle] of dirHandle.entries()) {
    if (handle.kind === 'file') {
      const fileHandle = handle as FileSystemFileHandle;
      const file = await fileHandle.getFile();
      const ext = getFileExtension(name);

      let thumbnailUrl: string | undefined = undefined;
      if (['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg'].includes(ext)) {
        try {
          thumbnailUrl = URL.createObjectURL(file);
        } catch {
          // ignore error creating blob preview
        }
      }

      files.push({
        id: `native-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        name: file.name,
        originalName: file.name,
        extension: ext,
        size: file.size,
        lastModified: file.lastModified,
        realFile: file,
        fileHandle,
        thumbnailUrl,
        status: 'pending',
        originalFolder: dirHandle.name || 'Source_Folder',
        targetFolder: 'Organized_Jpg_Files',
      });
    }
  }

  return { dirHandle, files };
}

/**
 * Handle standard HTML folder input or dropped files
 */
export async function parseFileList(fileList: FileList | File[]): Promise<FileItem[]> {
  const files: FileItem[] = [];
  const list = Array.from(fileList);

  for (const file of list) {
    const ext = getFileExtension(file.name);
    let thumbnailUrl: string | undefined = undefined;
    if (['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg'].includes(ext)) {
      try {
        thumbnailUrl = URL.createObjectURL(file);
      } catch {
        // ignore preview failure
      }
    }

    files.push({
      id: `upload-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      name: file.name,
      originalName: file.name,
      extension: ext,
      size: file.size,
      lastModified: file.lastModified,
      realFile: file,
      thumbnailUrl,
      status: 'pending',
      originalFolder: 'Uploaded_Source',
      targetFolder: 'Organized_Jpg_Files',
    });
  }

  return files;
}

/**
 * Export files as an organized ZIP archive matching target structure
 */
export async function exportOrganizedZip(
  files: FileItem[],
  config: OrganizeConfig,
  onProgress?: (percent: number, currentFile: string) => void
): Promise<Blob> {
  const zip = new JSZip();

  const movedFiles = files.filter(f => f.status === 'moved');
  const remainingFiles = files.filter(f => f.status !== 'moved');

  // Root directory representation
  const targetDirName = config.destinationFolderName || 'Organized_Jpg_Files';
  const organizedFolder = zip.folder(targetDirName);

  let processed = 0;
  const total = movedFiles.length + (config.action === 'copy' ? remainingFiles.length : 0);

  // Add organized files
  for (const item of movedFiles) {
    if (onProgress) {
      onProgress(Math.round((processed / Math.max(1, total)) * 100), item.name);
    }

    if (item.realFile) {
      organizedFolder?.file(item.name, item.realFile);
    } else {
      // Mock/synthetic file text or dummy payload for sandbox demo
      const dummyContent = `PySort Studio Simulated Asset\nOriginal Name: ${item.name}\nSize: ${item.size} bytes\nDate: ${new Date(item.lastModified).toISOString()}`;
      organizedFolder?.file(item.name, dummyContent);
    }
    processed++;
  }

  // Include a summary manifest
  const manifest = {
    generatedBy: 'PySort Studio (Python File Organizer)',
    scriptEquivalent: 'organize_jpg_files()',
    totalMoved: movedFiles.length,
    timestamp: new Date().toISOString(),
    files: movedFiles.map(f => ({
      filename: f.name,
      originalName: f.originalName,
      size: f.size,
      extension: f.extension,
      dateModified: new Date(f.lastModified).toISOString(),
    })),
  };
  zip.file('organization_manifest.json', JSON.stringify(manifest, null, 2));

  return await zip.generateAsync({ type: 'blob' }, (metadata) => {
    if (onProgress) {
      onProgress(Math.round(metadata.percent), 'Compressing ZIP package...');
    }
  });
}

/**
 * Download a generated Blob to user's computer
 */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
