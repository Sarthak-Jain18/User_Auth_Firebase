require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB error:', err));

// user model
const userSchema = new mongoose.Schema({
    uid: { type: String, required: true, unique: true },
    email: String,
    userName: String,
    createdAt: { type: Date, default: Date.now }
});
const User = mongoose.model('User', userSchema);

// middleware to verify Firebase ID token
async function authenticate(req, res, next) {
    const authHeader = req.headers.authorization || '';
    if (!authHeader.startsWith('Bearer ')) return res.status(401).json({ error: 'No token provided' });
    const idToken = authHeader.split('Bearer ')[1];
    try {
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        req.user = decodedToken; // contains uid, email, etc.
        next();
    } catch (err) {
        console.error('Token verification error', err);
        res.status(401).json({ error: 'Invalid token', details: err.message });
    }
}

// google signup/login
app.post("/api/users/google", async (req, res) => {
    try {
        const { userName, email } = req.body;

        // verify token
        const authHeader = req.headers.authorization || "";
        const token = authHeader.split(" ")[1];
        if (!token) return res.status(401).json({ message: "No token provided" });

        // verify ID token to extract UID
        const decoded = await admin.auth().verifyIdToken(token);
        const uid = decoded.uid;

        // console.log("Verified Google user:", uid, email, userName);

        // Check if user already exists
        let existingUser = await User.findOne({ uid });
        if (!existingUser) {
            existingUser = await User.create({ uid, email, userName });
            // console.log("New user created in DB:", existingUser.email);
        }

        return res.status(200).json({ message: "Google login success", user: existingUser });
    } catch (err) {
        // console.error("Google login backend error:", err);
        res.status(500).json({ message: "Server error", error: err.message });
    }
});

// create profile after signup
app.post('/api/users', authenticate, async (req, res) => {
    try {
        const { uid, email } = req.user;
        const { userName } = req.body;
        let u = new User({ uid, email, userName });
        await u.save();
        res.json(u);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

// protected route example
app.get('/api/protected', authenticate, (req, res) => {
    res.json({ message: `Hello ${req.user.email}`, uid: req.user.uid });
});

const PORT = process.env.PORT;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));
