// ==========================================
// CALORIE CALCULATOR LOGIC
// ==========================================

let selectedGender = 'male';

// Gender toggle functionality
const maleBtn = document.getElementById('male-btn');
const femaleBtn = document.getElementById('female-btn');

maleBtn.addEventListener('click', () => {
    selectedGender = 'male';
    maleBtn.classList.add('active');
    femaleBtn.classList.remove('active');
});

femaleBtn.addEventListener('click', () => {
    selectedGender = 'female';
    femaleBtn.classList.add('active');
    maleBtn.classList.remove('active');
});

// Calculate button
const calculateBtn = document.getElementById('calculate-btn');
calculateBtn.addEventListener('click', calculateCalories);

function calculateCalories() {
    const age = parseFloat(document.getElementById('age').value);
    const height = parseFloat(document.getElementById('height').value);
    const weight = parseFloat(document.getElementById('weight').value);
    const activity = parseFloat(document.getElementById('activity').value);

    // Validation
    if (!age || !height || !weight) {
        alert('Lütfen tüm alanları doldurun!');
        return;
    }

    if (age < 1 || age > 120) {
        alert('Lütfen geçerli bir yaş girin (1-120)');
        return;
    }

    if (height < 100 || height > 250) {
        alert('Lütfen geçerli bir boy girin (100-250 cm)');
        return;
    }

    if (weight < 30 || weight > 300) {
        alert('Lütfen geçerli bir kilo girin (30-300 kg)');
        return;
    }

    // Mifflin-St Jeor Equation
    let bmr;
    if (selectedGender === 'male') {
        bmr = 10 * weight + 6.25 * height - 5 * age + 5;
    } else {
        bmr = 10 * weight + 6.25 * height - 5 * age - 161;
    }

    // TDEE (Total Daily Energy Expenditure)
    const tdee = bmr * activity;

    // Display results with animation
    const bmrValue = document.getElementById('bmr-value');
    const tdeeValue = document.getElementById('tdee-value');

    animateValue(bmrValue, 0, Math.round(bmr), 1000, ' kcal');
    animateValue(tdeeValue, 0, Math.round(tdee), 1000, ' kcal');
}

// Animate number counting
function animateValue(element, start, end, duration, suffix = '') {
    const range = end - start;
    const increment = range / (duration / 16);
    let current = start;

    const timer = setInterval(() => {
        current += increment;
        if ((increment > 0 && current >= end) || (increment < 0 && current <= end)) {
            current = end;
            clearInterval(timer);
        }
        element.textContent = Math.round(current) + suffix;
    }, 16);
}

// ==========================================
// SPORTS TRACKER LOGIC (Enhanced with Statistics)
// ==========================================

const weekGrid = document.getElementById('week-grid');
const progressFill = document.getElementById('progress-fill');
const progressText = document.getElementById('progress-text');
const resetBtn = document.getElementById('reset-btn');
const statsContainer = document.getElementById('stats-container');

// Turkish day names
const dayNames = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];
const monthNames = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
    'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];

// Sports history data structure: { "2025": { "12": { "2025-12-23": true, ... }, ... }, ... }
let sportsHistory = {};

// Get current week's dates
function getCurrentWeek() {
    const today = new Date();
    const currentDay = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const mondayOffset = currentDay === 0 ? -6 : 1 - currentDay;

    const week = [];
    for (let i = 0; i < 7; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() + mondayOffset + i);
        week.push(date);
    }
    return week;
}

// Save workout day
function saveWorkoutDay(dateStr, completed) {
    const date = new Date(dateStr);
    const year = date.getFullYear().toString();
    const month = (date.getMonth() + 1).toString();

    if (!sportsHistory[year]) {
        sportsHistory[year] = {};
    }
    if (!sportsHistory[year][month]) {
        sportsHistory[year][month] = {};
    }

    if (completed) {
        sportsHistory[year][month][dateStr] = true;
    } else {
        delete sportsHistory[year][month][dateStr];
    }

    saveToLocalStorage();
}

// Generate week grid
function generateWeekGrid() {
    const week = getCurrentWeek();
    weekGrid.innerHTML = '';

    week.forEach((date, index) => {
        const dayKey = date.toISOString().split('T')[0];
        const year = date.getFullYear().toString();
        const month = (date.getMonth() + 1).toString();

        const isCompleted = sportsHistory[year]?.[month]?.[dayKey] || false;

        const dayCard = document.createElement('div');
        dayCard.className = 'day-card';
        if (isCompleted) {
            dayCard.classList.add('completed');
        }

        const today = new Date().toISOString().split('T')[0];
        const isToday = dayKey === today;

        dayCard.innerHTML = `
            <div class="day-name">${dayNames[index]}</div>
            <div class="day-date">${date.getDate()}/${date.getMonth() + 1}</div>
            <div class="day-status">${isCompleted ? '✅' : '⚪'}</div>
        `;

        dayCard.addEventListener('click', () => toggleDay(dayKey, dayCard));
        weekGrid.appendChild(dayCard);
    });

    updateProgress();
    generateStatistics();
}

// Toggle day completion
function toggleDay(dayKey, element) {
    const date = new Date(dayKey);
    const year = date.getFullYear().toString();
    const month = (date.getMonth() + 1).toString();

    const isCompleted = sportsHistory[year]?.[month]?.[dayKey] || false;

    if (isCompleted) {
        saveWorkoutDay(dayKey, false);
        element.classList.remove('completed');
        element.querySelector('.day-status').textContent = '⚪';
    } else {
        saveWorkoutDay(dayKey, true);
        element.classList.add('completed');
        element.querySelector('.day-status').textContent = '✅';
    }

    updateProgress();
    generateStatistics();
}

// Update progress bar
function updateProgress() {
    const week = getCurrentWeek();
    let completedCount = 0;

    week.forEach(date => {
        const dayKey = date.toISOString().split('T')[0];
        const year = date.getFullYear().toString();
        const month = (date.getMonth() + 1).toString();

        if (sportsHistory[year]?.[month]?.[dayKey]) {
            completedCount++;
        }
    });

    const percentage = (completedCount / 7) * 100;
    progressFill.style.width = percentage + '%';
    progressText.textContent = `${completedCount}/7 gün`;
}

// Reset week
resetBtn.addEventListener('click', () => {
    if (confirm('Bu haftanın tüm kayıtlarını silmek istediğinize emin misiniz?')) {
        const week = getCurrentWeek();
        week.forEach(date => {
            const dayKey = date.toISOString().split('T')[0];
            saveWorkoutDay(dayKey, false);
        });
        generateWeekGrid();
    }
});

// ==========================================
// STATISTICS SYSTEM
// ==========================================

function generateStatistics() {
    const years = Object.keys(sportsHistory).sort((a, b) => b - a); // Descending order

    if (years.length === 0) {
        statsContainer.innerHTML = '<div class="no-stats">Henüz spor kaydı yok. Haftadan günleri işaretle!</div>';
        return;
    }

    let html = '';

    years.forEach(year => {
        const yearData = sportsHistory[year];
        const yearTotal = getYearTotal(year);

        html += `
            <div class="stat-year">
                <div class="stat-year-header" onclick="toggleYear('${year}')">
                    <span class="stat-year-title">
                        <span class="stat-icon">📅</span>
                        ${year}
                    </span>
                    <span class="stat-year-count">${yearTotal} gün</span>
                    <span class="stat-arrow" id="arrow-${year}">▼</span>
                </div>
                <div class="stat-year-content" id="year-${year}" style="display: none;">
                    ${generateMonthsHtml(year, yearData)}
                </div>
            </div>
        `;
    });

    statsContainer.innerHTML = html;
}

function generateMonthsHtml(year, yearData) {
    const months = Object.keys(yearData).sort((a, b) => b - a);
    let html = '';

    months.forEach(month => {
        const monthData = yearData[month];
        const monthTotal = Object.keys(monthData).length;
        const monthIndex = parseInt(month) - 1;

        html += `
            <div class="stat-month">
                <div class="stat-month-header" onclick="toggleMonth('${year}', '${month}')">
                    <span class="stat-month-title">
                        <span class="stat-icon">📆</span>
                        ${monthNames[monthIndex]}
                    </span>
                    <span class="stat-month-count">${monthTotal} gün</span>
                    <span class="stat-arrow" id="arrow-${year}-${month}">▼</span>
                </div>
                <div class="stat-month-content" id="month-${year}-${month}" style="display: none;">
                    ${generateDaysHtml(monthData)}
                </div>
            </div>
        `;
    });

    return html;
}

function generateDaysHtml(monthData) {
    const days = Object.keys(monthData).sort((a, b) => new Date(b) - new Date(a));
    let html = '<div class="stat-days-grid">';

    days.forEach(dayKey => {
        const date = new Date(dayKey);
        const dayOfWeek = dayNames[date.getDay() === 0 ? 6 : date.getDay() - 1];

        html += `
            <div class="stat-day">
                <span class="stat-day-icon">✅</span>
                <span class="stat-day-text">${date.getDate()} ${monthNames[date.getMonth()]} - ${dayOfWeek}</span>
            </div>
        `;
    });

    html += '</div>';
    return html;
}

function getYearTotal(year) {
    let total = 0;
    const yearData = sportsHistory[year];

    for (const month in yearData) {
        total += Object.keys(yearData[month]).length;
    }

    return total;
}

function toggleYear(year) {
    const content = document.getElementById(`year-${year}`);
    const arrow = document.getElementById(`arrow-${year}`);

    if (content.style.display === 'none') {
        content.style.display = 'block';
        arrow.textContent = '▲';
    } else {
        content.style.display = 'none';
        arrow.textContent = '▼';
    }
}

function toggleMonth(year, month) {
    const content = document.getElementById(`month-${year}-${month}`);
    const arrow = document.getElementById(`arrow-${year}-${month}`);

    if (content.style.display === 'none') {
        content.style.display = 'block';
        arrow.textContent = '▲';
    } else {
        content.style.display = 'none';
        arrow.textContent = '▼';
    }
}

// ==========================================
// LOCAL STORAGE
// ==========================================

function saveToLocalStorage() {
    localStorage.setItem('sportsHistory', JSON.stringify(sportsHistory));
}

function loadFromLocalStorage() {
    const stored = localStorage.getItem('sportsHistory');
    if (stored) {
        sportsHistory = JSON.parse(stored);
    } else {
        // Migrate old data if exists
        const oldData = localStorage.getItem('sportsTrackingData');
        if (oldData) {
            const oldTracked = JSON.parse(oldData);
            for (const dayKey in oldTracked) {
                if (oldTracked[dayKey]) {
                    saveWorkoutDay(dayKey, true);
                }
            }
            localStorage.removeItem('sportsTrackingData');
        }
    }
}

// ==========================================
// PWA REGISTRATION
// ==========================================

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js')
            .then(registration => console.log('Service Worker registered'))
            .catch(err => console.log('Service Worker registration failed'));
    });
}

// ==========================================
// INITIALIZATION
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
    loadFromLocalStorage();
    generateWeekGrid();
});
