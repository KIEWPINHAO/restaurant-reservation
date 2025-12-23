import os

# --- CONFIGURATION ---
OUTPUT_FILE = "all_react_code.txt"
EXTENSIONS = {".js", ".jsx", ".ts", ".tsx", ".css", ".html", ".json"} 
IGNORE_DIRS = {"node_modules", ".git", ".next", "build", "dist", "coverage"} 
# ---------------------

def merge_files():
    # Use double underscores for __file__
    source_dir = os.path.dirname(os.path.abspath(__file__))
    
    with open(OUTPUT_FILE, "w", encoding="utf-8") as outfile:
        for root, dirs, files in os.walk(source_dir):
            dirs[:] = [d for d in dirs if d not in IGNORE_DIRS]
            
            for file in files:
                if any(file.endswith(ext) for ext in EXTENSIONS):
                    file_path = os.path.join(root, file)
                    relative_path = os.path.relpath(file_path, source_dir)
                    
                    # Use double underscores for __file__
                    if file == OUTPUT_FILE or file == os.path.basename(__file__):
                        continue

                    outfile.write(f"\n{'='*50}\n")
                    outfile.write(f"FILE: {relative_path}\n")
                    outfile.write(f"{'='*50}\n")
                    
                    try:
                        with open(file_path, "r", encoding="utf-8") as infile:
                            outfile.write(infile.read())
                            outfile.write("\n")
                    except Exception as e:
                        outfile.write(f"[Error reading file: {e}]\n")

    print(f"✅ Success! Check the file: {OUTPUT_FILE}")

# Use double underscores for __name__ and "__main__"
if __name__ == "__main__":
    merge_files()