import { plantDataset } from './data.js';
import { openPlantModal } from './modal.js';
import { showToast } from './ui.js';

let readAlertIds = new Set();

export function checkAlerts() {
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

export function markAllAlertsRead() {
    plantDataset.forEach(p => readAlertIds.add(p.id));
    checkAlerts();
    showToast("All notifications marked as read.");
}

export function toggleAlertsPanel(forceState) {
    const panel = document.getElementById('alertsPanel');
    if (!panel) return;
    const currentState = panel.style.display === 'block';
    const nextState = typeof forceState === 'boolean' ? forceState : !currentState;
    panel.style.display = nextState ? 'block' : 'none';
}