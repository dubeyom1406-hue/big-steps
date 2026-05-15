const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer Config
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

const app = express();

// Explicit CORS for local development
app.use(cors({
    origin: '*', 
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Request Logger (Terminal mein request dekhne ke liye)
app.use((req, res, next) => {
    console.log(`📡 [${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
    next();
});

const JWT_SECRET = process.env.JWT_SECRET || 'bright-steps-super-secret-key-123';

let db;

// --- FIREBASE INITIALIZATION ---
try {
    let serviceAccount;
    
    // Check if key is provided via Environment Variable (for Production)
    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
        serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    } else {
        // Fallback to local file (for Development)
        serviceAccount = require('./serviceAccountKey.json');
    }

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    db = admin.firestore();
    console.log("🔥 Firebase Admin Initialized Successfully");
} catch (error) {
    console.warn("⚠️ ERROR: No Firebase Service Account found (Check env or serviceAccountKey.json)");
    console.warn("⚠️ Database related features will not work until you add the key.");
}

// --- MIDDLEWARE ---
const authenticateAdmin = (req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) return res.status(403).json({ message: "No token provided" });

    jwt.verify(token.split(' ')[1], JWT_SECRET, (err, decoded) => {
        if (err) return res.status(401).json({ message: "Failed to authenticate token" });
        req.adminId = decoded.id;
        next();
    });
};

// --- AUTH APIs ---

// 1. Admin Login (JWT Based)
app.post('/api/auth/admin-login', async (req, res) => {
    const { username, password } = req.body;
    
    // In production, you'd fetch this from a 'users' collection
    // For now, using hardcoded credentials as per your setup
    if (username === 'admin' && password === 'Admin@123') {
        const token = jwt.sign({ id: 'admin_1', role: 'admin' }, JWT_SECRET, { expiresIn: '24h' });
        return res.status(200).json({ 
            success: true, 
            token, 
            admin: { username: 'admin', name: 'Faculty Admin' } 
        });
    }
    
    res.status(401).json({ message: "Invalid Admin Credentials" });
});

// 2. Student Login (Check against Database)
app.post('/api/auth/student-login', async (req, res) => {
    if (!db) return res.status(503).json({ message: "Database not connected. Add serviceAccountKey.json to backend folder." });
    const { loginId, password } = req.body;
    try {
        const snapshot = await db.collection('students')
            .where('loginId', '==', loginId)
            .where('password', '==', password)
            .get();

        if (snapshot.empty) {
            return res.status(404).json({ message: "Invalid Login ID or Password" });
        }

        const studentData = snapshot.docs[0].data();
        const token = jwt.sign({ id: snapshot.docs[0].id, role: 'student' }, JWT_SECRET, { expiresIn: '12h' });

        res.status(200).json({ 
            success: true, 
            token, 
            student: { id: snapshot.docs[0].id, ...studentData } 
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// --- STUDENT DATA APIs ---

// 3. Get all students (Protected)
app.get('/api/students', authenticateAdmin, async (req, res) => {
    if (!db) return res.status(503).json({ message: "Database connection missing." });
    try {
        const snapshot = await db.collection('students').orderBy('createdAt', 'desc').get();
        const students = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        res.status(200).json(students);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 4. Add a student
app.post('/api/students', async (req, res) => {
    if (!db) return res.status(503).json({ message: "Database connection missing." });
    try {
        const newStudent = {
            ...req.body,
            createdAt: new Date().toISOString()
        };
        const docRef = await db.collection('students').add(newStudent);
        res.status(201).json({ id: docRef.id, ...newStudent });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 4.5 Get single student
app.get('/api/students/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const doc = await db.collection('students').doc(id).get();
        if (doc.exists) {
            res.status(200).json({ id: doc.id, ...doc.data() });
        } else {
            res.status(404).json({ message: "Student not found" });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 5. Delete a student (Protected)
app.delete('/api/students/:id', authenticateAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        await db.collection('students').doc(id).delete();
        res.status(200).json({ message: "Student record deleted" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 6. Update student details
app.put('/api/students/:id', authenticateAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        await db.collection('students').doc(id).update(req.body);
        res.status(200).json({ message: "Student updated successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// --- SUBJECT APIs ---

// 7. Get all subjects
app.get('/api/subjects', authenticateAdmin, async (req, res) => {
    if (!db) return res.status(503).json({ message: "Database connection missing." });
    try {
        const snapshot = await db.collection('subjects').orderBy('createdAt', 'desc').get();
        const subjects = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        res.status(200).json(subjects);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 8. Add a subject
app.post('/api/subjects', authenticateAdmin, async (req, res) => {
    if (!db) return res.status(503).json({ message: "Database connection missing." });
    try {
        const newSubject = {
            ...req.body,
            createdAt: new Date().toISOString()
        };
        const docRef = await db.collection('subjects').add(newSubject);
        res.status(201).json({ id: docRef.id, ...newSubject });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 9. Delete a subject
app.delete('/api/subjects/:id', authenticateAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        await db.collection('subjects').doc(id).delete();
        res.status(200).json({ message: "Subject deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// --- STUDY MATERIALS APIs ---

// 10. Upload a new material (PDF/Image)
app.post('/api/materials', authenticateAdmin, upload.single('file'), async (req, res) => {
    if (!db) return res.status(503).json({ message: "Database connection missing." });
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }

        const { title, subject, classes } = req.body;
        
        // classes comes as a stringified JSON array from FormData
        let parsedClasses = [];
        try {
            parsedClasses = JSON.parse(classes);
        } catch(e) {
            parsedClasses = [classes]; // fallback if it's a single string
        }

        const newMaterial = {
            title,
            subject,
            classes: parsedClasses,
            fileUrl: `/uploads/${req.file.filename}`,
            originalName: req.file.originalname,
            createdAt: new Date().toISOString()
        };

        const docRef = await db.collection('materials').add(newMaterial);
        res.status(201).json({ id: docRef.id, ...newMaterial });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 11. Get all materials (Admin can see all, Students can filter by class and subject)
app.get('/api/materials', async (req, res) => {
    if (!db) return res.status(503).json({ message: "Database connection missing." });
    try {
        const { classGrade, subject } = req.query;
        let query = db.collection('materials');
        
        if (subject) {
            query = query.where('subject', '==', subject);
        }
        
        const snapshot = await query.orderBy('createdAt', 'desc').get();
        let materials = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // Firestore doesn't support 'array-contains-any' effectively for our exact usecase alongside other filters without composite indexes
        // So we filter by class in memory if classGrade is provided
        if (classGrade) {
            materials = materials.filter(m => m.classes && m.classes.includes(classGrade));
        }

        res.status(200).json(materials);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 12. Delete a material
app.delete('/api/materials/:id', authenticateAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const doc = await db.collection('materials').doc(id).get();
        if (doc.exists) {
            const data = doc.data();
            // Try to delete the physical file
            if (data.fileUrl) {
                const filePath = path.join(__dirname, data.fileUrl);
                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                }
            }
            await db.collection('materials').doc(id).delete();
            res.status(200).json({ message: "Material deleted" });
        } else {
            res.status(404).json({ message: "Material not found" });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// --- DASHBOARD STATS API ---

// 7. Get Dashboard Business Stats (Protected)
app.get('/api/stats', authenticateAdmin, async (req, res) => {
    if (!db) return res.status(503).json({ message: "Database connection missing." });
    try {
        const snapshot = await db.collection('students').get();
        const students = snapshot.docs.map(doc => doc.data());
        
        let totalRevenue = 0;
        const classCount = {};
        
        students.forEach(s => {
            // Summing both Admission and Monthly Fee for total revenue
            const admission = Number(s.admissionFee || 0);
            const monthly = Number(s.monthlyFee || 0);
            const paid = Number(s.totalPaid || 0);
            
            // We'll use the higher of totalPaid or (admission + monthly) 
            // to ensure no revenue is missed
            totalRevenue += Math.max(paid, (admission + monthly));
            
            const cl = s.classGrade || 'Unknown';
            classCount[cl] = (classCount[cl] || 0) + 1;
        });

        res.status(200).json({
            totalStudents: students.length,
            revenue: totalRevenue,
            activeCourses: 12,
            classDistribution: classCount
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Bright Steps Backend running on port ${PORT}`);
});
