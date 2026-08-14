export let plantDataset = [
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

export function createNewPlantNode(name, clusterPos) {
    const newId = plantDataset.length > 0 ? Math.max(...plantDataset.map(p => p.id)) + 1 : 1;
    const newPlant = {
        id: newId,
        name: name,
        clusterPos: clusterPos || "Zone C - Unassigned",
        liveData: { moisture: 50, temp: 22.0, light: 900 },
        thresholds: { moisture: { min: 35, max: 75 } },
        weeklyMoistureData: [50, 50, 50, 50, 50, 50, 50],
        weeklyTempData: [22, 22, 22, 22, 22, 22, 22],
        aiSimple: "Newly initialized sensor node."
    };
    plantDataset.push(newPlant);
    return newPlant;
}

export function deletePlantNode(plantId) {
    plantDataset = plantDataset.filter(p => p.id !== plantId);
}