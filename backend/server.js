const express = require('express');
const fs = require('fs');
const axios = require('axios');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '../frontend')));

const USERS_FILE = './users.json';
const CONTACT_FILE = './contacts.json';
const BLYNK_TOKEN = 'ukiSbVaUr-3h2-Sorur2JGiXxQ6LBMct'; // Replace with your Blynk token
const BLYNK_BASE = `https://blynk.cloud/external/api/get?token=${BLYNK_TOKEN}`;

// Load users
let users = JSON.parse(fs.readFileSync(USERS_FILE, 'utf-8'));

// Load contacts (create file if it doesn't exist)
if(!fs.existsSync(CONTACT_FILE)) fs.writeFileSync(CONTACT_FILE, JSON.stringify([]));

// -------- LOGIN --------
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    const user = users.find(u => u.username === username && u.password === password);
    if(user) {
        res.json({ success: true });
    } else {
        res.json({ success: false, message: "Invalid credentials" });
    }
});

// -------- READINGS --------
app.get('/api/readings', async (req, res) => {
    try {
        // Replace V1-V5 with your actual Blynk virtual pins
        const voltage = await axios.get(`${BLYNK_BASE}&v1`);
        const current = await axios.get(`${BLYNK_BASE}&v2`);
        const power = await axios.get(`${BLYNK_BASE}&v3`);
        const energy = await axios.get(`${BLYNK_BASE}&v4`);
        const theft = await axios.get(`${BLYNK_BASE}&v5`);

        res.json({
            voltage: voltage.data,
            current: current.data,
            power: power.data,
            energy: energy.data,
            theftDetected: theft.data === 1
        });
    } catch(err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch readings from Blynk' });
    }
});

// -------- CONTACT FORM --------
app.post('/api/contact', (req, res) => {
    const { username, message } = req.body;
    if(!username || !message) return res.status(400).json({ success: false, message: "Missing fields" });

    const contacts = JSON.parse(fs.readFileSync(CONTACT_FILE, 'utf-8'));
    contacts.push({ username, message, time: new Date().toISOString() });
    fs.writeFileSync(CONTACT_FILE, JSON.stringify(contacts, null, 2));

    res.json({ success: true, message: "Message sent successfully" });
});

// -------- START SERVER --------
app.listen(3000, () => console.log('Backend running on http://localhost:3000'));
