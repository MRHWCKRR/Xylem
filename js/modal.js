import { plantDataset } from './data.js';

let activePlantId = null;
let currentGraphView = 'simple';
let modalChartInstance = null;

export function openPlantModal(plantId) {
    const plant = plantDataset.find(p => p.id === plantId);
    if (!plant) return;

    activePlantId = plantId;
    const modal = document.getElementById('plantModal');
    
    document.getElementById('modalPlantNameInput').value = plant.name;
    document.getElementById('modalHealth').innerText = plant.liveData.moisture >= plant.thresholds.moisture.min ? "Nominal" : "Action Needed";
    document.getElementById('modalCluster').innerText = plant.clusterPos;
    
    const avgM = Math.round(plant.weeklyMoistureData.reduce((a,b)=>a+b,0)/plant.weeklyMoistureData.length);
    const avgT = (plant.weeklyTempData.reduce((a,b)=>a+b,0)/plant.weeklyTempData.length).toFixed(1);
    
    document.getElementById('modalAvgMoisture').innerText = `${avgM}%`;
    document.getElementById('modalAvgTemp').innerText = `${avgT}°C`;
    document.getElementById('modalAiDeepAnalysis').innerText = plant.aiSimple;

    modal.style.display = 'flex';
    renderModalChart(plant);

    document.getElementById('modalPlantNameInput').onchange = (e) => {
        plant.name = e.target.value;
    };
}

export function closePlantModal() {
    document.getElementById('plantModal').style.display = 'none';
}

export function setGraphView(viewMode) {
    currentGraphView = viewMode;
    document.getElementById('btnSimpleView').classList.toggle('active', viewMode === 'simple');
    document.getElementById('btnAdvancedView').classList.toggle('active', viewMode === 'advanced');
    if (activePlantId) {
        const plant = plantDataset.find(p => p.id === activePlantId);
        if (plant) renderModalChart(plant);
    }
}

function renderModalChart(plant) {
    const ctx = document.getElementById('modalTelemetryChart').getContext('2d');
    if (modalChartInstance) modalChartInstance.destroy();

    const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    const datasets = [{
        label: 'Moisture Level (%)',
        data: plant.weeklyMoistureData,
        borderColor: '#0f766e',
        tension: 0.3
    }];

    if (currentGraphView === 'advanced') {
        datasets.push({
            label: 'Temperature (°C)',
            data: plant.weeklyTempData,
            borderColor: '#e11d48',
            tension: 0.3
        });
    }

    modalChartInstance = new Chart(ctx, {
        type: 'line',
        data: { labels, datasets },
        options: { responsive: true, maintainAspectRatio: false }
    });
}