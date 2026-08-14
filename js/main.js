import { renderDashboardView } from './dashboard.js';
import { renderSettingsView } from './settings.js';
import { closePlantModal, setGraphView, openPlantModal } from './modal.js';
import { plantDataset } from './data.js';
import { subscribeToAuth, loginOrSignUpWithEmail, loginWithGoogle, logoutUser } from './firebase.js';

let readAlertIds = new Set();

document.addEventListener('DOMContentLoaded', () => {
    initAppEvents();

    // Real-time auth observer guarantees session persistence across page reloads
    subscribeToAuth(
        (user) => showAppContainer(user),
        () => showLoginScreen()
    );
});

function initAppEvents() {
    // Auth Form Submit
    document.getElementById('loginForm').onsubmit = async (e) => {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value;
        const pass = document.getElementById('loginPassword').value;

        try {
            await loginOrSignUpWithEmail(email, pass);
            showToast("Authenticated successfully.");
        } catch (err) {
            showToast(`Auth error: ${err.message}`);
        }
    };

    document.getElementById('btnGoogleLogin').onclick = async () => {
        try {
            await loginWithGoogle();
            showToast("Signed in with Google.");
        } catch (err) {
            showToast(`Google Auth failed: ${err.message}`);
        }
    };

    document.getElementById('btnSignout').onclick = () => document.getElementById('signoutDialog').showModal();
    document.getElementById('btnDialogCancel').onclick = () => document.getElementById('signoutDialog').close();
    document.getElementById('btnDialogConfirm').onclick = async () => {
        document.getElementById('signoutDialog').close();
        await logoutUser();
        showToast("Signed out.");
    };

    // View Navigation
    document.querySelectorAll('.nav-item[data-view]').forEach(item => {
        item.onclick = () => switchPage(item.getAttribute('data-view'));
    });

    // Alert Panel & Modals
    document.getElementById('alertBellToggle').onclick = toggleAlertsPanel;
    document.getElementById('btnMarkAllRead').onclick = markAllAlertsRead;
    document.getElementById('btnCloseModal').onclick = closePlantModal;
    document.getElementById('btnSimpleView').onclick = () => setGraphView('simple');
    document.getElementById('btnAdvancedView').onclick = () => setGraphView('advanced');
    
    document.getElementById('btnCloseAddModal').onclick = () => {
        document.getElementById('addPlantModal').style.display = 'none';
    };
}

function showAppContainer(user) {
    document.getElementById('login-screen').style.display = 'none';
    document.getElementById('app-container').style.display = 'flex';
    document.body.style.alignItems = 'flex-start';
    
    // Render views after authentication confirmed
    renderDashboardView();
    renderSettingsView();
    checkAlerts();
}

function showLoginScreen() {
    document.getElementById('app-container').style.display = 'none';
    document.getElementById('login-screen').style.display = 'block';
    document.body.style.alignItems = 'center';
}

export function switchPage(targetView) {
    document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
    document.querySelectorAll('.view-page').forEach(p => p.classList.remove('active-page'));
    const nav = document.querySelector(`.nav-item[data-view="${targetView}"]`);
    const page = document.getElementById(`page-${targetView}`);
    if (nav) nav.classList.add('active');
    if (page) page.classList.add('active-page');
}

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
                    markAlertRead(a.plantId);
                    return;
                }
                markAlertRead(a.plantId);
                openPlantModal(a.plantId);
                toggleAlertsPanel(false);
            };
        }
    });
}

function markAlertRead(plantId) {
    readAlertIds.add(plantId);
    checkAlerts();
}

function markAllAlertsRead() {
    plantDataset.forEach(p => readAlertIds.add(p.id));
    checkAlerts();
    showToast("All notifications marked as read.");
}

export function toggleAlertsPanel(forceState) {
    const panel = document.getElementById('alertsPanel');
    const currentState = panel.style.display === 'block';
    const nextState = typeof forceState === 'boolean' ? forceState : !currentState;
    panel.style.display = nextState ? 'block' : 'none';
}

export function showToast(message) {
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