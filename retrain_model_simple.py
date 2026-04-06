#!/usr/bin/env python3
import sys
import os
sys.path.append('.')

# Import and run the training function
from train_model import train_advanced_model

if __name__ == "__main__":
    try:
        train_advanced_model()
        print("\n✅ Model retrained successfully!")
    except Exception as e:
        print(f"\n❌ Error retraining model: {e}")
        sys.exit(1)