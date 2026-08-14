import { plantDataset } from './data.js';
import { isPlantHealthy, renderPlantWidgets } from './dashboard.js';
import { showToast } from './main.js';

let modalState = {
    currentActivePlant: null,
    currentGraphView: "simple",
    modalChartInstance: null
};

export function openPlantModal(plantId) {
    modalState.currentActivePlant = plantDataset.find(p => p.id === plantId);
    modalState.currentGraphView = 'simple';

    const p = modalState.currentActivePlant;
    const nameInput = document.getElementById('modalPlantNameInput');
    nameInput.value = p.name;
    
    // Inline edit listener inside modal only
    nameInput.onchange = (e) => {
        const val = e.target.value.trim();
        if (val) {
            p.name = val;
            renderPlantWidgets();
            showToast(`Plant updated: ${p.name}`);
        }
    };

    document.getElementById('modalHealth').innerText = isPlantHealthy(p) ? "Healthy" : "Attention Needed";
    document.getElementById('modalCluster').innerText = p.clusterPos;
    document.getElementById('modalAvgMoisture').innerText = p.avgMoisture30Days;
    document.getElementById('modalAvgTemp').innerText = p.avgTemp30Days;

    updateModalGraphView();
    document.getElementById('plantModal').style.display = 'flex';
}

export function closePlantModal() {
    document.getElementById('plantModal').style.display = 'none';
    if (modalState.modalChartInstance) { modalState.modalChartInstance.destroy(); }
}

export function setGraphView(viewMode) {
    modalState.currentGraphView = viewMode;
    document.getElementById('btnSimpleView').classList.toggle('active', viewMode === 'simple');
    document.getElementById('btnAdvancedView').classList.toggle('active', viewMode === 'advanced');
    updateModalGraphView();
}

export function updateModalGraphView() {
    const p = modalState.currentActivePlant;
    if (!p) return;

    if (modalState.currentGraphView === 'simple') {
        document.getElementById('graphTitle').innerText = "Soil Moisture History (7 Days)";
        document.getElementById('modalAiDeepAnalysis').innerText = p.aiSimple;
        renderModalChart([p.weeklyMoistureData], ['Soil Moisture (%)'], ['#0f766e'], false);
    } else {
        document.getElementById('graphTitle').innerText = "Correlative Telemetry (Moisture vs Temperature)";
        document.getElementById('modalAiDeepAnalysis').innerText = p.aiAdvanced;
        renderModalChart([p.weeklyMoistureData, p.weeklyTempData], ['Soil Moisture (%)', 'Temperature (°C)'], ['#0f766e', '#e11d48'], true);
    }
}

function renderModalChart(datasetsArray, labelsArray, colorsArray, dualAxis = false) {
    const ctx = document.getElementById('modalTelemetryChart').getContext('2d');
    if (modalState.modalChartInstance) { modalState.modalChartInstance.destroy(); }

    const timeLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const compiledDatasets = datasetsArray.map((data, idx) => ({
        label: labelsArray[idx],
        data: data,
        borderColor: colorsArray[idx],
        backgroundColor: 'transparent',
        borderWidth: 2,
        tension: 0.2,
        yAxisID: dualAxis && idx === 1 ? 'y1' : 'y'
    }));

    const optionsConfig = {
        responsive: true,
        maintainAspectRatio: false,
        scales: { y: { type: 'linear', display: true, position: 'left' } }
    };

    if (dualAxis) {
        optionsConfig.scales.y1 = {
            type: 'linear', display: true, position: 'right',
            grid: { drawOnChartArea: false }
        };
    }

    modalState.modalChartInstance = new Chart(ctx, {
        type: 'line',
        data: { labels: timeLabels, datasets: compiledDatasets },
        options: optionsConfig
    });
}