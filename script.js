// DOM Elements
const form = {
    gender: document.getElementById('gender'),
    age: document.getElementById('age'),
    height: document.getElementById('height'),
    weight: document.getElementById('weight'),
    bmi: document.getElementById('bmi'),
    workout: document.getElementById('workout'),
    duration: document.getElementById('duration'),
    heartRate: document.getElementById('heartRate'),
    bodyTemp: document.getElementById('bodyTemp')
};

const warningElement = document.getElementById('warning');
const bmiStatus = document.getElementById('bmiStatus');
const caloriesResult = document.getElementById('caloriesResult');
const riskResult = document.getElementById('riskResult');
const suggestionResult = document.getElementById('suggestionResult');
const themeToggle = document.getElementById('themeToggle');
const predictButton = document.getElementById('predict');
const historyToggle = document.getElementById('historyToggle');
const historyContainer = document.getElementById('history');

// Initialize prediction history
let predictionHistory = [];

// Add event listeners for BMI calculation
[form.height, form.weight].forEach(input => {
    if (input) input.addEventListener('input', calculateBMI);
});

// Validate duration input
if (form.duration) form.duration.addEventListener('input', validateDuration);
if (form.workout) form.workout.addEventListener('change', validateDuration);

// Add prediction event listener
if (predictButton) predictButton.addEventListener('click', predictMetrics);

// Toggle theme
if (themeToggle) {
    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-theme');
        themeToggle.textContent = document.body.classList.contains('dark-theme') ? "🌙 Dark Mode" : "☀️ Light Mode";
    });
}

// Function to calculate BMI
function calculateBMI() {
    const weight = parseFloat(form.weight.value);
    const height = parseFloat(form.height.value);

    if (weight > 0 && height > 0) {
        const bmiValue = (weight / Math.pow(height / 100, 2)).toFixed(2);
        form.bmi.value = bmiValue;

        // Evaluate BMI
        const bmi = parseFloat(bmiValue);
        if (bmi >= 18.5 && bmi <= 24.9) {
            bmiStatus.textContent = "✅ Good BMI";
            bmiStatus.className = "bmi-status good";
        } else {
            bmiStatus.textContent = "⚠️ Risky BMI";
            bmiStatus.className = "bmi-status risky";
        }
    } else {
        form.bmi.value = '';
        bmiStatus.textContent = '';
        bmiStatus.className = 'bmi-status';
    }
}

// Function to validate duration input
function validateDuration() {
    const duration = parseFloat(form.duration.value);
    const workoutType = form.workout.value;
    
    let warningMessage = '';

    if (isNaN(duration) || duration < 0) {
        warningElement.textContent = '⚠️ Please enter a valid duration.';
        warningElement.style.display = 'block';
        return;
    }

    if (duration === 0) {
        warningMessage = '⚠️ No Exercise! Obesity Risk & Heart Disease!';
    } else if ((workoutType === 'Cardio' && duration > 120) ||
               (workoutType === 'Push' && duration > 70) ||
               (workoutType === 'Pull' && duration > 150)) {
        warningMessage = `⚠️ High Risk (Excessive ${workoutType} Workout)!`;
    }

    warningElement.textContent = warningMessage;
    warningElement.style.display = warningMessage ? 'block' : 'none';
}

// Function to predict metrics
async function predictMetrics() {
    // Validate inputs
    if (!Object.values(form).every(input => input.value.trim() !== '')) {
        alert('Please fill in all fields');
        return;
    }

    // Validate numeric inputs
    const numericInputs = [form.age, form.height, form.weight, form.duration, form.heartRate, form.bodyTemp];
    if (numericInputs.some(input => isNaN(parseFloat(input.value)) || parseFloat(input.value) <= 0)) {
        alert('Please enter valid positive numbers for all numeric fields');
        return;
    }

    // Mock prediction calculation
    const calories = (parseFloat(form.weight.value) * 0.074 * parseFloat(form.duration.value) * (parseFloat(form.heartRate.value) / 100)).toFixed(2);

    const risk = parseFloat(form.heartRate.value) > 80 ? "🚨 High Risk (Heart Rate Above 80 BPM!)" : "✅ Low Risk";

    // Update UI
    caloriesResult.textContent = `🔥 Calories Burnt: ${calories} kcal`;
    riskResult.textContent = risk;

    // Store history
    predictionHistory.push({
        gender: form.gender.value,
        age: form.age.value,
        height: form.height.value,
        weight: form.weight.value,
        bmi: form.bmi.value,
        workout: form.workout.value,
        duration: form.duration.value,
        heartRate: form.heartRate.value,
        bodyTemp: form.bodyTemp.value,
        caloriesBurnt: calories,
        riskAssessment: risk
    });

    await fetchSuggestions();
}

// Function to fetch AI-based suggestions
async function fetchSuggestions() {
    try {
        const response = await fetch("http://localhost:5000/get-suggestions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                gender: form.gender.value,
                age: form.age.value,
                bmi: form.bmi.value,
                workout: form.workout.value,
                duration: form.duration.value,
                heartRate: form.heartRate.value
            })
        });

        const data = await response.json();
        suggestionResult.textContent = data.suggestion || "⚠️ No AI suggestions available.";
    } catch (error) {
        console.error("Error fetching AI suggestions:", error);
        suggestionResult.textContent = "⚠️ Error fetching AI suggestions.";
    }
}
