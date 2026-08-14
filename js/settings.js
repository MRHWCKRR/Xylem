import { showToast } from './ui.js';

export function renderSettingsView() {
    const page = document.getElementById('page-settings');
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
                <button class="action-link" id="btnClearCache">Clear Cache</button>
            </div>
        </div>
    `;

    const toggle = document.getElementById('themeToggle');
    toggle.checked = document.body.getAttribute('data-theme') === 'dark';
    toggle.onchange = () => {
        const theme = toggle.checked ? 'dark' : 'light';
        document.body.setAttribute('data-theme', theme);
        showToast(`Theme switched to ${theme} mode.`);
    };

    document.getElementById('btnClearCache').onclick = () => {
        showToast("Local sensor cache purged.");
    };
}