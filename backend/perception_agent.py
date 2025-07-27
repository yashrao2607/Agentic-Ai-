import os
import sys
import json
from datetime import datetime, timedelta
import firebase_admin
from dotenv import load_dotenv
from firebase_admin import credentials, firestore
from google.cloud.firestore_v1.base_query import FieldFilter
import google.generativeai as genai

# --- NEW IMPORTS for duplicate detection ---
import imagehash
from PIL import Image
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np

# Load environment variables from .env file
load_dotenv()

# --- CONFIGURATION CONSTANTS ---
SERVICE_ACCOUNT_FILE = os.getenv("SERVICE_ACCOUNT_FILE")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
RAW_SUBMISSIONS_COLLECTION = "raw_submissions"
ISSUES_COLLECTION = "issues"
INPUT_FIELD_KEYS = ["report", "raw_submissions", "doc", "description"]
IMAGE_HASH_THRESHOLD = 5 # How similar images can be to be considered duplicates (lower is more similar)
TEXT_SIMILARITY_THRESHOLD = 0.90 # How similar text can be (0.0 to 1.0)

# --- INITIALIZATION ---
def initialize_services():
    """Initializes and returns all necessary clients and models."""
    try:
        # Initialize Firebase
        cred = credentials.Certificate(SERVICE_ACCOUNT_FILE)
        if not firebase_admin._apps:
            firebase_admin.initialize_app(cred)
        db = firestore.client()
        print("✅ Firebase Initialized Successfully.")

        # Initialize Gemini
        genai.configure(api_key=GEMINI_API_KEY)
        gemini_model = genai.GenerativeModel("gemini-1.5-pro", generation_config={"response_mime_type": "application/json"})
        print("✅ Gemini Model Initialized Successfully.")

        # Initialize Sentence Transformer Model
        sentence_model = SentenceTransformer('all-MiniLM-L6-v2')
        print("✅ Sentence Transformer Model Loaded.")
        
        return db, gemini_model, sentence_model
    except Exception as e:
        print(f"❌ FATAL: Initialization failed: {e}")
        sys.exit(1)

# --- PROMPT TEMPLATE ---
FEW_SHOT_PROMPT = """
You are a civic issue classification assistant. Given a user report, output a structured JSON object.
Examples:
User: "There’s a big pothole near Sector 14 crossing"
Output: {{ "category": "road", "subcategory": "pothole", "priority": "high", "description": "There’s a big pothole near Sector 14 crossing", "status": "new" }}
User: "Streetlight is flickering outside my house in Block C"
Output: {{ "category": "electrical", "subcategory": "streetlight", "priority": "medium", "description": "Streetlight is flickering outside my house in Block C", "status": "new" }}
Now classify:
User: "{input}"
Output:
"""

# --- ✅ NEW: Duplicate Detection Logic ---
def get_image_hash(image_path):
    """Calculates a perceptual hash for an image file."""
    if not image_path or not os.path.exists(image_path):
        return None
    try:
        with Image.open(image_path) as img:
            return str(imagehash.phash(img))
    except Exception as e:
        print(f"⚠️  Could not process image {image_path}: {e}")
        return None

def find_duplicates(db, sentence_model, new_doc_data):
    """Checks for recent text or image duplicates in Firestore."""
    one_day_ago = datetime.utcnow() - timedelta(days=1)
    
    # Check for image hash duplicates
    if new_doc_data.get("image_hash"):
        potential_matches = db.collection(RAW_SUBMISSIONS_COLLECTION).where("created_at", ">=", one_day_ago).stream()
        for match_doc in potential_matches:
            match_data = match_doc.to_dict()
            if match_data.get("image_hash"):
                hash1 = imagehash.hex_to_hash(new_doc_data["image_hash"])
                hash2 = imagehash.hex_to_hash(match_data["image_hash"])
                if hash1 - hash2 <= IMAGE_HASH_THRESHOLD:
                    return "image", match_doc.id

    # Check for text embedding duplicates
    if new_doc_data.get("text_embedding"):
        new_embedding = np.array(new_doc_data["text_embedding"]).reshape(1, -1)
        potential_matches = db.collection(RAW_SUBMISSIONS_COLLECTION).where("created_at", ">=", one_day_ago).stream()
        for match_doc in potential_matches:
            match_data = match_doc.to_dict()
            if match_data.get("text_embedding"):
                existing_embedding = np.array(match_data["text_embedding"]).reshape(1, -1)
                similarity = cosine_similarity(new_embedding, existing_embedding)[0][0]
                if similarity >= TEXT_SIMILARITY_THRESHOLD:
                    return "text", match_doc.id
    
    return None, None

# --- MAIN LOGIC ---
def process_submissions(db, gemini_model, sentence_model):
    """Fetches, checks for duplicates, classifies, and stores submissions."""
    print("\n🚀 Starting submission processing...")
    query = db.collection(RAW_SUBMISSIONS_COLLECTION).where(filter=FieldFilter("processed", "==", False))
    docs_to_process = query.stream()
    batch = db.batch()

    for doc in docs_to_process:
        data = doc.to_dict()
        print(f"\n📄 Processing Document ID: {doc.id}")

        # --- Step 1: Calculate Hashes and Embeddings ---
        user_input = next((data[key] for key in INPUT_FIELD_KEYS if key in data and data[key]), None)
        image_path = data.get("image_path") # Assuming the document contains a path to the image
        
        update_data = {}
        if user_input:
            update_data["text_embedding"] = sentence_model.encode(user_input).tolist()
        if image_path:
            update_data["image_hash"] = get_image_hash(image_path)
        
        # --- Step 2: Check for Duplicates ---
        duplicate_type, original_id = find_duplicates(db, sentence_model, update_data)
        if duplicate_type:
            print(f"🚫 Found duplicate ({duplicate_type}) of existing issue {original_id}. Flagging and skipping.")
            batch.update(doc.reference, {"processed": True, "status": "duplicate", "original_issue_id": original_id})
            continue

        # --- Step 3: Classify if Unique ---
        if not user_input:
            print("⚠️ No usable text field found. Skipping.")
            batch.update(doc.reference, {"processed": True, "status": "error", "error_message": "No text input"})
            continue

        prompt = FEW_SHOT_PROMPT.format(input=user_input)
        print(f"🤖 Calling Gemini for: \"{user_input[:50]}...\"")
        try:
            response = gemini_model.generate_content(prompt)
            structured_data = json.loads(response.text)
            print("🔎 Gemini Response:", structured_data)

            # Add hashes and embeddings to the final issue document
            structured_data.update(update_data)
            structured_data["original_submission_id"] = doc.id
            
            new_issue_ref = db.collection(ISSUES_COLLECTION).document()
            batch.set(new_issue_ref, structured_data)
            batch.update(doc.reference, {"processed": True, "status": "processed_ok"})
            print(f"✅ Document {doc.id} classified and added to batch.")
        except Exception as e:
            print(f"❌ Error processing document {doc.id}: {e}")
            batch.update(doc.reference, {"processed": True, "status": "error", "error_message": str(e)})
            
    # Commit all updates at once
    try:
        commit_results = batch.commit()
        print(f"\n✨ Successfully committed batch with {len(commit_results)} writes.")
    except Exception as e:
        print(f"❌ Batch commit failed: {e}")

# --- SCRIPT EXECUTION ---
if __name__ == "__main__":
    db_client, gemini_client, sentence_client = initialize_services()
    process_submissions(db_client, gemini_client, sentence_client)