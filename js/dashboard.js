import { plantDataset } from './data.js';
import { openPlantModal } from './modal.js';
import { switchPage } from './ui.js';

export function renderDashboardView() {
    const page = document.getElementById('page-dashboard');
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
                <div class="kpi-value" style="font-size: 1.25rem; margin-top: 0.5rem;">
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
                <h3>Gemini System AI Digest</h3>
                <div class="ai-summary-box" style="margin-top: 0;">
                    <div class="ai-title">Autonomous Insight</div>
                    <p>
                        ${unhealthyCount > 0 
                            ? `Alert: ${unhealthyCount} plant(s) require moisture adjustments. Check Zone B row thresholds.` 
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

    document.getElementById('btnGoToPlants').onclick = () => {
        switchPage('plants');
    };
    
    tableBody.querySelectorAll('.btn-inspect').forEach(btn => {
        btn.onclick = () => {
            const id = parseInt(btn.getAttribute('data-id'));
            openPlantModal(id);
        };
    });
}