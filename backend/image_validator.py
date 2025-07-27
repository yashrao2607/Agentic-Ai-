import os
import sys
import json
from datetime import datetime, timedelta
from PIL import Image
from PIL.ExifTags import TAGS
import imagehash
import firebase_admin
from firebase_admin import credentials, firestore
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# --- CONFIGURATION ---
SERVICE_ACCOUNT_FILE = os.getenv("SERVICE_ACCOUNT_FILE")
RAW_SUBMISSIONS_COLLECTION = "raw_submissions"
MAX_AGE_HOURS = 12  # Maximum age of image in hours (12 hours - stricter)
MIN_IMAGE_SIZE = 100 * 1024  # 100KB minimum
MAX_IMAGE_SIZE = 10 * 1024 * 1024  # 10MB maximum

# --- INITIALIZATION ---
def initialize_firebase():
    """Initialize Firebase connection."""
    try:
        cred = credentials.Certificate(SERVICE_ACCOUNT_FILE)
        if not firebase_admin._apps:
            firebase_admin.initialize_app(cred)
        db = firestore.client()
        print("✅ Firebase Initialized Successfully.")
        return db
    except Exception as e:
        print(f"❌ FATAL: Could not initialize Firebase: {e}")
        sys.exit(1)

# --- IMAGE METADATA EXTRACTION ---
def extract_image_metadata(image_path):
    """Extract metadata from image file."""
    if not os.path.exists(image_path):
        print(f"❌ Image file does not exist: {image_path}")
        return None
    
    try:
        with Image.open(image_path) as img:
            metadata = {
                'format': img.format,
                'mode': img.mode,
                'size': img.size,
                'file_size': os.path.getsize(image_path),
                'file_name': os.path.basename(image_path),
                'exif_data': {},
                'creation_time': None,
                'modification_time': None,
                'image_hash': str(imagehash.phash(img))
            }
            
            print(f"📸 Image loaded: {img.format} {img.size} {metadata['file_size']} bytes")
            
            # Extract EXIF data
            exif = img._getexif()
            if exif:
                print(f"📋 EXIF data found: {len(exif)} tags")
                for tag_id in exif:
                    tag = TAGS.get(tag_id, tag_id)
                    data = exif.get(tag_id)
                    metadata['exif_data'][tag] = data
                    
                    # Extract creation time from EXIF
                    if tag in ['DateTime', 'DateTimeOriginal', 'DateTimeDigitized']:
                        try:
                            metadata['creation_time'] = datetime.strptime(str(data), '%Y:%m:%d %H:%M:%S')
                            print(f"📅 EXIF creation time: {metadata['creation_time']}")
                        except Exception as e:
                            print(f"⚠️ Could not parse EXIF date: {data} - {e}")
            else:
                print("⚠️ No EXIF data found in image")
            
            # Get file modification time
            metadata['modification_time'] = datetime.fromtimestamp(os.path.getmtime(image_path))
            print(f"📅 File modification time: {metadata['modification_time']}")
            
            # If no EXIF creation time, use file modification time as fallback
            if not metadata['creation_time']:
                metadata['creation_time'] = metadata['modification_time']
                print(f"📅 Using file modification time as creation time: {metadata['creation_time']}")
            
            return metadata
            
    except Exception as e:
        print(f"❌ Error extracting metadata from {image_path}: {e}")
        return None

# --- IMAGE VALIDATION ---
def validate_image_metadata(metadata):
    """Validate image metadata for authenticity and recency."""
    if not metadata:
        return {
            'is_valid': False,
            'warnings': [],
            'errors': ['No metadata found'],
            'metadata': None
        }
    
    validation_results = {
        'is_valid': True,
        'warnings': [],
        'errors': [],
        'metadata': metadata
    }
    
    # Check file size
    if metadata['file_size'] < MIN_IMAGE_SIZE:
        validation_results['errors'].append(f"Image too small: {metadata['file_size']} bytes")
        validation_results['is_valid'] = False
    
    if metadata['file_size'] > MAX_IMAGE_SIZE:
        validation_results['errors'].append(f"Image too large: {metadata['file_size']} bytes")
        validation_results['is_valid'] = False
    
    # Check image format
    if metadata['format'] not in ['JPEG', 'JPG', 'PNG', 'WEBP']:
        validation_results['warnings'].append(f"Unusual format: {metadata['format']}")
    
    # Check image dimensions
    width, height = metadata['size']
    if width < 200 or height < 200:
        validation_results['warnings'].append(f"Small image dimensions: {width}x{height}")
    
    # Check creation time
    creation_time = metadata.get('creation_time')
    modification_time = metadata.get('modification_time')
    
    if creation_time:
        age_hours = (datetime.now() - creation_time).total_seconds() / 3600
        if age_hours > MAX_AGE_HOURS:
            validation_results['errors'].append(f"Image too old: {age_hours:.1f} hours old (max 12 hours)")
            validation_results['is_valid'] = False
        elif age_hours > 6:
            validation_results['warnings'].append(f"Image is {age_hours:.1f} hours old")
        
        # Additional check for very recent images (suspicious if too new)
        if age_hours < 0.1:  # Less than 6 minutes old
            validation_results['warnings'].append("Image created very recently (may be suspicious)")
    
    # Check modification time
    if modification_time:
        mod_age_hours = (datetime.now() - modification_time).total_seconds() / 3600
        if mod_age_hours > MAX_AGE_HOURS:
            validation_results['warnings'].append(f"File modified {mod_age_hours:.1f} hours ago")
        
        # Check if file was modified very recently
        if mod_age_hours < 0.1:  # Less than 6 minutes ago
            validation_results['warnings'].append("File modified very recently (suspicious)")
    
    # Check for future timestamps (impossible)
    if creation_time and creation_time > datetime.now():
        validation_results['errors'].append("Image has future timestamp (impossible)")
        validation_results['is_valid'] = False
    
    # Check for suspicious EXIF data
    exif_data = metadata.get('exif_data', {})
    
    # Check for GPS data (should be present for recent photos)
    has_gps = any('GPS' in str(key) for key in exif_data.keys())
    if not has_gps:
        validation_results['warnings'].append("No GPS data found (may be edited)")
    
    # Check for camera make/model
    has_camera_info = any(key in str(exif_data.keys()) for key in ['Make', 'Model'])
    if not has_camera_info:
        validation_results['warnings'].append("No camera information found")
    
    # Check for software editing (indicates manipulation)
    if 'Software' in exif_data:
        software = str(exif_data['Software']).lower()
        if any(editor in software for editor in ['photoshop', 'gimp', 'paint', 'canva', 'pixlr']):
            validation_results['errors'].append("Image appears to be edited with image software")
            validation_results['is_valid'] = False
    
    # Check for suspicious file names (downloaded images)
    file_name = metadata.get('file_name', '').lower()
    if any(indicator in file_name for indicator in ['download', 'screenshot', 'copy', 'img_', 'photo_']):
        validation_results['warnings'].append("Suspicious filename (may be downloaded)")
    
    # Check for very recent modification (suspicious)
    if modification_time:
        time_diff = abs((modification_time - creation_time).total_seconds())
        if time_diff < 60:  # Less than 1 minute difference
            validation_results['warnings'].append("File modified very recently (suspicious)")
    
    # Check for missing EXIF data (common in downloaded images)
    if len(exif_data) < 5:
        validation_results['warnings'].append("Very little EXIF data (may be downloaded)")
    
    # Check for specific image dimensions (screenshots)
    if width == 1920 and height == 1080:
        validation_results['warnings'].append("Common screenshot resolution detected")
    elif width == 1366 and height == 768:
        validation_results['warnings'].append("Common laptop screenshot resolution detected")
    
    # Check for suspicious patterns in image data
    if metadata.get('file_size', 0) < 50000:  # Less than 50KB
        validation_results['warnings'].append("Very small file size (may be compressed/edited)")
    
    # Check for common fake image indicators
    if 'Software' in exif_data:
        software = str(exif_data['Software']).lower()
        if any(editor in software for editor in ['screenshot', 'snip', 'printscreen']):
            validation_results['errors'].append("Image appears to be a screenshot")
            validation_results['is_valid'] = False
    
    # Check for suspicious file modification patterns
    if modification_time and creation_time:
        time_diff = abs((modification_time - creation_time).total_seconds())
        if time_diff < 30:  # Less than 30 seconds difference
            validation_results['warnings'].append("File created and modified almost simultaneously (suspicious)")
    
    # Check for image quality indicators
    if width < 800 or height < 600:
        validation_results['warnings'].append("Low resolution image (may be poor quality)")
    
    # Check for excessive compression
    if metadata.get('file_size', 0) > 0:
        compression_ratio = (width * height * 3) / metadata['file_size']  # Rough estimate
        if compression_ratio > 50:  # Very high compression
            validation_results['warnings'].append("Image appears heavily compressed")
    
    # Check for common fake image file patterns
    file_name = metadata.get('file_name', '').lower()
    suspicious_patterns = ['screenshot', 'snip', 'capture', 'print', 'copy', 'download', 'save']
    if any(pattern in file_name for pattern in suspicious_patterns):
        validation_results['warnings'].append("Suspicious filename detected")
    
    # Check for image format consistency
    if metadata.get('format') == 'PNG' and 'Software' in exif_data:
        software = str(exif_data['Software']).lower()
        if 'screenshot' in software or 'snip' in software:
            validation_results['errors'].append("PNG image appears to be a screenshot")
            validation_results['is_valid'] = False
    
    return validation_results

# --- DUPLICATE DETECTION ---
def check_for_duplicates(db, image_hash, submission_id):
    """Check if similar image already exists."""
    try:
        # Query for similar images in the last 7 days
        seven_days_ago = datetime.now() - timedelta(days=7)
        
        query = db.collection(RAW_SUBMISSIONS_COLLECTION).where(
            'image_hash', '==', image_hash
        ).where('created_at', '>=', seven_days_ago)
        
        similar_docs = query.stream()
        
        for doc in similar_docs:
            if doc.id != submission_id:
                return True, doc.id
        
        return False, None
        
    except Exception as e:
        print(f"❌ Error checking for duplicates: {e}")
        return False, None

# --- MAIN VALIDATION FUNCTION ---
def validate_submission_image(db, submission_id, image_path):
    """Main function to validate an uploaded image."""
    print(f"\n🔍 Validating image for submission: {submission_id}")
    print(f"📁 Image path: {image_path}")
    
    # Extract metadata
    metadata = extract_image_metadata(image_path)
    if not metadata:
        return {
            'is_valid': False,
            'errors': ['Could not extract image metadata'],
            'warnings': [],
            'metadata': None
        }
    
    # Validate metadata
    validation_results = validate_image_metadata(metadata)
    
    # Skip duplicate detection for now to avoid Firestore index issues
    # is_duplicate, duplicate_id = check_for_duplicates(db, metadata['image_hash'], submission_id)
    # if is_duplicate:
    #     validation_results['errors'].append(f"Duplicate image found (ID: {duplicate_id})")
    #     validation_results['is_valid'] = False
    
    # Update Firestore with validation results (only if submission_id is not 'dummy')
    if submission_id != 'dummy':
        try:
            doc_ref = db.collection(RAW_SUBMISSIONS_COLLECTION).document(submission_id)
            doc_ref.update({
                'image_validation': validation_results,
                'image_metadata': metadata,
                'validated_at': firestore.SERVER_TIMESTAMP
            })
            print("✅ Validation results saved to Firestore")
        except Exception as e:
            print(f"⚠️ Could not save validation results (document may not exist yet): {e}")
    
    # Print results
    print(f"\n📊 Validation Results:")
    print(f"   Valid: {validation_results['is_valid']}")
    print(f"   Errors: {len(validation_results['errors'])}")
    print(f"   Warnings: {len(validation_results['warnings'])}")
    
    if validation_results['errors']:
        print("   ❌ Errors:")
        for error in validation_results['errors']:
            print(f"      - {error}")
    
    if validation_results['warnings']:
        print("   ⚠️  Warnings:")
        for warning in validation_results['warnings']:
            print(f"      - {warning}")
    
    return validation_results

# --- BATCH VALIDATION ---
def validate_pending_images():
    """Validate all pending images in the database."""
    db = initialize_firebase()
    
    print("\n🚀 Starting batch image validation...")
    
    # Query for submissions with images that haven't been validated
    query = db.collection(RAW_SUBMISSIONS_COLLECTION).where(
        'image_path', '!=', None
    ).where('image_validation', '==', None)
    
    pending_docs = query.stream()
    
    validated_count = 0
    error_count = 0
    
    for doc in pending_docs:
        data = doc.to_dict()
        image_path = data.get('image_path')
        
        if image_path and os.path.exists(image_path):
            try:
                validation_results = validate_submission_image(db, doc.id, image_path)
                validated_count += 1
                
                if not validation_results['is_valid']:
                    error_count += 1
                    
            except Exception as e:
                print(f"❌ Error validating {doc.id}: {e}")
                error_count += 1
        else:
            print(f"⚠️  Image path not found for {doc.id}: {image_path}")
    
    print(f"\n✅ Batch validation complete!")
    print(f"   Total validated: {validated_count}")
    print(f"   Errors found: {error_count}")
    print(f"   Success rate: {((validated_count - error_count) / validated_count * 100):.1f}%" if validated_count > 0 else "N/A")

# --- COMMAND LINE ARGUMENTS ---
def validate_single_image(submission_id, image_path):
    """Validate a single image."""
    db = initialize_firebase()
    result = validate_submission_image(db, submission_id, image_path)
    
    # Convert datetime objects to strings for JSON serialization
    json_result = {
        'is_valid': result['is_valid'],
        'warnings': result['warnings'],
        'errors': result['errors'],
        'metadata': {}
    }
    
    if result['metadata']:
        metadata = result['metadata'].copy()
        if 'creation_time' in metadata and metadata['creation_time']:
            metadata['creation_time'] = metadata['creation_time'].isoformat()
        if 'modification_time' in metadata and metadata['modification_time']:
            metadata['modification_time'] = metadata['modification_time'].isoformat()
        json_result['metadata'] = metadata
    
    print(json.dumps(json_result))
    return result

# --- MAIN EXECUTION ---
if __name__ == "__main__":
    import sys
    
    if len(sys.argv) > 1 and sys.argv[1] == '--validate':
        if len(sys.argv) >= 4:
            submission_id = sys.argv[2]
            image_path = sys.argv[3]
            print(f"🔍 Validating single image: {submission_id}")
            validate_single_image(submission_id, image_path)
        else:
            print("❌ Usage: python image_validator.py --validate <submission_id> <image_path>")
    else:
        validate_pending_images() 