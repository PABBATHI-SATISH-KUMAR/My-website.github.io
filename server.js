require("dotenv").config();
const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

app.post("/get-suggestions", async (req, res) => {
    try {
        const { gender, age, bmi, workout, duration, heartRate } = req.body;

        const prompt = `Provide workout and diet suggestions based on:
        Gender: ${gender}, Age: ${age}, BMI: ${bmi}, Workout: ${workout}, Duration: ${duration} mins, Heart Rate: ${heartRate} BPM.`;

        const response = await axios.post("https://api.openai.com/v1/chat/completions", {
            model: "gpt-3.5-turbo",
            messages: [{ role: "user", content: prompt }],
            max_tokens: 150
        }, {
            headers: {
                "Authorization": `Bearer ${OPENAI_API_KEY}`,
                "Content-Type": "application/json"
            }
        });

        res.json({ suggestion: response.data.choices[0].message.content });
    } catch (error) {
        console.error("AI Suggestion Error:", error);
        res.status(500).json({ error: "Error fetching AI suggestions." });
    }
});

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
