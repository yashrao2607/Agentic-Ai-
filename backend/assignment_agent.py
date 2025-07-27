import firebase_admin
from firebase_admin import credentials, firestore

# --- IMPROVED: Define constants ---
ISSUES_COLLECTION = "issues"
WORK_ORDERS_COLLECTION = "work_orders"

# --- Firebase Initialization ---
# In a real Cloud Function, this part is often simplified.
try:
    cred = credentials.Certificate("serviceAccountKey.json")
    if not firebase_admin._apps:
        firebase_admin.initialize_app(cred)
    db = firestore.client()
except Exception as e:
    print(f"❌ FATAL: Could not initialize Firebase: {e}")
    exit()

# --- Department Mapping ---
DEPARTMENT_MAP = {
    "pothole": "Public Works",
    "streetlight": "Electrical Dept",
    "garbage": "Sanitation Dept",
    "water leakage": "Water Supply",
    "traffic signal": "Traffic Control"
}

def prioritize_and_assign():
    """
    Scans for 'new' issues, creates work orders, and updates issue statuses
    using an atomic batch write for data integrity.
    """
    print(f"[{firestore.SERVER_TIMESTAMP}] 🔎 Scanning for 'new' issues...")

    try:
        issues_ref = db.collection(ISSUES_COLLECTION)
        # --- IMPROVED: Use modern FieldFilter syntax ---
        from google.cloud.firestore_v1.base_query import FieldFilter
        query = issues_ref.where(filter=FieldFilter("status", "==", "new"))
        results = query.stream()

        # --- IMPROVED: Use a batch for atomic operations ---
        batch = db.batch()
        processed_count = 0

        for doc in results:
            data = doc.to_dict()
            issue_id = doc.id
            print(f"\n📄 Found New Issue → {issue_id}")

            subcategory = data.get("subcategory", "").lower()
            department = DEPARTMENT_MAP.get(subcategory, "General Dept (Uncategorized)")

            work_order_data = {
                "issue_id": issue_id,
                "description": data.get("description"),
                "category": data.get("category"),
                "subcategory": subcategory,
                "priority": data.get("priority"),
                "assigned_department": department,
                "status": "proposed",
                # --- IMPROVED: Use reliable server timestamp ---
                "created_at": firestore.SERVER_TIMESTAMP,
                "last_updated": firestore.SERVER_TIMESTAMP,
            }

            # 1. Add the "create work order" operation to the batch
            work_order_ref = db.collection(WORK_ORDERS_COLLECTION).document()
            batch.set(work_order_ref, work_order_data)
            print(f"✅ Work Order for '{department}' added to batch.")

            # 2. Add the "update issue" operation to the batch
            batch.update(doc.reference, {
                "status": "pending_assignment",
                "work_order_id": work_order_ref.id # Link the issue to the work order
            })
            print("🔁 Issue status update added to batch.")
            
            processed_count += 1

        # --- IMPROVED: Commit the batch once after the loop ---
        if processed_count > 0:
            batch.commit()
            print(f"\n✨ Successfully committed batch with {processed_count} operations.")
        else:
            print("✅ No new issues found to process.")

    except Exception as e:
        print(f"❌ An error occurred: {e}")


# --- NOTE: The while loop is removed as this logic should be in a Cloud Function ---
if __name__ == "__main__":
    prioritize_and_assign()