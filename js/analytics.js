function renderAnalyticsCharts() {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    // Wireframe Soil Moisture Chart (Solid/Dashed Black lines)
    const moistureCtx = document.getElementById('chartSystemMoisture').getContext('2d');
    if (moistureChartInstance) moistureChartInstance.destroy();

    const moistureDatasets = plantDataset.map((plant, idx) => ({
        label: plant.name,
        data: plant.weeklyMoistureData,
        borderColor: '#000000',
        borderDash: idx % 2 === 0 ? [] : [5, 5], // Alternate solid and dashed lines
        borderWidth: 2,
        tension: 0
    }));

    moistureChartInstance = new Chart(moistureCtx, {
        type: 'line',
        data: { labels: days, datasets: moistureDatasets },
        options: { responsive: true, maintainAspectRatio: false }
    });

    // Wireframe Thermal Distribution Chart
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