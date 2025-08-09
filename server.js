const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

let surveyData = [];

app.get('/api/survey', (req, res) => {
    res.json(surveyData);
});

app.post('/api/survey', (req, res) => {
    const { food, color } = req.body;
    if (!food || !color) return res.status(400).send('Missing fields');
    surveyData.push({ food, color });
    res.status(201).json({ success: true });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});