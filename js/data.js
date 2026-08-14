export const i18n = {
    en: {
        brandTitle: "XYLEM", brandSub: "Enterprise Telemetry & Plant Analytics",
        username: "Email Address", password: "Password", loginBtn: "Sign In",
        setMainTitle: "System Settings", setTheme: "Display Mode", subTheme: "Toggle system dark/light configuration profile",
        setExport: "Cloud Node Archive", subExport: "Fetch dynamic JSON packet data from platform server",
        setClear: "Purge Historical Telemetry", subClear: "Clear metrics arrays utilized for analytics graphs",
        setLang: "Interface Language", subLang: "Configure localized i18n interface variables",
        diagTitle: "Confirm Sign Out"
    }
};

export let plantDataset = [
    {
        id: 0,
        name: "Fiddle Leaf Fig",
        clusterPos: "Zone A - Row 2",
        liveData: { moisture: 64, temp: 22.4, light: 4200 },
        avgMoisture30Days: "61%",
        avgTemp30Days: "21.8°C",
        aiSimple: "Optimal cellular hydration levels detected.",
        aiAdvanced: "Gemini AI: Transpiration rates remain highly optimal. Sunlight cycles match expected growth curves perfectly.",
        weeklyMoistureData: [58, 60, 62, 65, 64, 63, 64],
        weeklyTempData: [20.5, 21.0, 21.8, 22.1, 22.4, 22.0, 22.4],
        thresholds: { moisture: { min: 50, max: 75 }, temp: { min: 18, max: 26 }, light: { min: 3000, max: 6000 } }
    },
    {
        id: 1,
        name: "Monstera Deliciosa",
        clusterPos: "Zone B - Row 1",
        liveData: { moisture: 38, temp: 24.1, light: 5100 },
        avgMoisture30Days: "52%",
        avgTemp30Days: "23.5°C",
        aiSimple: "Soil moisture is below minimum recommended thresholds.",
        aiAdvanced: "Gemini AI: Consistent decline in hydration recorded over 48 hours. Irrigation intervention recommended.",
        weeklyMoistureData: [48, 45, 42, 40, 39, 37, 38],
        weeklyTempData: [22.1, 22.8, 23.2, 23.9, 24.0, 24.2, 24.1],
        thresholds: { moisture: { min: 45, max: 70 }, temp: { min: 20, max: 27 }, light: { min: 4000, max: 7000 } }
    }
];

export function createNewPlantNode(name, zone) {
    const newId = plantDataset.length > 0 ? Math.max(...plantDataset.map(p => p.id)) + 1 : 0;
    const newNode = {
        id: newId,
        name: name,
        clusterPos: zone,
        liveData: { moisture: 55, temp: 22.0, light: 4500 },
        avgMoisture30Days: "55%",
        avgTemp30Days: "22.0°C",
        aiSimple: "Initial telemetry baseline established.",
        aiAdvanced: "Gemini AI: Initializing baseline tracking series for newly provisioned hardware node.",
        weeklyMoistureData: [55, 55, 55, 55, 55, 55, 55],
        weeklyTempData: [22.0, 22.0, 22.0, 22.0, 22.0, 22.0, 22.0],
        thresholds: { moisture: { min: 45, max: 75 }, temp: { min: 18, max: 26 }, light: { min: 3000, max: 6000 } }
    };
    plantDataset.push(newNode);
    return newNode;
}

export function deletePlantNode(plantId) {
    plantDataset = plantDataset.filter(p => p.id !== plantId);
}