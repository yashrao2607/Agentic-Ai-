// server.js

// --- Import necessary packages ---
const express = require('express');
const multer = require('multer');
const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');
const cors = require('cors');

// --- Configuration ---
const port = 3001;

// --- Directory Setup ---
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
}

// --- Firebase Initialization ---
try {
    const serviceAccount = require('./serviceAccountKey.json');
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        // ✅ This is the correct URL format
        storageBucket: "poetic-inkwell-464523-j5.firebasestorage.app"
    });
    console.log("✅ Firebase Admin initialized successfully.");
} catch (error) {
    console.error("❌ Firebase Admin initialization failed:", error);
    process.exit(1);
}

const db = admin.firestore();
const bucket = admin.storage().bucket();
const app = express();

// --- Middleware ---
app.use(cors());

// --- Multer Configuration ---
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadsDir),
    filename: (req, file, cb) => cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`)
});
const upload = multer({ storage: storage });

// --- API Routes ---
app.get('/', (req, res) => {
    res.status(200).send('<h1>✅ Backend Server is Running!</h1>');
});

// Test endpoint to check database connection
app.get('/api/test-db', async (req, res) => {
    try {
        console.log('🧪 Testing database connection...');
        const testSnapshot = await db.collection('raw_submissions').limit(1).get();
        console.log(`✅ Database connection successful. Found ${testSnapshot.size} documents in raw_submissions`);
        
        if (testSnapshot.size > 0) {
            const testDoc = testSnapshot.docs[0];
            const testData = testDoc.data();
            console.log('📋 Sample document data:', JSON.stringify(testData, null, 2));
        }
        
        res.status(200).json({
            success: true,
            message: 'Database connection successful',
            documentCount: testSnapshot.size
        });
    } catch (error) {
        console.error('❌ Database connection failed:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Get all problems with locations
app.get('/api/problems', async (req, res) => {
    try {
        console.log('📊 Fetching problems from database...');
        
        // Get raw submissions
        const rawSubmissionsSnapshot = await db.collection('raw_submissions').get();
        console.log(`📋 Found ${rawSubmissionsSnapshot.size} raw submissions in database`);
        const rawSubmissions = [];
        
        rawSubmissionsSnapshot.forEach(doc => {
            const data = doc.data();
            console.log(`📋 Raw submission ${doc.id}:`, JSON.stringify(data, null, 2));
            
            // Check different possible location formats
            let location = null;
            
            // Parse string format like "24.579804, 73.612041"
            if (data.location && typeof data.location === 'string') {
                const coords = data.location.split(',').map(coord => parseFloat(coord.trim()));
                if (coords.length === 2 && !isNaN(coords[0]) && !isNaN(coords[1])) {
                    location = { lat: coords[0], lng: coords[1] };
                    console.log(`✅ Parsed location string: ${data.location} -> lat: ${coords[0]}, lng: ${coords[1]}`);
                }
            } else if (data.location && data.location.lat && data.location.lng) {
                location = { lat: data.location.lat, lng: data.location.lng };
            } else if (data.location && data.location.latitude && data.location.longitude) {
                location = { lat: data.location.latitude, lng: data.location.longitude };
            } else if (data.lat && data.lng) {
                location = { lat: data.lat, lng: data.lng };
            } else if (data.latitude && data.longitude) {
                location = { lat: data.latitude, lng: data.longitude };
            }
            
            if (location) {
                rawSubmissions.push({
                    id: doc.id,
                    title: data.title || 'Untitled Issue',
                    category: data.category || 'Uncategorized',
                    status: data.status || 'submitted',
                    location: location,
                    createdAt: data.created_at ? data.created_at.toDate() : new Date(),
                    imageUrl: data.imageUrl,
                    source: 'raw_submissions'
                });
            } else {
                console.log(`⚠️ No valid location found for submission ${doc.id}`);
            }
        });
        
        // Get processed issues
        const issuesSnapshot = await db.collection('issues').get();
        const issues = [];
        
        issuesSnapshot.forEach(doc => {
            const data = doc.data();
            console.log(`📋 Issue ${doc.id}:`, JSON.stringify(data, null, 2));
            
            // Check different possible location formats
            let location = null;
            
            // Parse string format like "24.579804, 73.612041"
            if (data.location && typeof data.location === 'string') {
                const coords = data.location.split(',').map(coord => parseFloat(coord.trim()));
                if (coords.length === 2 && !isNaN(coords[0]) && !isNaN(coords[1])) {
                    location = { lat: coords[0], lng: coords[1] };
                    console.log(`✅ Parsed location string: ${data.location} -> lat: ${coords[0]}, lng: ${coords[1]}`);
                }
            } else if (data.location && data.location.latitude && data.location.longitude) {
                location = { lat: data.location.latitude, lng: data.location.longitude };
            } else if (data.location && data.location.lat && data.location.lng) {
                location = { lat: data.location.lat, lng: data.location.lng };
            } else if (data.lat && data.lng) {
                location = { lat: data.lat, lng: data.lng };
            } else if (data.latitude && data.longitude) {
                location = { lat: data.latitude, lng: data.longitude };
            }
            
            if (location) {
                issues.push({
                    id: doc.id,
                    title: data.title || data.subcategory || 'Issue',
                    category: data.category || data.subcategory || 'Uncategorized',
                    status: data.status || 'new',
                    location: location,
                    createdAt: data.created_at ? data.created_at.toDate() : new Date(),
                    assignedTeam: data.assigned_team,
                    workOrderId: data.work_order_id,
                    source: 'issues'
                });
            } else {
                console.log(`⚠️ No valid location found for issue ${doc.id}`);
            }
        });
        
        const allProblems = [...rawSubmissions, ...issues];
        console.log(`✅ Found ${allProblems.length} problems with locations (${rawSubmissions.length} from DB + ${issues.length} from issues collection)`);
        
        res.status(200).json({
            problems: allProblems,
            summary: {
                total: allProblems.length,
                rawSubmissions: rawSubmissions.length,
                issues: issues.length
            }
        });
        
    } catch (error) {
        console.error('❌ Error fetching problems:', error);
        res.status(500).json({ 
            error: 'Failed to fetch problems',
            details: error.message 
        });
    }
});

app.post('/api/submit-report', upload.single('photo'), async (req, res) => {
    console.log('\n--- NEW SUBMISSION REQUEST RECEIVED ---');
    try {
        const { title, description, category, severity, location } = req.body;
        
        let imageUrl = '';
        let imagePath = '';
        let imageValidation = null;

        // --- Handle image upload to Firebase Storage ---
        if (req.file) {
            console.log(`[1] Photo received: ${req.file.filename}`);
            const filePath = req.file.path;
            imagePath = filePath;

            try {
                // Upload to Firebase Storage directly without validation
                const destination = `images/${req.file.filename}`;
                console.log('[2] Uploading to Firebase Storage...');
                await bucket.upload(filePath, { destination });
                console.log('[3] Upload to Storage successful.');
                const file = bucket.file(destination);
                [imageUrl] = await file.getSignedUrl({ action: 'read', expires: '03-09-2491' });
                console.log('[4] Image URL generated successfully');
                
            } catch (uploadError) {
                console.error('[UPLOAD] Error uploading image:', uploadError);
                return res.status(500).send({ 
                    error: 'Failed to upload image to storage.',
                    details: uploadError.message
                });
            }
        }

        const submissionData = {
            title,
            description,
            category: category || 'Uncategorized',
            severity: severity ? parseInt(severity, 10) : 3,
            location: location || '',
            imageUrl: imageUrl,
            image_path: imagePath,
            processed: false,
            status: "submitted",
            created_at: admin.firestore.FieldValue.serverTimestamp(),
        };
        
        console.log('[4] Prepared data for Firestore:', JSON.stringify(submissionData, null, 2));
        console.log('[5] Attempting to write to Firestore collection: raw_submissions...');
        
        const submissionRef = await db.collection('raw_submissions').add(submissionData);
        
        console.log(`[6] ✅ Firestore write successful! Document ID: ${submissionRef.id}`);

        res.status(200).send({ message: 'Submission successful!', id: submissionRef.id });

    } catch (error) {
        console.error('❌ FULL ERROR during submission process:', error.message);
        res.status(500).send({ 
            error: 'Failed to submit report due to a server error.',
            details: error.message 
        });
    }
});

// --- Start the Server ---
app.listen(port, () => {
    console.log(`🚀 Backend server listening at http://localhost:${port}`);
});
