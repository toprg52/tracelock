import os
import zipfile

def main():
    workspace_dir = os.getcwd()
    output_zip_name = "Tracelock 3.8.26.zip"
    output_zip_path = os.path.join(workspace_dir, output_zip_name)

    exclude_dirs = {
        "node_modules",
        ".git",
        ".venv",
        "venv",
        "__pycache__",
        ".next",
        "dist",
        "build",
        ".gemini",
        ".idea",
        ".vscode"
    }

    exclude_extensions = {".pyc", ".pyo", ".log", ".tmp"}

    print(f"Creating zip archive: {output_zip_path}...")

    total_files = 0
    total_bytes = 0

    with zipfile.ZipFile(output_zip_path, 'w', zipfile.ZIP_DEFLATED) as z:
        for root, dirs, files in os.walk(workspace_dir):
            # Exclude unwanted directories in-place
            dirs[:] = [d for d in dirs if d not in exclude_dirs]
            
            for file in files:
                if file == output_zip_name or file.endswith(".zip"):
                    continue

                _, ext = os.path.splitext(file)
                if ext.lower() in exclude_extensions:
                    continue

                abs_path = os.path.join(root, file)
                rel_path = os.path.relpath(abs_path, workspace_dir)

                z.write(abs_path, rel_path)
                total_files += 1
                total_bytes += os.path.getsize(abs_path)

    mb_size = total_bytes / (1024 * 1024)
    zip_size_mb = os.path.getsize(output_zip_path) / (1024 * 1024)

    print(f"Successfully created archive '{output_zip_name}'!")
    print(f"Total files zipped: {total_files}")
    print(f"Uncompressed size: {mb_size:.2f} MB")
    print(f"Zip File size: {zip_size_mb:.2f} MB")

if __name__ == "__main__":
    main()
