# Pytest configuration to ensure project root is on sys.path
import sys
import os

# Add the project root directory to sys.path so that imports like `import backend` and `import modules` work
project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if project_root not in sys.path:
    sys.path.insert(0, project_root)
