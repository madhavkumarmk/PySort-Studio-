import { FileItem } from '../types';

// Helper to generate attractive SVG placeholder images as Data URLs for sandbox photos
function createSampleSvgThumbnail(title: string, bgGradient: [string, string], iconType: 'mountain' | 'sun' | 'camera' | 'city' | 'forest' | 'macro'): string {
  const [c1, c2] = bgGradient;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="200" viewBox="0 0 300 200">
    <defs>
      <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${c1}" />
        <stop offset="100%" stop-color="${c2}" />
      </linearGradient>
    </defs>
    <rect width="300" height="200" fill="url(#g)" />
    <circle cx="230" cy="50" r="22" fill="rgba(255,255,255,0.25)" />
    <path d="M0,170 Q70,120 140,160 T300,140 L300,200 L0,200 Z" fill="rgba(0,0,0,0.3)" />
    <path d="M0,185 Q90,140 180,175 T300,165 L300,200 L0,200 Z" fill="rgba(0,0,0,0.4)" />
    <text x="16" y="32" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="12" font-weight="600" fill="rgba(255,255,255,0.85)">${title}</text>
    <text x="16" y="186" font-family="monospace" font-size="10" fill="rgba(255,255,255,0.6)">RAW 24MP · ISO 100</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export function getDefaultSampleFiles(): FileItem[] {
  const now = Date.now();
  const day = 86400000;

  return [
    {
      id: 'samp-1',
      name: 'DSC_0491.jpg',
      extension: 'jpg',
      originalName: 'DSC_0491.jpg',
      size: 4284910, // ~4.1 MB
      lastModified: now - day * 2,
      thumbnailUrl: createSampleSvgThumbnail('Alpine Peak Sunrise', ['#1e3a8a', '#3b82f6'], 'mountain'),
      status: 'pending',
      originalFolder: 'Source_Folder',
      targetFolder: 'Organized_Jpg_Files',
    },
    {
      id: 'samp-2',
      name: 'sunset_beach_golden_hour.JPG',
      extension: 'jpg',
      originalName: 'sunset_beach_golden_hour.JPG',
      size: 5892110, // ~5.6 MB
      lastModified: now - day * 5,
      thumbnailUrl: createSampleSvgThumbnail('Malibu Golden Hour', ['#b45309', '#f59e0b'], 'sun'),
      status: 'pending',
      originalFolder: 'Source_Folder',
      targetFolder: 'Organized_Jpg_Files',
    },
    {
      id: 'samp-3',
      name: 'IMG_20240915_142210.jpg',
      extension: 'jpg',
      originalName: 'IMG_20240915_142210.jpg',
      size: 3410290, // ~3.2 MB
      lastModified: now - day * 12,
      thumbnailUrl: createSampleSvgThumbnail('Downtown Architecture', ['#0f172a', '#334155'], 'city'),
      status: 'pending',
      originalFolder: 'Source_Folder',
      targetFolder: 'Organized_Jpg_Files',
    },
    {
      id: 'samp-4',
      name: 'portrait_studio_headshot.jpg',
      extension: 'jpg',
      originalName: 'portrait_studio_headshot.jpg',
      size: 6120400, // ~5.8 MB
      lastModified: now - day * 8,
      thumbnailUrl: createSampleSvgThumbnail('Studio Portrait Session', ['#4c1d95', '#8b5cf6'], 'camera'),
      status: 'pending',
      originalFolder: 'Source_Folder',
      targetFolder: 'Organized_Jpg_Files',
    },
    {
      id: 'samp-5',
      name: 'forest_trail_fog.JPG',
      extension: 'jpg',
      originalName: 'forest_trail_fog.JPG',
      size: 4920100, // ~4.7 MB
      lastModified: now - day * 20,
      thumbnailUrl: createSampleSvgThumbnail('Redwood Morning Fog', ['#064e3b', '#10b981'], 'forest'),
      status: 'pending',
      originalFolder: 'Source_Folder',
      targetFolder: 'Organized_Jpg_Files',
    },
    {
      id: 'samp-6',
      name: 'macro_dew_leaf.jpg',
      extension: 'jpg',
      originalName: 'macro_dew_leaf.jpg',
      size: 2980400, // ~2.8 MB
      lastModified: now - day * 1,
      thumbnailUrl: createSampleSvgThumbnail('Emerald Dewdrop', ['#14532d', '#22c55e'], 'macro'),
      status: 'pending',
      originalFolder: 'Source_Folder',
      targetFolder: 'Organized_Jpg_Files',
    },
    // Non-JPG files that the script should preserve in source:
    {
      id: 'samp-7',
      name: 'project_contract_signed.pdf',
      extension: 'pdf',
      originalName: 'project_contract_signed.pdf',
      size: 890120, // ~870 KB
      lastModified: now - day * 15,
      status: 'pending',
      originalFolder: 'Source_Folder',
      targetFolder: 'Source_Folder',
    },
    {
      id: 'samp-8',
      name: 'timelapse_clip_4k.mp4',
      extension: 'mp4',
      originalName: 'timelapse_clip_4k.mp4',
      size: 48920190, // ~46.6 MB
      lastModified: now - day * 4,
      status: 'pending',
      originalFolder: 'Source_Folder',
      targetFolder: 'Source_Folder',
    },
    {
      id: 'samp-9',
      name: 'brand_vector_logo.png',
      extension: 'png',
      originalName: 'brand_vector_logo.png',
      size: 341200, // ~333 KB
      lastModified: now - day * 30,
      status: 'pending',
      originalFolder: 'Source_Folder',
      targetFolder: 'Source_Folder',
    },
    {
      id: 'samp-10',
      name: 'notes_and_captions.txt',
      extension: 'txt',
      originalName: 'notes_and_captions.txt',
      size: 4210, // ~4 KB
      lastModified: now - day * 3,
      status: 'pending',
      originalFolder: 'Source_Folder',
      targetFolder: 'Source_Folder',
    },
    {
      id: 'samp-11',
      name: 'DSC_0492_raw_burst.cr2',
      extension: 'cr2',
      originalName: 'DSC_0492_raw_burst.cr2',
      size: 28410290, // ~27 MB
      lastModified: now - day * 2,
      status: 'pending',
      originalFolder: 'Source_Folder',
      targetFolder: 'Source_Folder',
    },
    {
      id: 'samp-12',
      name: 'vacation_overview.heic',
      extension: 'heic',
      originalName: 'vacation_overview.heic',
      size: 1980300, // ~1.9 MB
      lastModified: now - day * 6,
      status: 'pending',
      originalFolder: 'Source_Folder',
      targetFolder: 'Source_Folder',
    }
  ];
}
