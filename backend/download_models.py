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
    print("🔄 Starting InsightFace model download...")
    print("📦 This may take a few minutes on first run...")
    
    try:
        from insightface.app import FaceAnalysis
        
        # Initialize with CPU provider (more compatible)
        print("🧠 Initializing FaceAnalysis with CPU provider...")
        app = FaceAnalysis(providers=['CPUExecutionProvider'])
        
        # This will trigger model download if not already present
        print("⬇️  Downloading models (this may take 2-5 minutes)...")
        app.prepare(ctx_id=0, det_size=(640, 640))
        
        print("✅ Models downloaded successfully!")
        print("🚀 You can now start the FastAPI server without timeout issues.")
        
        # Test with a dummy image to ensure everything works
        import numpy as np
        dummy_image = np.zeros((480, 640, 3), dtype=np.uint8)
        faces = app.get(dummy_image)
        print(f"🎯 Model test completed. Detected {len(faces)} faces in dummy image.")
        
        return True
        
    except ImportError as e:
        print(f"❌ InsightFace not installed: {e}")
        print("💡 Install with: pip install insightface")
        return False
    except Exception as e:
        print(f"❌ Error downloading models: {e}")
        print("💡 Try running with: pip install --upgrade insightface")
        return False

if __name__ == "__main__":
    print("🎭 InsightFace Model Downloader")
    print("=" * 50)
    
    # Check if we're in a virtual environment
    if hasattr(sys, 'real_prefix') or (hasattr(sys, 'base_prefix') and sys.base_prefix != sys.prefix):
        print("✅ Virtual environment detected")
    else:
        print("⚠️  Not in a virtual environment. Consider using one.")
    
    success = download_insightface_models()
    
    if success:
        print("\n🎉 Setup complete!")
        print("🚀 Run 'python main.py' to start the FastAPI server")
    else:
        print("\n❌ Setup failed!")
        print("🔧 Please check the error messages above")
        sys.exit(1)
