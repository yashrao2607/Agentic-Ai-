import os
import sys
from datetime import datetime, timedelta
from google.cloud import firestore
from google.cloud.firestore_v1.base_query import FieldFilter

# --- CONFIGURATION ---
# Load configuration from environment variables for security and flexibility.
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    print("dotenv not found, assuming production environment.")

PROJECT_ID = os.getenv("PROJECT_ID", "civicresolve-hackathon-466511")
ISSUES_COLLECTION = "issues"
WORK_ORDERS_COLLECTION = "work_orders"

# Basic validation to ensure the environment is set up correctly.
if not PROJECT_ID:
    print("❌ FATAL: Missing PROJECT_ID environment variable.")
    sys.exit(1)

# --- MAPPING & LOGIC ---
# Defines how many days in the future to schedule work based on priority.
PRIORITY_SCHEDULE_MAP = {
    "high": 1,
    "medium": 3,
    "low": 7
}

# --- CLIENT INITIALIZATION ---
def initialize_firestore_client():
    """Initializes and returns a Firestore client."""
    try:
        client = firestore.Client(project=PROJECT_ID)
        print("✅ Firestore client initialized successfully.")
        return client
    except Exception as e:
        print(f"❌ FATAL: Could not initialize Firestore client: {e}")
        sys.exit(1)

# --- MAIN APPLICATION LOGIC ---
def schedule_proposed_work_orders():
    """
    Finds "proposed" work orders, assigns a schedule based on priority,
    and updates their status to "scheduled" in a batch.
    """
    db = initialize_firestore_client()
    
    print(f"🔎 Scanning for 'proposed' work orders in collection '{WORK_ORDERS_COLLECTION}'...")
    
    # Query for work orders that are ready to be scheduled.
    query = db.collection(WORK_ORDERS_COLLECTION).where(filter=FieldFilter("status", "==", "proposed"))
    
    try:
        proposed_work_orders = query.stream()
    except Exception as e:
        print(f"❌ ERROR: Query failed for work orders: {e}")
        return

    batch = db.batch()
    scheduled_count = 0

    for work_order in proposed_work_orders:
        data = work_order.to_dict()
        work_order_id = work_order.id
        issue_id = data.get("issue_id") # Get the original issue ID
        
        if not issue_id:
            print(f"⚠️  Skipping work order {work_order_id} due to missing 'issue_id'.")
            continue
            
        print(f"\n📄 Processing Proposed Work Order → {work_order_id}")
        
        priority = data.get("priority", "low")
        days_to_schedule = PRIORITY_SCHEDULE_MAP.get(priority, 7)
        scheduled_date = datetime.utcnow() + timedelta(days=days_to_schedule)
        
        # --- Update the Work Order ---
        work_order_ref = db.collection(WORK_ORDERS_COLLECTION).document(work_order_id)
        batch.update(work_order_ref, {
            "status": "scheduled",
            "scheduled_date": scheduled_date.isoformat() + "Z",
            "assigned_crew": "Crew B-42", # Placeholder for a real crew assignment logic
            "last_updated": firestore.SERVER_TIMESTAMP
        })
        print(f"✅ Work Order {work_order_id} scheduled for {scheduled_date.date()}. Added to batch.")
        
        # --- Update the original Issue ---
        issue_ref = db.collection(ISSUES_COLLECTION).document(issue_id)
        batch.update(issue_ref, {
            "status": "scheduled",
            "last_updated": firestore.SERVER_TIMESTAMP
        })
        print(f"🔁 Original Issue {issue_id} status updated to 'scheduled'. Added to batch.")
        
        scheduled_count += 1

    # Commit the batch to Firestore if any work orders were scheduled.
    if scheduled_count > 0:
        try:
            batch.commit()
            print(f"\n🎉 Successfully committed batch with {scheduled_count} scheduled work orders.")
        except Exception as e:
            print(f"❌ ERROR: Firestore batch commit failed: {e}")
    else:
        print("✅ No 'proposed' work orders found to schedule.")

if __name__ == "__main__":
    schedule_proposed_work_orders()