const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');
const dns = require('dns');
dns.setDefaultResultOrder('ipv4first'); // Force IPv4 — Render free tier has no IPv6 support
require('dotenv').config();

const emailUser = process.env.EMAIL_USER ? process.env.EMAIL_USER.trim() : '';
const emailPass = process.env.EMAIL_PASS ? process.env.EMAIL_PASS.replace(/\s+/g, '') : '';

// Configure nodemailer transporter using environment variables
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // Use STARTTLS (port 587) instead of SSL (port 465) — Render blocks 465
    auth: {
        user: emailUser,
        pass: emailPass
    },
    tls: {
        rejectUnauthorized: false
    },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000
});

// Verify SMTP transporter connection at startup
console.log(`📧 Email Config: USER=${emailUser ? emailUser.substring(0, 5) + '***' : '(NOT SET)'}, PASS=${emailPass ? '****set****' : '(NOT SET)'}`);
if (emailUser && emailPass && emailUser !== 'your-email@gmail.com') {
    transporter.verify(function (error, success) {
        if (error) {
            console.error("❌ SMTP Transporter Verification Failed:", error.message);
        } else {
            console.log("✅ SMTP Server is ready to send emails");
        }
    });
} else {
    console.warn("⚠️ SMTP NOT configured — emails will NOT be sent. Set EMAIL_USER & EMAIL_PASS env vars.");
}

// Helper function to send OTP email
async function sendOTPEmail(toEmail, otp) {
    const subject = 'Bright Steps Login Verification OTP';
    const html = `
        <div style="font-family: 'Outfit', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 20px; max-width: 600px; margin: auto; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff; box-shadow: 0 4px 10px rgba(0,0,0,0.03);">
            <div style="text-align: center; border-bottom: 2px solid #5b4fcf; padding-bottom: 15px; margin-bottom: 20px;">
                <h2 style="color: #111827; margin: 0; font-size: 22px; font-weight: 800;">Bright Steps Coaching Centre</h2>
            </div>
            <div style="padding: 10px 0;">
                <p style="color: #374151; font-size: 16px; line-height: 1.6;">Hello,</p>
                <p style="color: #374151; font-size: 16px; line-height: 1.6;">You requested a login code to access the Student Portal. Please use the One-Time Password (OTP) below to verify your session:</p>
                <div style="text-align: center; margin: 30px 0;">
                    <span style="font-size: 32px; font-weight: 800; letter-spacing: 6px; color: #5b4fcf; background-color: #ede9ff; padding: 12px 30px; border-radius: 8px; border: 1.5px dashed #5b4fcf; display: inline-block;">${otp}</span>
                </div>
                <p style="color: #ef4444; font-size: 14px; font-weight: 600; margin-top: 25px;">Note: This OTP is confidential and will expire in 5 minutes.</p>
            </div>
            <div style="border-top: 1px solid #e2e8f0; padding-top: 15px; margin-top: 30px; text-align: center; font-size: 12px; color: #6b7280;">
                <p style="margin: 0;">Need assistance? Contact support at brighstepsfoundationclasses@gmail.com</p>
                <p style="margin: 5px 0 0 0;">© 2026 Bright Steps Coaching Centre. All rights reserved.</p>
            </div>
        </div>
    `;

    // 1. Try Google Apps Script Webhook first (if configured)
    if (process.env.EMAIL_SCRIPT_URL) {
        try {
            console.log(`📤 Attempting to send OTP via Google Apps Script Webhook...`);
            const response = await fetch(process.env.EMAIL_SCRIPT_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'text/plain' },
                body: JSON.stringify({ to: toEmail, subject, html }),
                redirect: 'follow'
            });
            const responseText = await response.text();
            console.log(`📬 Apps Script response (status ${response.status}):`, responseText.substring(0, 300));
            
            // Try to parse as JSON
            try {
                const result = JSON.parse(responseText);
                if (result && (result.success || result.status === 'success')) {
                    console.log(`✅ OTP email sent successfully via Google Apps Script to ${toEmail}`);
                    return true;
                } else {
                    console.error("❌ Google Apps Script returned unsuccessful result:", result);
                }
            } catch (parseErr) {
                // Response is HTML — check if it contains success indicators
                if (responseText.includes('Email sent') || responseText.includes('"success":true')) {
                    console.log(`✅ OTP email sent (parsed from HTML response) to ${toEmail}`);
                    return true;
                }
                console.error("❌ Google Apps Script returned non-JSON response:", responseText.substring(0, 500));
            }
        } catch (scriptErr) {
            console.error("❌ Failed to send OTP via Google Apps Script Webhook:", scriptErr.message);
        }
    }

    // 2. Fallback to standard SMTP
    if (!emailUser || emailUser === 'your-email@gmail.com' || !emailPass) {
        console.log(`⚠️ Email sending skipped (EMAIL_USER/EMAIL_PASS is not configured in backend/.env)`);
        return null;
    }
    const mailOptions = {
        from: `"Bright Steps Coaching" <${emailUser}>`,
        to: toEmail,
        subject: subject,
        html: html
    };
    return transporter.sendMail(mailOptions);
}

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
let isMockMode = false;

let mockSubjects = [];
let mockStudents = [];
let mockBatches = [];
let mockChapters = [];
let mockLectures = [];
let mockMaterials = [];


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
    console.warn("⚠️ Running in MOCK DATABASE mode for testing.");
    isMockMode = true;
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
    const { loginId, password } = req.body;
    
    if (isMockMode) {
        const student = mockStudents.find(s => s.loginId === loginId.trim() && s.password === password);
        if (!student) {
            return res.status(404).json({ message: "Invalid Login ID or Password" });
        }
        const token = jwt.sign({ id: student.id, role: 'student' }, JWT_SECRET, { expiresIn: '12h' });
        return res.status(200).json({ success: true, token, student });
    }

    if (!db) return res.status(503).json({ message: "Database not connected. Add serviceAccountKey.json to backend folder." });
    try {
        let snapshot;
        if (loginId) {
            snapshot = await db.collection('students')
                .where('loginId', '==', loginId.trim())
                .where('password', '==', password)
                .get();
        } else {
            return res.status(400).json({ message: "Login ID is required" });
        }

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

// Temporary in-memory store for OTPs
const otpStore = new Map(); // key: email (lowercase), value: { otp, expiresAt }

// 2.5 Send OTP for Student Email Login
app.post('/api/auth/send-otp', async (req, res) => {
    const { email } = req.body;
    if (!email) {
        return res.status(400).json({ message: "Email address is required" });
    }

    const trimmedEmail = email.trim().toLowerCase();

    if (isMockMode) {
        const student = mockStudents.find(s => s.email && s.email.trim().toLowerCase() === trimmedEmail);
        if (!student) {
            return res.status(404).json({ message: "Student not found" });
        }
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        otpStore.set(trimmedEmail, { otp, expiresAt: Date.now() + 5 * 60 * 1000 });

        console.log(`\n========================================`);
        console.log(`📧 [MOCK EMAIL OTP SENT]`);
        console.log(`   To:      ${trimmedEmail}`);
        console.log(`   OTP:     ${otp}`);
        console.log(`   Expires: 5 minutes`);
        console.log(`========================================\n`);

        const hasEmailConfig = (emailUser && emailUser !== 'your-email@gmail.com' && emailPass) || process.env.EMAIL_SCRIPT_URL;

        if (hasEmailConfig) {
            sendOTPEmail(trimmedEmail, otp)
                .then(mailResult => {
                    if (mailResult) {
                        console.log(`✅ Mock OTP email sent successfully to ${trimmedEmail}`);
                    }
                })
                .catch(err => {
                    console.error("❌ Failed to send mock OTP email:", err);
                });

            return res.status(200).json({ success: true, message: `OTP sent successfully! Please check your email inbox.` });
        } else {
            return res.status(200).json({ success: true, message: `OTP sent successfully! Enter ${otp} to verify (printed in logs).` });
        }
    }

    if (!db) return res.status(503).json({ message: "Database not connected. Add serviceAccountKey.json to backend folder." });
    try {
        const snapshot = await db.collection('students').get();
        const studentDoc = snapshot.docs.find(doc => {
            const data = doc.data();
            return data.email && data.email.trim().toLowerCase() === trimmedEmail;
        });

        if (!studentDoc) {
            return res.status(404).json({ message: "Student not found" });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        otpStore.set(trimmedEmail, { otp, expiresAt: Date.now() + 5 * 60 * 1000 });

        console.log(`\n========================================`);
        console.log(`📧 [EMAIL OTP SENT]`);
        console.log(`   To:      ${trimmedEmail}`);
        console.log(`   OTP:     ${otp}`);
        console.log(`   Expires: 5 minutes`);
        console.log(`========================================\n`);

        const hasEmailConfig = (emailUser && emailUser !== 'your-email@gmail.com' && emailPass) || process.env.EMAIL_SCRIPT_URL;

        if (hasEmailConfig) {
            sendOTPEmail(trimmedEmail, otp)
                .then(mailResult => {
                    if (mailResult) {
                        console.log(`✅ OTP email sent successfully to ${trimmedEmail}`);
                    }
                })
                .catch(err => {
                    console.error("❌ Failed to send OTP email:", err);
                });

            return res.status(200).json({ success: true, message: "OTP sent successfully! Please check your email inbox." });
        } else {
            return res.status(200).json({ success: true, message: `OTP generated successfully! (SMTP pending, enter ${otp} to verify)` });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 2.6 Verify OTP and Student Login
app.post('/api/auth/verify-otp', async (req, res) => {
    const { email, otp } = req.body;
    
    if (!email || !otp) {
        return res.status(400).json({ message: "Email and OTP are required" });
    }

    const trimmedEmail = email.trim().toLowerCase();
    const record = otpStore.get(trimmedEmail);

    if (!record) {
        return res.status(400).json({ message: "OTP was not requested or has expired. Please try again." });
    }

    if (record.expiresAt < Date.now()) {
        otpStore.delete(trimmedEmail);
        return res.status(400).json({ message: "OTP has expired. Please request a new one." });
    }

    if (record.otp !== otp.trim()) {
        return res.status(400).json({ message: "Invalid OTP code. Please check and try again." });
    }

    otpStore.delete(trimmedEmail);

    if (isMockMode) {
        const student = mockStudents.find(s => s.email && s.email.trim().toLowerCase() === trimmedEmail);
        if (!student) {
            return res.status(404).json({ message: "Student record could not be retrieved." });
        }
        const token = jwt.sign({ id: student.id, role: 'student' }, JWT_SECRET, { expiresIn: '12h' });
        return res.status(200).json({ success: true, token, student });
    }

    if (!db) return res.status(503).json({ message: "Database not connected. Add serviceAccountKey.json to backend folder." });
    try {
        const snapshot = await db.collection('students').get();
        const studentDoc = snapshot.docs.find(doc => {
            const data = doc.data();
            return data.email && data.email.trim().toLowerCase() === trimmedEmail;
        });

        if (!studentDoc) {
            return res.status(404).json({ message: "Student record could not be retrieved." });
        }

        const studentData = studentDoc.data();
        const token = jwt.sign({ id: studentDoc.id, role: 'student' }, JWT_SECRET, { expiresIn: '12h' });

        res.status(200).json({ 
            success: true, 
            token, 
            student: { id: studentDoc.id, ...studentData } 
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// --- STUDENT DATA APIs ---

// 3. Get all students (Protected)
app.get('/api/students', authenticateAdmin, async (req, res) => {
    if (isMockMode) {
        return res.status(200).json(mockStudents);
    }
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
    const payload = { ...req.body };
    if (payload.email) {
        payload.email = payload.email.trim().toLowerCase();
    }

    if (isMockMode) {
        const newStudent = {
            id: `student_${Date.now()}`,
            ...payload,
            createdAt: new Date().toISOString()
        };
        mockStudents.push(newStudent);
        return res.status(201).json(newStudent);
    }

    if (!db) return res.status(503).json({ message: "Database connection missing." });
    try {
        const newStudent = {
            ...payload,
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
    const { id } = req.params;
    if (isMockMode) {
        const student = mockStudents.find(s => s.id === id);
        if (student) {
            return res.status(200).json(student);
        } else {
            return res.status(404).json({ message: "Student not found" });
        }
    }
    try {
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
    const { id } = req.params;
    if (isMockMode) {
        mockStudents = mockStudents.filter(s => s.id !== id);
        return res.status(200).json({ message: "Student record deleted" });
    }
    try {
        await db.collection('students').doc(id).delete();
        res.status(200).json({ message: "Student record deleted" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 6. Update student details
app.put('/api/students/:id', authenticateAdmin, async (req, res) => {
    const { id } = req.params;
    const payload = { ...req.body };
    if (payload.email) {
        payload.email = payload.email.trim().toLowerCase();
    }

    if (isMockMode) {
        const index = mockStudents.findIndex(s => s.id === id);
        if (index !== -1) {
            mockStudents[index] = { ...mockStudents[index], ...payload };
            return res.status(200).json({ message: "Student updated successfully" });
        } else {
            return res.status(404).json({ message: "Student not found" });
        }
    }
    try {
        await db.collection('students').doc(id).update(payload);
        res.status(200).json({ message: "Student updated successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// --- SUBJECT APIs ---

// 7. Get all subjects
app.get('/api/subjects', authenticateAdmin, async (req, res) => {
    if (isMockMode) {
        return res.status(200).json(mockSubjects);
    }
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
    if (isMockMode) {
        const newSubject = {
            id: `sub_${Date.now()}`,
            ...req.body,
            createdAt: new Date().toISOString()
        };
        mockSubjects.push(newSubject);
        return res.status(201).json(newSubject);
    }
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
    const { id } = req.params;
    if (isMockMode) {
        mockSubjects = mockSubjects.filter(s => s.id !== id);
        return res.status(200).json({ message: "Subject deleted successfully" });
    }
    try {
        await db.collection('subjects').doc(id).delete();
        res.status(200).json({ message: "Subject deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// --- STUDY MATERIALS APIs ---

// 10. Upload a new material (PDF/Image)
app.post('/api/materials', authenticateAdmin, upload.single('file'), async (req, res) => {
    try {
        const { title, subject, classes, batchId, fileUrl } = req.body;
        
        let finalFileUrl = fileUrl || '';
        let originalName = 'Drive Link';

        if (req.file) {
            finalFileUrl = `/uploads/${req.file.filename}`;
            originalName = req.file.originalname;
        } else if (!finalFileUrl) {
            return res.status(400).json({ message: "No file uploaded or link provided" });
        }

        // classes can be a stringified JSON array, a real array, or a single string
        let parsedClasses = [];
        if (classes) {
            if (Array.isArray(classes)) {
                parsedClasses = classes;
            } else {
                try {
                    parsedClasses = JSON.parse(classes);
                    if (!Array.isArray(parsedClasses)) {
                        parsedClasses = [parsedClasses];
                    }
                } catch(e) {
                    parsedClasses = [classes];
                }
            }
        }

        const newMaterial = {
            title,
            subject,
            classes: parsedClasses,
            batchId: batchId || null,
            fileUrl: finalFileUrl,
            originalName: originalName,
            createdAt: new Date().toISOString()
        };

        if (isMockMode) {
            const mockMat = { id: `material_${Date.now()}`, ...newMaterial };
            mockMaterials.unshift(mockMat);
            return res.status(201).json(mockMat);
        }

        if (!db) return res.status(503).json({ message: "Database connection missing." });
        const docRef = await db.collection('materials').add(newMaterial);
        res.status(201).json({ id: docRef.id, ...newMaterial });
    } catch (error) {
        console.error("Error in /api/materials POST:", error);
        res.status(500).json({ error: error.message });
    }
});

// 11. Get all materials (Admin can see all, Students can filter by class, subject, and batch)
app.get('/api/materials', async (req, res) => {
    if (isMockMode) {
        const { classGrade, subject, batchId } = req.query;
        let list = [...mockMaterials];
        if (subject) list = list.filter(m => m.subject === subject);
        if (batchId) list = list.filter(m => m.batchId === batchId);
        if (classGrade) list = list.filter(m => m.classes && m.classes.includes(classGrade));
        return res.status(200).json(list);
    }

    if (!db) return res.status(503).json({ message: "Database connection missing." });
    try {
        const { classGrade, subject, batchId } = req.query;
        let query = db.collection('materials');
        
        if (subject) {
            query = query.where('subject', '==', subject);
        }
        if (batchId) {
            query = query.where('batchId', '==', batchId);
        }
        
        const snapshot = await query.get();
        let materials = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        materials.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

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
    const { id } = req.params;
    if (isMockMode) {
        mockMaterials = mockMaterials.filter(m => m.id !== id);
        return res.status(200).json({ message: "Material deleted" });
    }

    try {
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


// --- BATCH APIs ---

// GET all batches (public)
app.get('/api/batches', async (req, res) => {
    if (isMockMode) {
        return res.status(200).json(mockBatches);
    }
    if (!db) return res.status(503).json({ message: "Database connection missing." });
    try {
        const snapshot = await db.collection('batches').orderBy('createdAt', 'desc').get();
        const batches = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        res.status(200).json(batches);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST create batch (admin)
app.post('/api/batches', authenticateAdmin, async (req, res) => {
    if (isMockMode) {
        const nb = { id: `batch_${Date.now()}`, ...req.body, createdAt: new Date().toISOString() };
        mockBatches.push(nb);
        return res.status(201).json(nb);
    }
    if (!db) return res.status(503).json({ message: "Database connection missing." });
    try {
        const newBatch = { ...req.body, createdAt: new Date().toISOString() };
        const docRef = await db.collection('batches').add(newBatch);
        res.status(201).json({ id: docRef.id, ...newBatch });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// PUT update batch (admin)
app.put('/api/batches/:id', authenticateAdmin, async (req, res) => {
    const { id } = req.params;
    if (isMockMode) {
        const idx = mockBatches.findIndex(b => b.id === id);
        if (idx !== -1) { mockBatches[idx] = { ...mockBatches[idx], ...req.body }; return res.status(200).json(mockBatches[idx]); }
        return res.status(404).json({ message: 'Batch not found' });
    }
    if (!db) return res.status(503).json({ message: "Database connection missing." });
    try {
        await db.collection('batches').doc(id).update(req.body);
        res.status(200).json({ message: 'Batch updated' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// DELETE batch (admin)
app.delete('/api/batches/:id', authenticateAdmin, async (req, res) => {
    const { id } = req.params;
    if (isMockMode) {
        mockBatches = mockBatches.filter(b => b.id !== id);
        return res.status(200).json({ message: 'Batch deleted' });
    }
    if (!db) return res.status(503).json({ message: "Database connection missing." });
    try {
        await db.collection('batches').doc(id).delete();
        res.status(200).json({ message: 'Batch deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET all students enrolled in a specific batch (admin)
app.get('/api/batches/:id/students', authenticateAdmin, async (req, res) => {
    const { id } = req.params;
    if (isMockMode) {
        const list = mockStudents.filter(s => s.enrolledBatches && s.enrolledBatches.includes(id));
        return res.status(200).json(list);
    }
    if (!db) return res.status(503).json({ message: "Database connection missing." });
    try {
        const snapshot = await db.collection('students').where('enrolledBatches', 'array-contains', id).get();
        const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        res.status(200).json(list);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST enroll student in batch
app.post('/api/students/:id/enroll', async (req, res) => {
    const { id } = req.params;
    const { batchId } = req.body;
    if (!batchId) return res.status(400).json({ message: 'batchId required' });

    if (isMockMode) {
        const idx = mockStudents.findIndex(s => s.id === id);
        if (idx !== -1) {
            const enrolled = mockStudents[idx].enrolledBatches || [];
            if (!enrolled.includes(batchId)) enrolled.push(batchId);
            mockStudents[idx].enrolledBatches = enrolled;
            return res.status(200).json({ success: true, enrolledBatches: enrolled });
        }
        return res.status(404).json({ message: 'Student not found' });
    }
    if (!db) return res.status(503).json({ message: "Database connection missing." });
    try {
        const docRef = db.collection('students').doc(id);
        const doc = await docRef.get();
        if (!doc.exists) return res.status(404).json({ message: 'Student not found' });
        const data = doc.data();
        const enrolled = data.enrolledBatches || [];
        if (!enrolled.includes(batchId)) enrolled.push(batchId);
        await docRef.update({ enrolledBatches: enrolled });
        res.status(200).json({ success: true, enrolledBatches: enrolled });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// --- CHAPTERS APIs ---
app.get('/api/chapters', async (req, res) => {
    const { batchId, subject } = req.query;
    if (isMockMode) {
        let list = [...mockChapters];
        if (batchId) list = list.filter(c => c.batchId === batchId);
        if (subject) list = list.filter(c => c.subject?.toLowerCase() === subject.toLowerCase());
        return res.status(200).json(list);
    }
    if (!db) return res.status(503).json({ message: "Database connection missing." });
    try {
        let query = db.collection('chapters');
        if (batchId) query = query.where('batchId', '==', batchId);
        if (subject) query = query.where('subject', '==', subject);
        const snapshot = await query.get();
        const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        res.status(200).json(list);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/chapters', async (req, res) => {
    const payload = { ...req.body, createdAt: new Date().toISOString() };
    if (isMockMode) {
        const nc = { id: `ch_${Date.now()}`, ...payload };
        mockChapters.push(nc);
        return res.status(201).json(nc);
    }
    if (!db) return res.status(503).json({ message: "Database connection missing." });
    try {
        const docRef = await db.collection('chapters').add(payload);
        res.status(201).json({ id: docRef.id, ...payload });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.delete('/api/chapters/:id', async (req, res) => {
    const { id } = req.params;
    if (isMockMode) {
        mockChapters = mockChapters.filter(c => c.id !== id);
        mockLectures = mockLectures.filter(l => l.chapterId !== id);
        return res.status(200).json({ message: 'Chapter deleted' });
    }
    if (!db) return res.status(503).json({ message: "Database connection missing." });
    try {
        await db.collection('chapters').doc(id).delete();
        const snapshot = await db.collection('lectures').where('chapterId', '==', id).get();
        const batch = db.batch();
        snapshot.docs.forEach(doc => batch.delete(doc.ref));
        await batch.commit();
        res.status(200).json({ message: 'Chapter deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// --- LECTURES APIs ---
app.get('/api/lectures', async (req, res) => {
    const { batchId, subject, chapterId } = req.query;
    if (isMockMode) {
        let list = [...mockLectures];
        if (batchId) list = list.filter(l => l.batchId === batchId);
        if (subject) list = list.filter(l => l.subject?.toLowerCase() === subject.toLowerCase());
        if (chapterId) list = list.filter(l => l.chapterId === chapterId);
        return res.status(200).json(list);
    }
    if (!db) return res.status(503).json({ message: "Database connection missing." });
    try {
        let query = db.collection('lectures');
        if (batchId) query = query.where('batchId', '==', batchId);
        if (subject) query = query.where('subject', '==', subject);
        if (chapterId) query = query.where('chapterId', '==', chapterId);
        const snapshot = await query.get();
        const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        res.status(200).json(list);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/lectures', async (req, res) => {
    const payload = { ...req.body, createdAt: new Date().toISOString() };
    if (isMockMode) {
        const nl = { id: `lec_${Date.now()}`, ...payload };
        mockLectures.push(nl);
        return res.status(201).json(nl);
    }
    if (!db) return res.status(503).json({ message: "Database connection missing." });
    try {
        const docRef = await db.collection('lectures').add(payload);
        res.status(201).json({ id: docRef.id, ...payload });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.delete('/api/lectures/:id', async (req, res) => {
    const { id } = req.params;
    if (isMockMode) {
        mockLectures = mockLectures.filter(l => l.id !== id);
        return res.status(200).json({ message: 'Lecture deleted' });
    }
    if (!db) return res.status(503).json({ message: "Database connection missing." });
    try {
        await db.collection('lectures').doc(id).delete();
        res.status(200).json({ message: 'Lecture deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Bright Steps Backend running on port ${PORT}`);
});
