const surveyData = [];
const questions = [
    { field: "food", label: "מאכל אהוב" },
    { field: "color", label: "צבע אהוב" }
];

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