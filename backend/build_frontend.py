#!/usr/bin/env python3
"""
Build script to compile the React frontend and prepare it for serving through Flask.
This script should be run before deploying to Railway.
"""

import os
import subprocess
import sys
import shutil

def build_frontend():
    """Build the React frontend and copy files to the Flask static directory."""
    # Define paths
    project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    frontend_dir = os.path.join(project_root, 'frontend')
    backend_dir = os.path.join(project_root, 'backend')
    frontend_dist_dir = os.path.join(frontend_dir, 'dist')
    backend_static_dir = os.path.join(backend_dir, 'static')
    
    print(f"Project root: {project_root}")
    print(f"Frontend directory: {frontend_dir}")
    print(f"Backend directory: {backend_dir}")
    
    # Check if frontend directory exists
    if not os.path.exists(frontend_dir):
        print("Error: Frontend directory not found!")
        return False
    
    # Change to frontend directory
    os.chdir(frontend_dir)
    
    # Install frontend dependencies
    print("Installing frontend dependencies...")
    try:
        subprocess.run(['npm', 'install'], check=True)
    except subprocess.CalledProcessError as e:
        print(f"Error installing frontend dependencies: {e}")
        return False
    
    # Build the frontend
    print("Building frontend...")
    try:
        subprocess.run(['npm', 'run', 'build'], check=True)
    except subprocess.CalledProcessError as e:
        print(f"Error building frontend: {e}")
        return False
    
    # Create static directory in backend if it doesn't exist
    if not os.path.exists(backend_static_dir):
        os.makedirs(backend_static_dir)
    
    # Copy built files to backend static directory
    print("Copying built files to backend static directory...")
    try:
        # Remove existing dist directory in backend if it exists
        backend_dist_dir = os.path.join(backend_dir, 'dist')
        if os.path.exists(backend_dist_dir):
            shutil.rmtree(backend_dist_dir)
            
        # Copy the dist directory to backend
        shutil.copytree(frontend_dist_dir, backend_dist_dir)
        print(f"Successfully copied frontend build to {backend_dist_dir}")
    except Exception as e:
        print(f"Error copying frontend build: {e}")
        return False
    
    print("Frontend build completed successfully!")
    return True

if __name__ == "__main__":
    if build_frontend():
        print("Frontend build process completed successfully.")
        sys.exit(0)
    else:
        print("Frontend build process failed.")
        sys.exit(1)