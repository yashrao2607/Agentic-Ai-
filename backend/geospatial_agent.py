import os
import sys
from datetime import datetime, timedelta
from google.cloud import bigquery, firestore
from shapely import wkt

# --- CONFIGURATION ---
try:
    from dotenv import load_dotenv
    load_dotenv()
    print("✅ Local .env file loaded.")
except ImportError:
    print("ℹ️ dotenv not found, assuming production environment.")

PROJECT_ID = os.getenv("PROJECT_ID")
BQ_DATASET = os.getenv("BQ_DATASET", "issue_data")
BQ_TABLE = os.getenv("BQ_TABLE", "historical_issues")
BQ_REGION = os.getenv("BQ_REGION", "asia-south1")
ISSUES_COLLECTION = "issues"

if not PROJECT_ID:
    print("❌ FATAL: Missing PROJECT_ID environment variable.")
    sys.exit(1)


# --- CLIENT INITIALIZATION ---
def initialize_clients():
    """Initializes and returns BigQuery and Firestore clients."""
    try:
        bq_client = bigquery.Client(project=PROJECT_ID, location=BQ_REGION)
        firestore_client = firestore.Client(project=PROJECT_ID)
        print("✅ Google Cloud clients initialized successfully.")
        return bq_client, firestore_client
    except Exception as e:
        print(f"❌ FATAL: Could not initialize Google Cloud clients: {e}")
        sys.exit(1)


# --- BIGQUERY LOGIC ---
def get_prediction_query(table_id: str) -> str:
    """Returns an advanced BigQuery SQL query to find issue hotspots."""
    return f"""
    WITH ClusteredIssues AS (
        SELECT
            *,
            ST_CLUSTERDBSCAN(ST_GEOGPOINT(longitude, latitude), 1000, 2) OVER(PARTITION BY subcategory) as cluster_id
        FROM `{table_id}`
        WHERE latitude IS NOT NULL AND longitude IS NOT NULL
    )
    SELECT
        c.category, c.subcategory,
        COUNT(*) AS source_issue_count,
        (COUNT(*) * 0.5) + (AVG(c.risk_score) * 0.5) as final_risk_score,
        ST_ASTEXT(ST_CENTROID_AGG(ST_GEOGPOINT(longitude, latitude))) as predicted_location
    FROM ClusteredIssues c
    WHERE cluster_id IS NOT NULL
    GROUP BY c.category, c.subcategory, c.cluster_id
    HAVING final_risk_score > 0.7
    ORDER BY final_risk_score DESC
    LIMIT 10;
    """


# --- COOLDOWN LOGIC ---
def check_for_recent_prediction(db, subcategory, point):
    """Checks if a similar prediction was made recently to avoid duplicates."""
    from google.cloud.firestore_v1.base_query import FieldFilter
    
    seven_days_ago = datetime.utcnow() - timedelta(days=7)
    lat_offset = 0.01
    lon_offset = 0.01

    # ✅ FIXED: Using modern FieldFilter syntax to remove warnings
    query = db.collection(ISSUES_COLLECTION) \
        .where(filter=FieldFilter("type", "==", "predicted")) \
        .where(filter=FieldFilter("subcategory", "==", subcategory)) \
        .where(filter=FieldFilter("created_at", ">=", seven_days_ago)) \
        .where(filter=FieldFilter("location", ">=", firestore.GeoPoint(point.y - lat_offset, point.x - lon_offset))) \
        .where(filter=FieldFilter("location", "<=", firestore.GeoPoint(point.y + lat_offset, point.x + lon_offset)))

    try:
        results = query.limit(1).stream()
        return len(list(results)) > 0
    except Exception as e:
        print(f"⚠️  Warning: Could not check for recent predictions. Have you created the Firestore index? {e}")
        return False


# --- MAIN LOGIC ---
def main():
    """Main function to execute the prediction workflow."""
    bq_client, firestore_client = initialize_clients()
    table_id = f"{PROJECT_ID}.{BQ_DATASET}.{BQ_TABLE}"
    query = get_prediction_query(table_id)
    
    print(f"\n🛰️  Querying BigQuery for geospatial hotspots...")
    print(f"   - Table: {table_id}")
    try:
        results = bq_client.query(query).result()
        print("✅ BigQuery query completed successfully.")
    except Exception as e:
        print(f"❌ ERROR: BigQuery query failed: {e}")
        return

    batch = firestore_client.batch()
    prediction_count = 0
    skipped_count = 0
    
    print("\n✍️  Processing high-risk zones from query results...")
    for row in results:
        point = wkt.loads(row.predicted_location)
        
        if check_for_recent_prediction(firestore_client, row.subcategory, point):
            print(f"  - Skipping duplicate hotspot: {row.subcategory} (found recent prediction)")
            skipped_count += 1
            continue

        prediction_count += 1
        print(f"  - Found new hotspot #{prediction_count}: {row.subcategory} (Risk: {row.final_risk_score:.2f})")
        
        issue_data = {
            "type": "predicted",
            "status": "new",
            "category": row.category,
            "subcategory": row.subcategory,
            "location": firestore.GeoPoint(point.y, point.x),
            "prediction_meta": {
                "risk_score": row.final_risk_score,
                "source_issue_count": row.source_issue_count
            },
            "created_at": firestore.SERVER_TIMESTAMP,
        }
        
        doc_ref = firestore_client.collection(ISSUES_COLLECTION).document()
        batch.set(doc_ref, issue_data)
    
    if prediction_count > 0:
        print(f"\n🔥 Committing {prediction_count} new predicted issue(s) to Firestore...")
        try:
            batch.commit()
            print(f"🎉 Successfully committed batch.")
        except Exception as e:
            print(f"❌ ERROR: Firestore batch commit failed: {e}")
    else:
        print("\n✅ No new high-risk zones found to predict.")

    if skipped_count > 0:
        print(f"ℹ️  Skipped {skipped_count} duplicate predictions.")

if __name__ == "__main__":
    main()