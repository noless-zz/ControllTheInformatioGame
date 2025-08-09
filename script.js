// Add at the top of script.js
//import { initializeApp } from "firebase/app";
//import { getFirestore, collection, addDoc, getDocs } from "firebase/firestore";

  // Import the functions you need from the SDKs you need
 // import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";
//  import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-analytics.js";
  // TODO: Add SDKs for Firebase products that you want to use
  // https://firebase.google.com/docs/web/setup#available-libraries

  // Your web app's Firebase configuration
  // For Firebase JS SDK v7.20.0 and later, measurementId is optional
  const firebaseConfig = {
    apiKey: "AIzaSyC5Ebb9icuPOCpPQ22Jv1aspRh6qXVnsJ0",
    authDomain: "controltheinformationgame.firebaseapp.com",
    projectId: "controltheinformationgame",
    storageBucket: "controltheinformationgame.firebasestorage.app",
    messagingSenderId: "812042114078",
    appId: "1:812042114078:web:e989d3ad09764bbf4cca0f",
    measurementId: "G-HX06QJY0C8"
  };


//const app = initializeApp(firebaseConfig);
//const db = getFirestore(app);


const surveyData = [];
const questions = [
    { field: "food", label: "מאכל אהוב" },
    { field: "color", label: "צבע אהוב" }
];
/*
async function fetchSurveyData() {
    const querySnapshot = await getDocs(collection(db, "survey"));
    surveyData.length = 0;
    querySnapshot.forEach((doc) => {
        surveyData.push(doc.data());
    });
    updateResults();
}

document.getElementById('survey-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    const form = e.target;
    const entry = {
        food: form.food.value,
        color: form.color.value
    };
    if (!entry.food || !entry.color) return;
    await addDoc(collection(db, "survey"), entry);
    form.reset();
    fetchSurveyData();
});*/

document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('survey-form').addEventListener('submit', function(e) {
        e.preventDefault();
        const form = e.target;
        const entry = {
            food: form.food.value,
            color: form.color.value
        };
        if (!entry.food || !entry.color) return;
        surveyData.push(entry);
        form.reset();
        updateResults();
    });

    document.getElementById('ai-question').addEventListener('keyup', function(e) {
        if (e.key === 'Enter') askAI();
    });
});

function updateResults() {
    document.getElementById('results-section').style.display = 'block';
    document.getElementById('ai-section').style.display = 'block';
    renderTable();
    renderCharts();
    aiIntro();
}

function renderTable() {
    let html = '<table><thead><tr>';
    html += questions.map(q => `<th>${q.label}</th>`).join('');
    html += '</tr></thead><tbody>';
    surveyData.forEach(row => {
        html += '<tr>' + questions.map(q => `<td>${row[q.field]}</td>`).join('') + '</tr>';
    });
    html += '</tbody></table>';
    document.getElementById('table-container').innerHTML = html;
}

let foodChart, colorChart;
function renderCharts() {
    const foodCounts = countByField('food');
    const colorCounts = countByField('color');
    if (foodChart) foodChart.destroy();
    foodChart = new Chart(document.getElementById('foodChart'), {
        type: 'bar',
        data: {
            labels: Object.keys(foodCounts),
            datasets: [{
                label: 'שכיחות מאכלים',
                data: Object.values(foodCounts),
                backgroundColor: 'rgba(52,152,219,0.7)'
            }]
        },
        options: {
            plugins: {
                legend: { display: false },
                title: { display: true, text: 'התפלגות מאכלים' }
            }
        }
    });
    if (colorChart) colorChart.destroy();
    colorChart = new Chart(document.getElementById('colorChart'), {
        type: 'pie',
        data: {
            labels: Object.keys(colorCounts),
            datasets: [{
                data: Object.values(colorCounts),
                backgroundColor: [
                    '#2980b9', '#e74c3c', '#27ae60', '#f1c40f', '#8e44ad'
                ]
            }]
        },
        options: {
            plugins: {
                legend: { display: true },
                title: { display: true, text: 'התפלגות צבעים' }
            }
        }
    });
}

function countByField(field) {
    const counts = {};
    surveyData.forEach(row => {
        counts[row[field]] = (counts[row[field]] || 0) + 1;
    });
    return counts;
}

function aiIntro() {
    let output = '';
    if (surveyData.length === 0) {
        output = "הבינה מחכה לתשובות הסקר כדי להסיק מסקנות!";
    } else {
        const foodCounts = countByField('food');
        const mostFood = mostFrequent(foodCounts);
        const foodPerc = ((foodCounts[mostFood] / surveyData.length) * 100).toFixed(1);
        const colorCounts = countByField('color');
        const mostColor = mostFrequent(colorCounts);
        const colorPerc = ((colorCounts[mostColor] / surveyData.length) * 100).toFixed(1);

        output = `הבינה רואה ש<strong>${mostFood}</strong> הוא המאכל הכי נפוץ (${foodPerc}%) בכיתה.<br>`;
        output += `וכן ש<strong>${mostColor}</strong> הוא הצבע הפופולרי (${colorPerc}%).<br>`;
        output += "תוכלו לשאול אותי שאלות על הנתונים!";
    }
    document.getElementById('ai-output').innerHTML = output;
}

function mostFrequent(counts) {
    let max = 0, name = '';
    for (const key in counts) {
        if (counts[key] > max) {
            max = counts[key];
            name = key;
        }
    }
    return name;
}

function askAI() {
    const q = document.getElementById('ai-question').value.trim();
    if (!q) return;
    let response = '';
    const foodCounts = countByField('food');
    const colorCounts = countByField('color');
    if (q.includes('כמה') && q.includes('פיצה')) {
        response = `בחרו פיצה: ${foodCounts['פיצה'] || 0} תלמידים.`;
    } else if (q.includes('המאכל הכי נפוץ')) {
        response = `המאכל הכי נפוץ: ${mostFrequent(foodCounts)}`;
    } else if (q.includes('הצבע הכי נפוץ')) {
        response = `הצבע הכי נפוץ: ${mostFrequent(colorCounts)}`;
    } else if (q.includes('הסתברות') && q.includes('כחול')) {
        const perc = ((colorCounts['כחול'] || 0) / surveyData.length * 100).toFixed(1);
        response = `ההסתברות לבחור תלמיד אקראי שאוהב כחול היא ${perc}%`;
    } else if (q.includes('כמה תלמידים ענו')) {
        response = `ענו עד כה: ${surveyData.length} תלמידים.`;
    } else {
        response = "אני עדיין לומדת, נסו לשאול שאלה אחרת על הנתונים!";
    }
    document.getElementById('ai-output').innerHTML = response;
    document.getElementById('ai-question').value = '';
}
