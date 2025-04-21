const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const MedicalRecord = require('./models/MedicalRecord');
const User = require('./models/User');
const db = require('./config/database');

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Basic routes
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'HealthChain API is running' });
});

// Add new medical record
app.post('/api/records', async (req, res) => {
    try {
        const { patient_id, doctor_id, diagnosis, prescription } = req.body;
        
        // Create new record
        const newRecord = await MedicalRecord.create({
            patient_id,
            doctor_id,
            diagnosis,
            prescription
        });
        
        res.json({ 
            success: true, 
            record: newRecord 
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

// Get records for a patient
app.get('/api/records/:patientId', async (req, res) => {
    try {
        const { patientId } = req.params;
        const records = await MedicalRecord.findByPatientId(patientId);
            
        res.json({ 
            success: true, 
            records 
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

// Get all records
app.get('/api/records', async (req, res) => {
    try {
        const records = await MedicalRecord.findAll();
            
        res.json({ 
            success: true, 
            records 
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

// User routes
app.post('/api/users', async (req, res) => {
    try {
        const { username, password, email } = req.body;
        const user = await User.create({ username, password, email });
        res.json({ success: true, user });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.post('/api/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findByUsername(username);
        
        if (!user || !(await User.validatePassword(user, password))) {
            return res.status(401).json({ success: false, error: 'Invalid credentials' });
        }
        
        res.json({ 
            success: true, 
            user: {
                id: user.id,
                username: user.username,
                email: user.email
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
}); 