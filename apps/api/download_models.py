#!/usr/bin/env python3
"""
Pre-download InsightFace models to avoid timeouts during first API call.
This script should be run once before starting the FastAPI server.
"""

import os
import sys
from pathlib import Path

def download_insightface_models():
    """Download InsightFace models"""
    print("Starting InsightFace model download...")
    print("This may take a few minutes on first run...")
    
    try:
        from insightface.app import FaceAnalysis
        
        print("Initializing FaceAnalysis with CPU provider...")
        app = FaceAnalysis(providers=['CPUExecutionProvider'])
        
        print("Downloading models (this may take 2-5 minutes)...")
        app.prepare(ctx_id=0, det_size=(640, 640))
        
        print("Models downloaded successfully!")
        print("You can now start the FastAPI server without timeout issues.")
        
        import numpy as np
        dummy_image = np.zeros((480, 640, 3), dtype=np.uint8)
        faces = app.get(dummy_image)
        print(f"Model test completed. Detected {len(faces)} faces in dummy image.")
        
        return True
        
    except ImportError as e:
        print(f"Error: InsightFace not installed: {e}")
        print("Install with: pip install insightface")
        return False
    except Exception as e:
        print(f"Error downloading models: {e}")
        print("Try running with: pip install --upgrade insightface")
        return False

if __name__ == "__main__":
    print("InsightFace Model Downloader")
    print("=" * 50)
    
    if hasattr(sys, 'real_prefix') or (hasattr(sys, 'base_prefix') and sys.base_prefix != sys.prefix):
        print("Virtual environment detected")
    else:
        print("Warning: Not in a virtual environment. Consider using one.")
    
    success = download_insightface_models()
    
    if success:
        print("\nSetup complete!")
        print("Run 'python main.py' to start the FastAPI server")
    else:
        print("\nSetup failed!")
        print("Please check the error messages above")
        sys.exit(1)
