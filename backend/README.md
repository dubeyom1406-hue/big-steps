# Proper Node.js Backend for Bright Steps

This is a dedicated backend server built with Node.js and Express. It connects to **Firebase Firestore** using the **Firebase Admin SDK**.

## 🚀 How to Start
1.  **Terminal 1 (Backend)**:
    ```bash
    cd backend
    npm run dev
    ```
2.  **Terminal 2 (Frontend)**:
    ```bash
    npm run dev
    ```

## ⚙️ Configuration Required
To connect this backend to your real database:
1.  Go to **Firebase Console > Project Settings > Service Accounts**.
2.  Click **Generate New Private Key**.
3.  Rename the downloaded `.json` file to `serviceAccountKey.json`.
4.  Place it inside the `backend/` folder.

## 📡 API Endpoints
- `GET /api/students`: Fetch all students.
- `POST /api/students`: Register a new student.
- `DELETE /api/students/:id`: Remove a student record.
- `POST /api/admin/login`: Admin authentication.
