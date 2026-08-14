import { renderDashboardView } from './dashboard.js';
import { renderPlantsView, handleCreatePlant } from './plants.js';
import { renderAnalyticsView } from './analytics.js';
import { renderSettingsView } from './settings.js';
import { closePlantModal, setGraphView } from './modal.js';
import { subscribeToAuth, loginOrSignUpWithEmail, loginWithGoogle, logoutUser } from './firebase.js';
import { toggleAlertsPanel, markAllAlertsRead, checkAlerts } from './notifications.js';
import { switchPage, showToast } from './ui.js';

document.addEventListener('DOMContentLoaded', () => {
    initAppEvents();

    subscribeToAuth(
        (user) => showAppContainer(user),
        () => showLoginScreen()
    );
});

function initAppEvents() {
    // Auth Forms
    document.getElementById('loginForm').onsubmit = async (e) => {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value;
        const pass = document.getElementById('loginPassword').value;

        try {
            await loginOrSignUpWithEmail(email, pass);
            showToast("Authenticated successfully.");
            window.location.reload(); 
        } catch (err) {
            showToast(`Auth error: ${err.message}`);
        }
    };

    document.getElementById('btnGoogleLogin').onclick = async () => {
        try {
            await loginWithGoogle();
            showToast("Signed in with Google.");
            window.location.reload(); 
        } catch (err) {
            showToast(`Google Auth failed: ${err.message}`);
        }
    };

    document.getElementById('btnSignout').onclick = () => document.getElementById('signoutDialog').showModal();
    document.getElementById('btnDialogCancel').onclick = () => document.getElementById('signoutDialog').close();
    document.getElementById('btnDialogConfirm').onclick = async () => {
        document.getElementById('signoutDialog').close();
        await logoutUser();
        window.location.reload(); 
    };

    // Navigation Switcher
    document.querySelectorAll('.nav-item[data-view]').forEach(item => {
        item.onclick = () => {
            const viewTarget = item.getAttribute('data-view');
            switchPage(viewTarget);
            if (viewTarget === 'dashboard') renderDashboardView();
            if (viewTarget === 'plants') renderPlantsView();
            if (viewTarget === 'analytics') renderAnalyticsView();
        };
    });

    // Alert Panel & Modals
    document.getElementById('alertBellToggle').onclick = toggleAlertsPanel;
    document.getElementById('btnMarkAllRead').onclick = markAllAlertsRead;
    document.getElementById('btnCloseModal').onclick = closePlantModal;
    document.getElementById('btnSimpleView').onclick = () => setGraphView('simple');
    document.getElementById('btnAdvancedView').onclick = () => setGraphView('advanced');
    
    // Add Plant Modal Controls
    document.getElementById('btnCloseAddModal').onclick = () => {
        document.getElementById('addPlantModal').style.display = 'none';
    };
    document.getElementById('addPlantForm').onsubmit = (e) => {
        e.preventDefault();
        const name = document.getElementById('newPlantName').value;
        const zone = document.getElementById('newPlantZone').value;
        handleCreatePlant(name, zone);
        document.getElementById('addPlantForm').reset();
        document.getElementById('addPlantModal').style.display = 'none';
    };
}

function showAppContainer(user) {
    document.getElementById('login-screen').style.display = 'none';
    document.getElementById('app-container').style.display = 'flex';
    document.body.style.alignItems = 'flex-start';
    
    // Render views on load
    renderDashboardView();
    renderPlantsView();
    renderAnalyticsView();
    renderSettingsView();
    checkAlerts();
}

function showLoginScreen() {
    document.getElementById('app-container').style.display = 'none';
    document.getElementById('login-screen').style.display = 'block';
    document.body.style.alignItems = 'center';
}