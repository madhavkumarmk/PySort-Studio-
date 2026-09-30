import { OrganizeConfig } from '../types';

export function generatePythonScript(config: OrganizeConfig): string {
  const extsFormatted = config.targetExtensions.map(e => `.${e.toLowerCase().replace(/^\./, '')}`);
  const extsTupleStr = extsFormatted.length === 1 
    ? `('${extsFormatted[0]}',)`
    : `(${extsFormatted.map(e => `'${e}'`).join(', ')})`;

  const destFolder = config.destinationFolderName || 'Organized_Jpg_Files';
  const actionMethod = config.action === 'copy' ? 'shutil.copy2' : 'shutil.move';
  const actionWord = config.action === 'copy' ? 'Copied' : 'Moved';
  const actionLower = config.action === 'copy' ? 'copying' : 'moving';

  if (config.organizationMode === 'by-date') {
    return `import os
import shutil
from datetime import datetime

def organize_files_by_date():
    """
    Scans files with extensions ${extsTupleStr} and organizes them into
    date-based subdirectories (YYYY/MM) inside '${destFolder}'.
    """
    source_dir = input("Enter the path of the source folder (leave blank for current directory): ").strip()
    if not source_dir:
        source_dir = os.getcwd()

    if not os.path.exists(source_dir):
        print("Error: The specified source folder does not exist.")
        return

    base_dest = os.path.join(source_dir, "${destFolder}")
    if not os.path.exists(base_dest):
        os.makedirs(base_dest)
        print(f"Created destination folder: {base_dest}")

    moved_count = 0
    print(f"\\nScanning and ${actionLower} files by date...")

    ${config.recursive ? `for root, _, files in os.walk(source_dir):
        if "${destFolder}" in root:
            continue
        for file in files:` : `files = os.listdir(source_dir)
    for file in files:`}
        if file.lower().endswith(${extsTupleStr}):
            ${config.recursive ? `source_path = os.path.join(root, file)` : `source_path = os.path.join(source_dir, file)`}
            if os.path.isfile(source_path):
                # Retrieve file modification date
                mod_time = os.path.getmtime(source_path)
                dt = datetime.fromtimestamp(mod_time)
                date_subfolder = os.path.join(base_dest, dt.strftime("%Y"), dt.strftime("%m"))
                
                os.makedirs(date_subfolder, exist_ok=True)
                destination_path = os.path.join(date_subfolder, file)

                # Avoid collision / duplicate overwrites
                target_dest = destination_path
                ${config.conflictResolution === 'rename' ? `counter = 1
                base_name, ext = os.path.splitext(file)
                while os.path.exists(target_dest):
                    target_dest = os.path.join(date_subfolder, f"{base_name} ({counter}){ext}")
                    counter += 1` : ''}

                ${actionMethod}(source_path, target_dest)
                print(f"${actionWord}: {file} -> {target_dest}")
                moved_count += 1

    print("\\n" + "=" * 30)
    print(f"Automation Complete! Total files ${actionLower}: {moved_count}")
    print("=" * 30)

if __name__ == "__main__":
    organize_files_by_date()
`;
  }

  // Standard flat / user script format
  return `import os
import shutil

def organize_jpg_files():
    # Define source directory (current directory or specify path)
    source_dir = input("Enter the path of the source folder (leave blank for current directory): ").strip()
    
    if not source_dir:
        source_dir = os.getcwd()
        
    if not os.path.exists(source_dir):
        print("Error: The specified source folder does not exist.")
        return

    # Define the destination folder name
    destination_folder = os.path.join(source_dir, "${destFolder}")
    
    # Create destination folder if it doesn't exist
    if not os.path.exists(destination_folder):
        os.makedirs(destination_folder)
        print(f"Created destination folder: {destination_folder}")
        
    ${config.recursive ? `moved_count = 0
    print("\\nScanning and ${actionLower} matching files (recursive)...")
    for root, dirs, files in os.walk(source_dir):
        # Avoid recursing into destination folder itself
        if "${destFolder}" in root:
            continue
        for file in files:` : `files = os.listdir(source_dir)
    moved_count = 0
    
    print("\\nScanning and ${actionLower} ${extsFormatted.join(', ')} files...")
    for file in files:`}
        # Check if the file matches target extensions
        if file.lower().endswith(${extsTupleStr}):
            ${config.recursive ? `source_path = os.path.join(root, file)` : `source_path = os.path.join(source_dir, file)`}
            destination_path = os.path.join(destination_folder, file)
            
            # Avoid moving if it's already inside the destination folder
            if os.path.isfile(source_path):
                ${config.conflictResolution === 'rename' ? `target_dest = destination_path
                counter = 1
                base_name, ext = os.path.splitext(file)
                while os.path.exists(target_dest):
                    target_dest = os.path.join(destination_folder, f"{base_name} ({counter}){ext}")
                    counter += 1
                ${actionMethod}(source_path, target_dest)
                print(f"${actionWord}: {file} -> {target_dest}")` : `${actionMethod}(source_path, destination_path)
                print(f"${actionWord}: {file} -> {destination_folder}")`}
                moved_count += 1
                
    print("\\n" + "="*30)
    print(f"Automation Complete! Total files ${actionLower}: {moved_count}")
    print("="*30)

if __name__ == "__main__":
    organize_jpg_files()
`;
}

export function generateBashScript(config: OrganizeConfig): string {
  const dest = config.destinationFolderName || 'Organized_Jpg_Files';
  const exts = config.targetExtensions.map(e => e.toLowerCase()).join('|');
  const actionCmd = config.action === 'copy' ? 'cp -p' : 'mv';

  return `#!/usr/bin/env bash
# PySort - Bash Media Sorter
set -euo pipefail

read -rp "Enter source folder (leave blank for current): " SOURCE_DIR
SOURCE_DIR="\${SOURCE_DIR:-.}"

if [ ! -d "$SOURCE_DIR" ]; then
  echo "Error: Directory '$SOURCE_DIR' does not exist."
  exit 1
fi

DEST_DIR="$SOURCE_DIR/${dest}"
mkdir -p "$DEST_DIR"
echo "Created destination folder: $DEST_DIR"

MOVED=0
echo "Scanning for matching files..."

for file in "$SOURCE_DIR"/*; do
  if [ -f "$file" ]; then
    filename=$(basename "$file")
    ext="\${filename##*.}"
    ext_lower=$(echo "$ext" | tr '[:upper:]' '[:lower:]')
    
    if [[ "$ext_lower" =~ ^(${exts})$ ]]; then
      ${actionCmd} "$file" "$DEST_DIR/"
      echo "${config.action === 'copy' ? 'Copied' : 'Moved'}: $filename -> $DEST_DIR"
      ((MOVED++)) || true
    fi
  fi
done

echo "=============================="
echo "Complete! Total files processed: $MOVED"
echo "=============================="
`;
}

export function generatePowerShellScript(config: OrganizeConfig): string {
  const dest = config.destinationFolderName || 'Organized_Jpg_Files';
  const patterns = config.targetExtensions.map(e => `'*.${e}'`).join(', ');
  const actionCmd = config.action === 'copy' ? 'Copy-Item' : 'Move-Item';

  return `# PySort - PowerShell Media Organizer
$SourceDir = Read-Host "Enter source folder (leave blank for current)"
if ([string]::IsNullOrWhiteSpace($SourceDir)) {
    $SourceDir = Get-Location
}

if (-not (Test-Path $SourceDir)) {
    Write-Error "Source folder does not exist."
    exit
}

$DestDir = Join-Path $SourceDir "${dest}"
if (-not (Test-Path $DestDir)) {
    New-Item -ItemType Directory -Path $DestDir | Out-Null
    Write-Host "Created destination folder: $DestDir"
}

$patterns = @(${patterns})
$files = Get-ChildItem -Path $SourceDir -File | Where-Object {
    $ext = $_.Extension.TrimStart('.').ToLower()
    $patterns -contains "*.$ext"
}

$count = 0
foreach ($file in $files) {
    ${actionCmd} -Path $file.FullName -Destination $DestDir
    Write-Host "${config.action === 'copy' ? 'Copied' : 'Moved'}: $($file.Name) -> $DestDir"
    $count++
}

Write-Host "=============================="
Write-Host "Automation Complete! Total files processed: $count"
Write-Host "=============================="
`;
}
