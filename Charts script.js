function renderChart(type) {
  const logs = workoutData[type].weeklyLogs;
  const filter = filterSelect.value;
  const today = new Date();

  const filteredDates = Object.keys(logs).filter(dateStr => {
    const logDate = new Date(dateStr);
    if (filter === "weekly") {
      return (today - logDate) / (1000 * 60 * 60 * 24) <= 7;
    } else if (filter === "monthly") {
      return logDate.getMonth() === today.getMonth() && logDate.getFullYear() === today.getFullYear();
    }
    return true;
  });

  const sortedDates = filteredDates.sort();

  // BAR CHART DATA
  const totals = sortedDates.map(date =>
    Object.values(logs[date]).reduce((sum, reps) => sum + reps, 0)
  );

  if (chart) chart.destroy();
  chart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: sortedDates,
      datasets: [{
        label: 'Total Reps / Tasks',
        data: totals,
        backgroundColor: '#2196F3'
      }]
    },
    options: {
      responsive: true,
      scales: { y: { beginAtZero: true } }
    }
  });

  // PIE CHART DATA
  const exerciseSums = {};
  filteredDates.forEach(date => {
    const log = logs[date];
    for (let [exercise, reps] of Object.entries(log)) {
      exerciseSums[exercise] = (exerciseSums[exercise] || 0) + reps;
    }
  });

  const pieLabels = Object.keys(exerciseSums);
  const pieData = Object.values(exerciseSums);

  if (pieChart) pieChart.destroy();
  const pieCtx = document.getElementById('exercisePieChart').getContext('2d');
  pieChart = new Chart(pieCtx, {
    type: 'pie',
    data: {
      labels: pieLabels,
      datasets: [{
        label: 'Exercise Distribution',
        data: pieData,
        backgroundColor: pieLabels.map(() => `hsl(${Math.random() * 360}, 70%, 60%)`)
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { position: 'right' }
      }
    }
  });
}
