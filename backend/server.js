const express = require('express');
const fs = require('fs');
const axios = require('axios');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from frontend folder
app.use(express.static(path.join(__dirname, 'frontend')));

// Redirect root route to login page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend', 'login.html'));
});

// Serve other HTML files explicitly
app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend', 'dashboard.html'));
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend', 'login.html'));
});

const USERS_FILE = path.join(__dirname, 'users.json');
const CONTACT_FILE = path.join(__dirname, 'contacts.json');
const BLYNK_TOKEN = '3vCchEayeoses3vxTbX9meJvjNDeY6Z4';
const BLYNK_BASE = `https://blynk.cloud/external/api/get?token=${BLYNK_TOKEN}`;

// Load users
let users = [];
try {
    users = JSON.parse(fs.readFileSync(USERS_FILE, 'utf-8'));
} catch (err) {
    console.error('Error loading users:', err);
}

// Load contacts (create file if it doesn't exist)
if (!fs.existsSync(CONTACT_FILE)) {
    fs.writeFileSync(CONTACT_FILE, JSON.stringify([]));
}

// -------- LOGIN --------
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    const user = users.find(u => u.username === username && u.password === password);
    if (user) {
        res.json({ success: true });
    } else {
        res.json({ success: false, message: "Invalid credentials" });
    }
});

// -------- READINGS --------
app.get('/api/readings', async (req, res) => {
    try {
        // FIXED: Match ESP32 virtual pins - V0, V1, V2, V3
        const voltage = await axios.get(`${BLYNK_BASE}&v0`);  // ESP32 uses V0 for voltage
        const current = await axios.get(`${BLYNK_BASE}&v1`);  // ESP32 uses V1 for current
        const power = await axios.get(`${BLYNK_BASE}&v2`);    // ESP32 uses V2 for power
        const energy = await axios.get(`${BLYNK_BASE}&v3`);   // ESP32 uses V3 for energy
        // ESP32 uses V4 for cost, not theft detection

        res.json({
            voltage: voltage.data,
            current: current.data,
            power: power.data,
            energy: energy.data,
            theftDetected: false  // Can't get theft from Blynk with current setup
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch readings from Blynk' });
    }
});

// -------- DEBUG ENDPOINT --------
app.get('/api/debug-blynk', async (req, res) => {
    try {
        const v0 = await axios.get(`${BLYNK_BASE}&v0`);
        const v1 = await axios.get(`${BLYNK_BASE}&v1`);
        const v2 = await axios.get(`${BLYNK_BASE}&v2`);
        const v3 = await axios.get(`${BLYNK_BASE}&v3`);
        const v4 = await axios.get(`${BLYNK_BASE}&v4`);

        res.json({
            v0_voltage: v0.data,
            v1_current: v1.data,
            v2_power: v2.data,
            v3_energy: v3.data,
            v4_cost: v4.data
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// -------- CONTACT FORM --------
app.post('/api/contact', (req, res) => {
    const { username, message } = req.body;
    if (!username || !message) return res.status(400).json({ success: false, message: "Missing fields" });

    try {
        const contacts = JSON.parse(fs.readFileSync(CONTACT_FILE, 'utf-8'));
        contacts.push({ username, message, time: new Date().toISOString() });
        fs.writeFileSync(CONTACT_FILE, JSON.stringify(contacts, null, 2));
        res.json({ success: true, message: "Message sent successfully" });
    } catch (err) {
        console.error('Contact form error:', err);
        res.status(500).json({ success: false, message: "Server error" });
    }
});

// -------- START SERVER --------
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Backend running on port ${PORT}`);
});
