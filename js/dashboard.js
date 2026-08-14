import { plantDataset, createNewPlantNode, deletePlantNode } from './data.js';
import { openPlantModal } from './modal.js';
import { showToast, checkAlerts } from './main.js';

export function renderDashboardView() {
    const page = document.getElementById('page-dashboard');
    page.innerHTML = `
        <div class="dashboard-header-wrap">
            <header>
                <h1>System Overview</h1>
                <p>Live telemetry metrics and node status across registered biosphere zones.</p>
            </header>
            <button class="btn-add-plant" id="btnOpenAddModal">
                <span>+</span> Add Plant
            </button>
        </div>
        <div class="plant-grid" id="plantGridContainer"></div>
    `;

    document.getElementById('btnOpenAddModal').onclick = () => {
        document.getElementById('addPlantModal').style.display = 'flex';
    };

    renderPlantWidgets();
}

export function isPlantHealthy(plant) {
    const range = plant.thresholds.moisture;
    const m = plant.liveData.moisture;
    return m >= range.min && m <= range.max;
}

export function renderPlantWidgets() {
    const container = document.getElementById('plantGridContainer');
    if (!container) return;
    container.innerHTML = "";

    plantDataset.forEach(plant => {
        const healthy = isPlantHealthy(plant);
        const statusLabel = healthy ? "Healthy" : "Attention Needed";
        const badgeClass = healthy ? "badge-healthy" : "badge-attention";

        const card = document.createElement('div');
        card.className = 'plant-card';

        card.innerHTML = `
            <div class="plant-card-top">
                <h3 class="plant-card-title">${plant.name}</h3>
                <div class="card-menu-wrap">
                    <button class="btn-menu-trigger" data-id="${plant.id}">&vellip;</button>
                    <div class="card-dropdown" id="dropdown-${plant.id}">
                        <button class="dropdown-item btn-menu-details" data-id="${plant.id}">View Details</button>
                        <button class="dropdown-item danger-text btn-menu-delete" data-id="${plant.id}">Delete Plant</button>
                    </div>
                </div>
            </div>
            <div class="status-row">
                <span style="font-size: 0.8125rem; color: var(--text-sub);">${plant.clusterPos}</span>
                <span class="badge ${badgeClass}">${statusLabel}</span>
            </div>
            <div class="telemetry-metrics">
                <div class="metric-item"><span>Moisture</span>${plant.liveData.moisture}%</div>
                <div class="metric-item"><span>Temp</span>${plant.liveData.temp}°C</div>
                <div class="metric-item"><span>Light</span>${plant.liveData.light} lx</div>
            </div>
            <div class="ai-summary-box">
                <div class="ai-title">Gemini AI Status</div>
                <p>${plant.aiSimple}</p>
            </div>
            <button class="btn-take-reading" id="btn-read-${plant.id}">Capture Node Telemetry</button>
        `;
        container.appendChild(card);

        // Bind Card Actions
        const menuBtn = card.querySelector('.btn-menu-trigger');
        const dropdown = card.querySelector(`#dropdown-${plant.id}`);

        menuBtn.onclick = (e) => {
            e.stopPropagation();
            document.querySelectorAll('.card-dropdown').forEach(d => d !== dropdown && d.classList.remove('show'));
            dropdown.classList.toggle('show');
        };

        card.querySelector('.btn-menu-details').onclick = (e) => {
            e.stopPropagation();
            dropdown.classList.remove('show');
            openPlantModal(plant.id);
        };

        card.querySelector('.btn-menu-delete').onclick = (e) => {
            e.stopPropagation();
            dropdown.classList.remove('show');
            removePlant(plant.id);
        };

        card.querySelector(`#btn-read-${plant.id}`).onclick = (e) => {
            e.stopPropagation();
            takeNewReading(plant.id);
        };
    });

    // Close open menus when clicking outside
    document.onclick = () => document.querySelectorAll('.card-dropdown').forEach(d => d.classList.remove('show'));
}

export function handleCreatePlant(name, zone) {
    const newPlant = createNewPlantNode(name, zone);
    renderPlantWidgets();
    checkAlerts();
    showToast(`Registered node: ${newPlant.name}`);
}

export function removePlant(plantId) {
    const plant = plantDataset.find(p => p.id === plantId);
    if (!plant) return;
    deletePlantNode(plantId);
    renderPlantWidgets();
    checkAlerts();
    showToast(`Removed node: ${plant.name}`);
}

export function takeNewReading(plantId) {
    const plant = plantDataset.find(p => p.id === plantId);
    if (!plant) return;

    plant.liveData.moisture = Math.round(Math.min(100, Math.max(0, plant.liveData.moisture + (Math.random() * 8 - 4))));
    plant.liveData.temp = Math.round((plant.liveData.temp + (Math.random() * 1.6 - 0.8)) * 10) / 10;
    plant.weeklyMoistureData.shift();
    plant.weeklyMoistureData.push(plant.liveData.moisture);

    renderPlantWidgets();
    checkAlerts();
    showToast(`Telemetry updated for ${plant.name}`);
}