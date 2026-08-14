import { plantDataset, i18n } from './data.js';
import { showToast } from './main.js';

export function renderSettingsView() {
    const page = document.getElementById('page-settings');
    page.innerHTML = `
        <header>
            <h1 id="txt-settings-title">System Settings</h1>
            <p style="color: var(--text-sub)">Platform configuration variables and system utilities.</p>
        </header>
        <div class="settings-card">
            <div class="settings-row">
                <div class="settings-info">
                    <label id="lbl-set-theme">Display Mode</label>
                    <span id="sub-set-theme">Toggle system dark/light configuration profile</span>
                </div>
                <div class="settings-control">
                    <label class="switch">
                        <input type="checkbox" id="themeToggle">
                        <span class="slider"></span>
                    </label>
                </div>
            </div>
            <div class="settings-row">
                <div class="settings-info">
                    <label id="lbl-set-export">Cloud Node Archive</label>
                    <span id="sub-set-export">Fetch dynamic JSON packet data from platform server</span>
                </div>
                <div class="settings-control">
                    <button class="action-link" id="btnExportJson">Export JSON</button>
                </div>
            </div>
            <div class="settings-row">
                <div class="settings-info">
                    <label id="lbl-set-clear">Purge Historical Telemetry</label>
                    <span id="sub-set-clear">Clear metrics arrays utilized for analytics graphs</span>
                </div>
                <div class="settings-control">
                    <button class="action-link" id="btnClearHistory" style="color: #ef4444;">Purge History</button>
                </div>
            </div>
            <div class="settings-row">
                <div class="settings-info">
                    <label id="lbl-set-lang">Interface Language</label>
                    <span id="sub-set-lang">Configure localized i18n interface variables</span>
                </div>
                <div class="settings-control">
                    <select id="langSelect">
                        <option value="en">English (US)</option>
                        <option value="es">Español</option>
                    </select>
                </div>
            </div>
        </div>
    `;

    document.getElementById('themeToggle').onchange = (e) => {
        if (e.target.checked) document.documentElement.setAttribute('data-theme', 'dark');
        else document.documentElement.removeAttribute('data-theme');
    };
    document.getElementById('btnExportJson').onclick = requestUserDataExport;
    document.getElementById('btnClearHistory').onclick = () => {
        plantDataset.forEach(p => { p.weeklyMoistureData = [0,0,0,0,0,0,0]; });
        showToast("Telemetry history purged.");
    };
    document.getElementById('langSelect').onchange = (e) => handleLanguageSwitch(e.target.value);
}

function requestUserDataExport() {
    const backupNode = { station_id: "XYLEM-GRID-01", export_time: new Date().toISOString(), nodes: plantDataset };
    const jsonString = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backupNode, null, 2));
    const downloader = document.createElement('a');
    downloader.setAttribute("href", jsonString);
    downloader.setAttribute("download", "xylem_telemetry.json");
    document.body.appendChild(downloader);
    downloader.click();
    downloader.remove();
}

function handleLanguageSwitch(langCode) {
    const dict = i18n[langCode];
    if (!dict) return;
    document.getElementById('txt-brand-title').innerText = dict.brandTitle;
    document.getElementById('txt-brand-sub').innerText = dict.brandSub;
    document.getElementById('loginBtn').innerText = dict.loginBtn;
}