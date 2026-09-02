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