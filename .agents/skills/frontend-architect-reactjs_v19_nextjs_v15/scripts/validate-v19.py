import re
import sys
import os

def validate_react_19_patterns(file_path):
    if not file_path.endswith(('.tsx', '.jsx')):
        return

    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    warnings = []

    # Check for forwardRef
    if 'forwardRef' in content:
        warnings.append("[WARNING] Obsolete pattern detected: 'forwardRef'. In React 19, use 'ref' as a direct prop.")

    # Check for useFormState (deprecated in favor of useActionState)
    if 'useFormState' in content:
        warnings.append("[WARNING] Obsolete pattern detected: 'useFormState'. In React 19, use 'useActionState'.")

    if warnings:
        print(f"\n--- File: {file_path} ---")
        for w in warnings:
            print(w)
    else:
        print(f"✅ {file_path}: React 19 patterns validated.")

def main():
    if len(sys.argv) < 2:
        print("Usage: python validate-v19.py <file_or_directory>")
        return

    target = sys.argv[1]

    if os.path.isfile(target):
        validate_react_19_patterns(target)
    elif os.path.isdir(target):
        for root, _, files in os.walk(target):
            for file in files:
                if file.endswith(('.tsx', '.jsx')):
                    validate_react_19_patterns(os.path.join(root, file))
    else:
        print(f"Error: {target} not found.")

if __name__ == "__main__":
    main()
