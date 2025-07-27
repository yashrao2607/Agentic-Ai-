#!/usr/bin/env python3
"""
Test script to demonstrate image validation functionality
"""

import os
import sys
from datetime import datetime, timedelta
from image_validator import validate_single_image

def test_validation_scenarios():
    """Test different validation scenarios"""
    
    print("🧪 Testing Image Validation Scenarios")
    print("=" * 50)
    
    # Test with a real uploaded image
    test_image = "uploads/photo-1753558089970.jpg"
    
    if os.path.exists(test_image):
        print(f"\n✅ Testing with real image: {test_image}")
        result = validate_single_image("test_real", test_image)
        print(f"Result: Valid={result['is_valid']}, Errors={len(result['errors'])}, Warnings={len(result['warnings'])}")
        
        if result['errors']:
            print("❌ Errors found:")
            for error in result['errors']:
                print(f"   - {error}")
        
        if result['warnings']:
            print("⚠️  Warnings found:")
            for warning in result['warnings']:
                print(f"   - {warning}")
    else:
        print(f"❌ Test image not found: {test_image}")
    
    print("\n📋 Validation Rules Summary:")
    print("• Images must be less than 12 hours old")
    print("• Must not be screenshots or downloaded images")
    print("• Should have proper EXIF metadata")
    print("• File size between 100KB and 10MB")
    print("• Should not be edited with image software")
    print("• Should not have suspicious filenames")
    print("• Should have reasonable image dimensions")

if __name__ == "__main__":
    test_validation_scenarios() 