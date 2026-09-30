export interface FileItem {
  id: string;
  name: string;
  extension: string; // lowercase without dot, e.g. 'jpg'
  originalName: string;
  size: number; // in bytes
  lastModified: number; // timestamp
  realFile?: File; // browser File if real upload
  fileHandle?: FileSystemFileHandle; // if File System Access API
  thumbnailUrl?: string; // image thumbnail data url
  status: 'pending' | 'moved' | 'skipped' | 'duplicate';
  originalFolder: string;
  targetFolder: string;
  movedAt?: number;
}

export interface OrganizeConfig {
  sourceDirName: string;
  destinationFolderName: string;
  targetExtensions: string[]; // e.g. ['jpg', 'jpeg']
  action: 'move' | 'copy';
  organizationMode: 'flat' | 'by-date' | 'by-extension';
  conflictResolution: 'rename' | 'overwrite' | 'skip';
  recursive: boolean;
  caseInsensitive: boolean;
}

export interface LogMessage {
  id: string;
  text: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'command' | 'dim';
  timestamp: number;
}

export type ViewTab = 'explorer' | 'terminal' | 'script' | 'stats';
