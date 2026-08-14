import { plantDataset } from './data.js';

let moistureChartInstance = null;
let tempChartInstance = null;

export function renderAnalyticsView() {
    const page = document.getElementById('page-analytics');
    page.innerHTML = `
        <header>
            <h1>Detailed Stats & Analytics</h1>
            <p>System-wide aggregate historical trends and zone moisture vs. temperature analysis.</p>
        </header>

        <div class="analytics-grid">
            <div class="analytics-card">
                <h3>7-Day Soil Moisture Mean Across Nodes</h3>
                <div class="analytics-chart-wrap">
                    <canvas id="chartSystemMoisture"></canvas>
                </div>
            </div>
            <div class="analytics-card">
                <h3>Thermal Distribution (°C)</h3>
                <div class="analytics-chart-wrap">
                    <canvas id="chartSystemTemp"></canvas>
                </div>
            </div>
        </div>
    `;

    renderAnalyticsCharts();
}

function renderAnalyticsCharts() {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    const moistureCtx = document.getElementById('chartSystemMoisture').getContext('2d');
    if (moistureChartInstance) moistureChartInstance.destroy();

    const moistureDatasets = plantDataset.map((plant, idx) => ({
        label: plant.name,
        data: plant.weeklyMoistureData,
        borderColor: idx === 0 ? '#0f766e' : '#6366f1',
        tension: 0.3,
        borderWidth: 2
    }));

    moistureChartInstance = new Chart(moistureCtx, {
        type: 'line',
        data: { labels: days, datasets: moistureDatasets },
        options: { responsive: true, maintainAspectRatio: false }
    });

    const tempCtx = document.getElementById('chartSystemTemp').getContext('2d');
    if (tempChartInstance) tempChartInstance.destroy();

    const tempDatasets = plantDataset.map((plant, idx) => ({
        label: plant.name,
        data: plant.weeklyTempData,
        borderColor: idx === 0 ? '#e11d48' : '#f59e0b',
        tension: 0.3,
        borderWidth: 2
    }));

    tempChartInstance = new Chart(tempCtx, {
        type: 'line',
        data: { labels: days, datasets: tempDatasets },
        options: { responsive: true, maintainAspectRatio: false }
    });
}