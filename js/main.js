// DATA STORE
let plantDataset = [
    {
        id: 1,
        name: "Fiddle Leaf Fig",
        clusterPos: "Zone A - Bay 1",
        liveData: { moisture: 42, temp: 21.5, light: 850 },
        thresholds: { moisture: { min: 35, max: 70 } },
        weeklyMoistureData: [55, 52, 48, 46, 44, 43, 42],
        weeklyTempData: [22, 21.8, 21.5, 22.1, 21.9, 21.4, 21.5],
        aiSimple: "Soil hydration is nominal. No action required."
    },
    {
        id: 2,
        name: "Monstera Deliciosa",
        clusterPos: "Zone A - Bay 2",
        liveData: { moisture: 28, temp: 23.1, light: 1200 },
        thresholds: { moisture: { min: 40, max: 80 } },
        weeklyMoistureData: [60, 50, 45, 38, 32, 30, 28],
        weeklyTempData: [23, 23.2, 22.9, 23.0, 23.5, 23.1, 23.1],
        aiSimple: "Moisture below critical minimum threshold (40%). Irrigation recommended."
    }
];

let readAlertIds = new Set();
let activePlantId = null;
let currentGraphView = 'simple';
let modalChartInstance = null;
let moistureChartInstance = null;
let tempChartInstance = null;

// UI NAVIGATION & TOASTS
function switchPage(targetView) {
    document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
    document.querySelectorAll('.view-page').forEach(p => p.classList.remove('active-page'));
    
    const nav = document.querySelector(`.nav-item[data-view="${targetView}"]`);
    const page = document.getElementById(`page-${targetView}`);
    
    if (nav) nav.classList.add('active');
    if (page) page.classList.add('active-page');
}

function showToast(message) {
    const container = document.getElementById('toastContainer');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerText = message;
    container.appendChild(toast);
    setTimeout(() => toast.classList.add('toast-visible'), 10);
    setTimeout(() => {
        toast.classList.remove('toast-visible');
        setTimeout(() => toast.remove(), 200);
    }, 2500);
}

// ALERTS SYSTEM
function checkAlerts() {
    const alerts = [];
    plantDataset.forEach(plant => {
        if (plant.liveData.moisture < plant.thresholds.moisture.min) {
            alerts.push({
                plantId: plant.id, 
                plantName: plant.name,
                message: `Moisture level warning (${plant.liveData.moisture}%).`
            });
        }
    });

    const unreadAlerts = alerts.filter(a => !readAlertIds.has(a.plantId));
    const badge = document.getElementById('alertBellBadge');
    const list = document.getElementById('alertsList');

    if (badge) {
        badge.innerText = unreadAlerts.length;
        badge.style.display = unreadAlerts.length > 0 ? 'flex' : 'none';
    }

    if (!list) return;

    if (alerts.length === 0) {
        list.innerHTML = `<div class="alert-empty">All nodes operational. No alerts.</div>`;
        return;
    }

    list.innerHTML = alerts.map(a => {
        const isRead = readAlertIds.has(a.plantId);
        return `
            <div class="alert-item ${isRead ? 'read' : ''}" id="alert-item-${a.plantId}">
                <div class="alert-item-title">${a.plantName}</div>
                <div class="alert-item-msg">${a.message}</div>
                <div class="alert-item-actions">
                    <button class="btn-text-action btn-read-alert" data-id="${a.plantId}">
                        ${isRead ? 'Read' : 'Mark as read'}
                    </button>
                </div>
            </div>
        `;
    }).join('');

    alerts.forEach(a => {
        const item = document.getElementById(`alert-item-${a.plantId}`);
        if (item) {
            item.onclick = (e) => {
                if (e.target.classList.contains('btn-read-alert')) {
                    e.stopPropagation();
                    readAlertIds.add(a.plantId);
                    checkAlerts();
                    return;
                }
                readAlertIds.add(a.plantId);
                checkAlerts();
                openPlantModal(a.plantId);
                toggleAlertsPanel(false);
            };
        }
    });
}

function markAllAlertsRead() {
    plantDataset.forEach(p => readAlertIds.add(p.id));
    checkAlerts();
    showToast("All notifications marked as read.");
}

function toggleAlertsPanel(forceState) {
    const panel = document.getElementById('alertsPanel');
    if (!panel) return;
    const currentState = panel.style.display === 'block';
    const nextState = typeof forceState === 'boolean' ? forceState : !currentState;
    panel.style.display = nextState ? 'block' : 'none';
}

// MODAL CONTROLS
function openPlantModal(plantId) {
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

function closePlantModal() {
    document.getElementById('plantModal').style.display = 'none';
}

function setGraphView(viewMode) {
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
        borderColor: '#000000',
        borderWidth: 2,
        tension: 0
    }];

    if (currentGraphView === 'advanced') {
        datasets.push({
            label: 'Temperature (°C)',
            data: plant.weeklyTempData,
            borderColor: '#888888',
            borderDash: [5, 5],
            borderWidth: 2,
            tension: 0
        });
    }

    modalChartInstance = new Chart(ctx, {
        type: 'line',
        data: { labels, datasets },
        options: { responsive: true, maintainAspectRatio: false }
    });
}

// DASHBOARD VIEW
function renderDashboardView() {
    const page = document.getElementById('page-dashboard');
    if (!page) return;

    const totalPlants = plantDataset.length;
    let unhealthyCount = 0;
    let moistureSum = 0;
    let tempSum = 0;

    plantDataset.forEach(p => {
        if (p.liveData.moisture < p.thresholds.moisture.min || p.liveData.moisture > p.thresholds.moisture.max) {
            unhealthyCount++;
        }
        moistureSum += p.liveData.moisture;
        tempSum += p.liveData.temp;
    });

    const avgMoisture = totalPlants > 0 ? Math.round(moistureSum / totalPlants) : 0;
    const avgTemp = totalPlants > 0 ? (tempSum / totalPlants).toFixed(1) : 0;
    const systemStatusText = unhealthyCount === 0 ? "All Systems Operational" : `${unhealthyCount} Node(s) Need Attention`;
    const statusBadgeClass = unhealthyCount === 0 ? "badge-healthy" : "badge-attention";

    page.innerHTML = `
        <header>
            <h1>System Overview</h1>
            <p>Real-time telemetry baseline and biosphere grid performance.</p>
        </header>

        <div class="kpi-grid">
            <div class="kpi-card">
                <div class="kpi-label">Active Nodes</div>
                <div class="kpi-value">${totalPlants}</div>
                <div class="kpi-sub">Registered sensor units</div>
            </div>
            <div class="kpi-card">
                <div class="kpi-label">System Health</div>
                <div class="kpi-value" style="font-size: 0.9rem; margin-top: 0.5rem;">
                    <span class="badge ${statusBadgeClass}">${systemStatusText}</span>
                </div>
                <div class="kpi-sub">${unhealthyCount} node(s) exceeding threshold</div>
            </div>
            <div class="kpi-card">
                <div class="kpi-label">Avg Moisture</div>
                <div class="kpi-value">${avgMoisture}%</div>
                <div class="kpi-sub">Across all biosphere zones</div>
            </div>
            <div class="kpi-card">
                <div class="kpi-label">Avg Temperature</div>
                <div class="kpi-value">${avgTemp}°C</div>
                <div class="kpi-sub">Thermal ambient mean</div>
            </div>
        </div>

        <div class="dashboard-sections">
            <div class="compact-card">
                <h3>
                    <span>Live Node Statuses</span>
                    <button class="btn-table-action" id="btnGoToPlants">Manage Nodes &rarr;</button>
                </h3>
                <table class="node-summary-table">
                    <thead>
                        <tr>
                            <th>Plant</th>
                            <th>Zone</th>
                            <th>Moisture</th>
                            <th>Status</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody id="overviewTableBody"></tbody>
                </table>
            </div>

            <div class="compact-card">
                <h3>AI System Digest</h3>
                <div class="ai-summary-box" style="margin-top: 0;">
                    <div class="ai-title">Autonomous Insight</div>
                    <p>
                        ${unhealthyCount > 0 
                            ? `Alert: ${unhealthyCount} plant(s) require moisture adjustments.` 
                            : 'All zone sensors reporting standard operating transpiration levels.'}
                    </p>
                </div>
            </div>
        </div>
    `;

    const tableBody = document.getElementById('overviewTableBody');
    tableBody.innerHTML = plantDataset.map(plant => {
        const healthy = plant.liveData.moisture >= plant.thresholds.moisture.min && plant.liveData.moisture <= plant.thresholds.moisture.max;
        return `
            <tr>
                <td><strong>${plant.name}</strong></td>
                <td>${plant.clusterPos}</td>
                <td>${plant.liveData.moisture}%</td>
                <td><span class="badge ${healthy ? 'badge-healthy' : 'badge-attention'}">${healthy ? 'Healthy' : 'Attention'}</span></td>
                <td><button class="btn-table-action btn-inspect" data-id="${plant.id}">Inspect</button></td>
            </tr>
        `;
    }).join('');

    const btnGoToPlants = document.getElementById('btnGoToPlants');
    if (btnGoToPlants) btnGoToPlants.onclick = () => switchPage('plants');
    
    tableBody.querySelectorAll('.btn-inspect').forEach(btn => {
        btn.onclick = () => {
            const id = parseInt(btn.getAttribute('data-id'));
            openPlantModal(id);
        };
    });
}

// PLANT GRID VIEW
function renderPlantsView() {
    const page = document.getElementById('page-plants');
    if (!page) return;

    page.innerHTML = `
        <div class="dashboard-header-wrap">
            <header>
                <h1>Plant Grid & Telemetry</h1>
                <p>Individual telemetry management, zone controls, and live sensor capture.</p>
            </header>
            <button class="btn-add-plant" id="btnOpenAddModal">
                + Add Plant
            </button>
        </div>
        <div class="plant-grid" id="plantGridContainer"></div>
    `;

    document.getElementById('btnOpenAddModal').onclick = () => {
        document.getElementById('addPlantModal').style.display = 'flex';
    };

    renderPlantGrid();
}

function renderPlantGrid() {
    const container = document.getElementById('plantGridContainer');
    if (!container) return;
    container.innerHTML = "";

    plantDataset.forEach(plant => {
        const healthy = plant.liveData.moisture >= plant.thresholds.moisture.min && plant.liveData.moisture <= plant.thresholds.moisture.max;
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
                        <button class="dropdown-item btn-menu-details" data-id="${plant.id}">View / Edit Modal</button>
                        <button class="dropdown-item btn-menu-delete" data-id="${plant.id}">Delete Plant</button>
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
                <div class="ai-title">AI Sensor Status</div>
                <p>${plant.aiSimple}</p>
            </div>
            <button class="btn-take-reading" id="btn-read-${plant.id}">Capture Node Telemetry</button>
        `;
        container.appendChild(card);

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

    document.onclick = () => document.querySelectorAll('.card-dropdown').forEach(d => d.classList.remove('show'));
}

function handleCreatePlant(name, zone) {
    const newId = plantDataset.length > 0 ? Math.max(...plantDataset.map(p => p.id)) + 1 : 1;
    const newPlant = {
        id: newId,
        name: name,
        clusterPos: zone || "Zone C - Unassigned",
        liveData: { moisture: 50, temp: 22.0, light: 900 },
        thresholds: { moisture: { min: 35, max: 75 } },
        weeklyMoistureData: [50, 50, 50, 50, 50, 50, 50],
        weeklyTempData: [22, 22, 22, 22, 22, 22, 22],
        aiSimple: "Newly initialized sensor node."
    };
    plantDataset.push(newPlant);
    renderPlantGrid();
    checkAlerts();
    showToast(`Registered node: ${newPlant.name}`);
}

function removePlant(plantId) {
    const plant = plantDataset.find(p => p.id === plantId);
    if (!plant) return;
    plantDataset = plantDataset.filter(p => p.id !== plantId);
    renderPlantGrid();
    checkAlerts();
    showToast(`Removed node: ${plant.name}`);
}

function takeNewReading(plantId) {
    const plant = plantDataset.find(p => p.id === plantId);
    if (!plant) return;

    plant.liveData.moisture = Math.round(Math.min(100, Math.max(0, plant.liveData.moisture + (Math.random() * 8 - 4))));
    plant.liveData.temp = Math.round((plant.liveData.temp + (Math.random() * 1.6 - 0.8)) * 10) / 10;
    plant.weeklyMoistureData.shift();
    plant.weeklyMoistureData.push(plant.liveData.moisture);

    renderPlantGrid();
    checkAlerts();
    showToast(`Telemetry updated for ${plant.name}`);
}

// ANALYTICS VIEW
function renderAnalyticsView() {
    const page = document.getElementById('page-analytics');
    if (!page) return;

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
        borderColor: '#000000',
        borderDash: idx % 2 === 0 ? [] : [5, 5],
        borderWidth: 2,
        tension: 0
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
        borderColor: '#666666',
        borderDash: idx % 2 === 0 ? [2, 2] : [8, 4],
        borderWidth: 2,
        tension: 0
    }));

    tempChartInstance = new Chart(tempCtx, {
        type: 'line',
        data: { labels: days, datasets: tempDatasets },
        options: { responsive: true, maintainAspectRatio: false }
    });
}

// SETTINGS VIEW
function renderSettingsView() {
    const page = document.getElementById('page-settings');
    if (!page) return;

    page.innerHTML = `
        <header>
            <h1>System Settings</h1>
            <p>Configure preferences, theme, and telemetry intervals.</p>
        </header>
        <div class="settings-card">
            <div class="settings-row">
                <div class="settings-info">
                    <label>Dark Theme</label>
                    <span>Enable high-contrast dark palette for night viewing.</span>
                </div>
                <label class="switch">
                    <input type="checkbox" id="themeToggle">
                    <span class="slider"></span>
                </label>
            </div>
            <div class="settings-row">
                <div class="settings-info">
                    <label>Telemetry Cache</label>
                    <span>Purge temporary local sensor cache.</span>
                </div>
                <button class="btn-table-action" id="btnClearCache">Clear Cache</button>
            </div>
        </div>
    `;

    const toggle = document.getElementById('themeToggle');
    if (toggle) {
        toggle.checked = document.body.getAttribute('data-theme') === 'dark';
        toggle.onchange = () => {
            const theme = toggle.checked ? 'dark' : 'light';
            document.body.setAttribute('data-theme', theme);
            showToast(`Theme switched to ${theme} mode.`);
        };
    }

    const btnClear = document.getElementById('btnClearCache');
    if (btnClear) {
        btnClear.onclick = () => showToast("Local sensor cache purged.");
    }
}

// INITIALIZATION
function initApp() {
    const appContainer = document.getElementById('app-container');
    if (appContainer) appContainer.style.display = 'flex';

    renderDashboardView();
    renderPlantsView();
    renderAnalyticsView();
    renderSettingsView();
    checkAlerts();
}

function initAppEvents() {
    document.querySelectorAll('.nav-item[data-view]').forEach(item => {
        item.onclick = () => {
            const viewTarget = item.getAttribute('data-view');
            switchPage(viewTarget);
            if (viewTarget === 'dashboard') renderDashboardView();
            if (viewTarget === 'plants') renderPlantsView();
            if (viewTarget === 'analytics') renderAnalyticsView();
        };
    });

    const bellToggle = document.getElementById('alertBellToggle');
    if (bellToggle) bellToggle.onclick = toggleAlertsPanel;

    const btnMarkRead = document.getElementById('btnMarkAllRead');
    if (btnMarkRead) btnMarkRead.onclick = markAllAlertsRead;

    const btnCloseModal = document.getElementById('btnCloseModal');
    if (btnCloseModal) btnCloseModal.onclick = closePlantModal;

    const btnSimple = document.getElementById('btnSimpleView');
    if (btnSimple) btnSimple.onclick = () => setGraphView('simple');

    const btnAdvanced = document.getElementById('btnAdvancedView');
    if (btnAdvanced) btnAdvanced.onclick = () => setGraphView('advanced');

    const btnCloseAdd = document.getElementById('btnCloseAddModal');
    if (btnCloseAdd) {
        btnCloseAdd.onclick = () => {
            const modal = document.getElementById('addPlantModal');
            if (modal) modal.style.display = 'none';
        };
    }

    const addForm = document.getElementById('addPlantForm');
    if (addForm) {
        addForm.onsubmit = (e) => {
            e.preventDefault();
            const nameInput = document.getElementById('newPlantName');
            const zoneInput = document.getElementById('newPlantZone');
            
            const name = nameInput ? nameInput.value : 'New Plant';
            const zone = zoneInput ? zoneInput.value : 'Zone A';

            handleCreatePlant(name, zone);
            addForm.reset();
            const modal = document.getElementById('addPlantModal');
            if (modal) modal.style.display = 'none';
        };
    }
}

document.addEventListener('DOMContentLoaded', () => {
    initApp();
    initAppEvents();
});