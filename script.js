const workoutData = {
  park: {
    title: "🏞 Park Ladder Workout",
    structure: "10–6–4–3–2 reps",
    exercises: ["Pull-Ups", "Dips", "Knee Raises", "Assisted Squats", "Hanging SLR", "Dead Hang"],
    weeklyLogs: { /* populated */ },
  },
  home: {
    title: "🏠 Home Ladder Workout",
    structure: "10–6–4–3–2 reps + Press‑Ups",
    exercises: ["Pull-Ups", "Dips", "Knee Raises", "Assisted Squats", "Press-Ups", "Dead Hang"],
    weeklyLogs: { /* populated */ },
  },
  rings: {
    title: "🌀 Rings Workout",
    structure: "Fixed Sets",
    exercises: ["Ring Support Hold", "Ring Dips", "Supported Ring Squats", "Ring Press-Ups"],
    weeklyLogs: { /* populated */ },
  }
};

let currentWorkout = 'park';
const select = document.getElementById('workoutSelect');
const summary = document.getElementById('summary');
const inputsContainer = document.getElementById('dynamicInputs');
const logForm = document.getElementById('logForm');
const ctx = document.getElementById('progressChart').getContext('2d');
let chart;

init();

function init() {
  loadStorage();
  populateDropdown();
  renderWorkout(currentWorkout);
  setupEvents();
}

function loadStorage() {
  const saved = localStorage.getItem('workouts');
  if (saved) {
    const obj = JSON.parse(saved);
    Object.keys(workoutData).forEach(w => {
      if (obj[w]?.weeklyLogs) {
        workoutData[w].weeklyLogs = obj[w].weeklyLogs;
      }
      if (obj[w]?.exercises) {
        workoutData[w].exercises = obj[w].exercises;
      }
    });
  }
}

function saveStorage() {
  localStorage.setItem('workouts', JSON.stringify(workoutData));
}

function populateDropdown() {
  select.value = currentWorkout;
}

function setupEvents() {
  select.addEventListener('change', e => {
    currentWorkout = e.target.value;
    renderWorkout(currentWorkout);
  });
  logForm.addEventListener('submit', e => {
    e.preventDefault();
    const dateKey = new Date().toISOString().slice(0,10);
    const formData = new FormData(logForm);
    const entry = {};
    workoutData[currentWorkout].exercises.forEach(ex => {
      entry[ex] = Number(formData.get(safeKey(ex))) || 0;
    });
    workoutData[currentWorkout].weeklyLogs[dateKey] = entry;
    saveStorage();
    renderWorkout(currentWorkout);
    alert('Saved ✔️');
  });
}

function safeKey(str) {
  return str.replace(/\s+/g, '_');
}

function renderWorkout(type) {
  const data = workoutData[type];
  summary.innerHTML = `
    <h2>${data.title}</h2>
    <p><strong>Structure:</strong> ${data.structure}</p>
    <h3>Exercises:</h3>
    <ul id="exerciseList">${data.exercises.map(e => `<li class="exercise">${e} <button onclick="removeExercise('${type}','${e}')">🗑️</button></li>`).join('')}</ul>
    <input type="text" id="addEx" placeholder="Add new exercise">
    <button onclick="addExercise()">➕ Add Exercise</button>
  `;
  renderForm(data.exercises);
  renderChart(type);
}

function renderForm(exercises) {
  inputsContainer.innerHTML = exercises.map(ex => `
    <label>${ex}: 
      <input type="number" name="${safeKey(ex)}" min="0" placeholder="0">
    </label>
  `).join('');
}

function renderChart(type) {
  const logs = workoutData[type].weeklyLogs;
  const dates = Object.keys(logs).sort();
  const totals = dates.map(d => {
    return Object.values(logs[d]).reduce((sum, v) => sum + v, 0);
  });

  if (chart) chart.destroy();
  chart = new Chart(ctx, {
    type: 'bar',
    data: { labels: dates, datasets: [{ label: 'Total Reps/Tasks', data: totals, backgroundColor: '#4CAF50' }] },
    options: { responsive: true, scales: { y: { beginAtZero: true } } }
  });
}

// Expose for HTML onclick
window.addExercise = function() {
  const val = document.getElementById('addEx').value.trim();
  if (!val) return alert('Enter name');
  workoutData[currentWorkout].exercises.push(val);
  saveStorage();
  renderWorkout(currentWorkout);
  document.getElementById('addEx').value = '';
};

window.removeExercise = function(type, name) {
  const idx = workoutData[type].exercises.indexOf(name);
  if (idx > -1) {
    workoutData[type].exercises.splice(idx, 1);
    saveStorage();
    renderWorkout(type);
  }
};
