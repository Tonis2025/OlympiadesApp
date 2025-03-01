// Initialize Firebase (replace with your config from Firebase Console)
const firebaseConfig = {
  apiKey: "AIzaSyAMpVUbMj-drEejxTIdziKBFeTUs_5Mbzo",
  authDomain: "olympiades-2025.firebaseapp.com",
  databaseURL: "https://olympiades-2025-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "olympiades-2025",
  storageBucket: "olympiades-2025.firebasestorage.app",
  messagingSenderId: "516570819182",
  appId: "1:516570819182:web:5c469efe13b71a6e64947f"
};
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

let panameTotal = 0;
let spartansTotal = 0;

let teams = { Paname: [], Spartans: [] };
let schedule = {};
let subTeams = { Paname: {}, Spartans: {} };
const gamesList = ["Padel", "Football", "Quizz", "Volleyball", "Darts", "Pétanque", "Bowling"];
const bracketGames = ["Padel", "Darts", "Pétanque"];

// Check if in admin mode (?admin=true in URL)
const urlParams = new URLSearchParams(window.location.search);
const isAdmin = urlParams.get("admin") === "true";
if (isAdmin) {
  document.body.classList.add("admin-mode");
} else {
  showSection("dashboard");
}

// Load data from Firebase
function loadData() {
  db.ref("teams").once("value", snapshot => {
    teams = snapshot.val() || { Paname: [], Spartans: [] };
    updateDisplay();
  });
  db.ref("schedule").once("value", snapshot => {
    schedule = snapshot.val() || {};
    if (document.getElementById("schedule").style.display === "block") generateSchedule();
  });
  db.ref("scores").once("value", snapshot => {
    const scores = snapshot.val() || { panameTotal: 0, spartansTotal: 0 };
    panameTotal = scores.panameTotal;
    spartansTotal = scores.spartansTotal;
    updateDisplay();
  });
  db.ref("subTeams").once("value", snapshot => {
    subTeams = snapshot.val() || { Paname: {}, Spartans: {} };
  });
}
loadData();

// Show Section with Transition
function showSection(sectionId) {
  const sections = document.querySelectorAll(".section");
  sections.forEach(section => {
    section.classList.remove("active");
    section.style.display = "none";
  });
  const targetSection = document.getElementById(sectionId);
  targetSection.style.display = "block";
  setTimeout(() => targetSection.classList.add("active"), 10);
  if (sectionId === "schedule") generateSchedule();
}

// Add Player (Admin Only)
function addPlayer(team) {
  if (!isAdmin) return;
  const input = document.getElementById(`${team.toLowerCase()}-add-player`);
  const playerName = input.value.trim();
  if (playerName && !teams[team].includes(playerName)) {
    teams[team].push(playerName);
    db.ref("teams").set(teams).then(() => {
      updateDisplay();
      input.value = "";
    });
  }
}

// Remove Player (Admin Only)
function removePlayer(team, player) {
  if (!isAdmin) return;
  if (confirm(`Remove ${player} from ${team}?`)) {
    teams[team] = teams[team].filter(p => p !== player);
    for (const game in subTeams[team]) {
      subTeams[team][game] = subTeams[team][game].filter(pair => !pair.includes(player));
    }
    Promise.all([
      db.ref("teams").set(teams),
      db.ref("subTeams").set(subTeams)
    ]).then(() => updateDisplay());
  }
}

// Save Schedule (Admin Only)
function saveSchedule(event) {
  event.preventDefault();
  if (!isAdmin) return;
  schedule = {
    "Padel": document.getElementById("schedule-padel").value || "TBD",
    "Football": document.getElementById("schedule-football").value || "TBD",
    "Quizz": document.getElementById("schedule-quizz").value || "TBD",
    "Volleyball": document.getElementById("schedule-volleyball").value || "TBD",
    "Darts": document.getElementById("schedule-darts").value || "TBD",
    "Pétanque": document.getElementById("schedule-petanque").value || "TBD",
    "Bowling": document.getElementById("schedule-bowling").value || "TBD"
  };
  db.ref("schedule").set(schedule).then(() => generateSchedule());
}

// Show Schedule
function generateSchedule() {
  const scheduleList = document.getElementById("schedule-list");
  scheduleList.innerHTML = "";
  for (const [game, time] of Object.entries(schedule)) {
    const li = document.createElement("li");
    li.textContent = `${game}: ${time}`;
    scheduleList.appendChild(li);
  }
}

// Setup Sub-Teams (Admin Only)
function setupSubTeams(game) {
  if (!isAdmin) return;
  if (teams.Paname.length < 2 || teams.Spartans.length < 2) {
    alert("Please add at least 2 players per team first!");
    return;
  }

  const subTeamsDiv = document.getElementById(`${game.toLowerCase()}-subteams`);
  subTeamsDiv.innerHTML = `<h4>${game} Sub-Teams</h4>`;

  if (bracketGames.includes(game)) {
    if (!subTeams.Paname[game]) subTeams.Paname[game] = [];
    if (!subTeams.Spartans[game]) subTeams.Spartans[game] = [];

    const panameUnpaired = teams.Paname.filter(p => !subTeams.Paname[game].some(pair => pair.includes(p)));
    const spartansUnpaired = teams.Spartans.filter(p => !subTeams.Spartans[game].some(pair => pair.includes(p)));

    subTeamsDiv.innerHTML += `
      <div class="pairing-form">
        <h5>Paname Pairing</h5>
        <select id="paname-player1-${game}">
          <option value="">Select Player 1</option>
          ${panameUnpaired.map(p => `<option value="${p}">${p}</option>`).join('')}
        </select>
        <select id="paname-player2-${game}">
          <option value="">Select Player 2</option>
          ${panameUnpaired.map(p => `<option value="${p}">${p}</option>`).join('')}
        </select>
        <button onclick="addPair('Paname', '${game}')">Add Pair</button>
        <p>Current Pairs: ${subTeams.Paname[game].map(pair => pair.join(" & ")).join(", ") || "None"}</p>
      </div>
      <div class="pairing-form">
        <h5>Spartans Pairing</h5>
        <select id="spartans-player1-${game}">
          <option value="">Select Player 1</option>
          ${spartansUnpaired.map(p => `<option value="${p}">${p}</option>`).join('')}
        </select>
        <select id="spartans-player2-${game}">
          <option value="">Select Player 2</option>
          ${spartansUnpaired.map(p => `<option value="${p}">${p}</option>`).join('')}
        </select>
        <button onclick="addPair('Spartans', '${game}')">Add Pair</button>
        <p>Current Pairs: ${subTeams.Spartans[game].map(pair => pair.join(" & ")).join(", ") || "None"}</p>
      </div>
    `;
  } else {
    subTeamsDiv.innerHTML += `
      <p>Paname Team: ${teams.Paname.join(", ")}</p>
      <p>Spartans Team: ${teams.Spartans.join(", ")}</p>
    `;
  }
}

// Add Pair (Admin Only)
function addPair(team, game) {
  const player1 = document.getElementById(`${team.toLowerCase()}-player1-${game}`).value;
  const player2 = document.getElementById(`${team.toLowerCase()}-player2-${game}`).value;
  if (player1 && player2 && player1 !== player2) {
    subTeams[team][game].push([player1, player2]);
    db.ref("subTeams").set(subTeams).then(() => setupSubTeams(game));
  } else {
    alert("Please select two different players!");
  }
}

// Update Scores (Admin Only)
function updateScore(game) {
  if (!isAdmin || bracketGames.includes(game)) return;
  const panameScore = parseInt(document.getElementById(`${game.toLowerCase()}-paname`).value) || 0;
  const spartansScore = parseInt(document.getElementById(`${game.toLowerCase()}-spartans`).value) || 0;

  if (panameScore > spartansScore) panameTotal += 3;
  else if (spartansScore > panameScore) spartansTotal += 3;
  else if (panameScore === spartansScore && panameScore > 0) {
    panameTotal += 1;
    spartansTotal += 1;
  }

  db.ref("scores").set({ panameTotal, spartansTotal }).then(() => {
    updateDisplay();
    document.getElementById(`${game.toLowerCase()}-paname`).value = "";
    document.getElementById(`${game.toLowerCase()}-spartans`).value = "";
  });
}

// Update Display (For All Users)
function updateDisplay() {
  document.getElementById("paname-score").textContent = panameTotal;
  document.getElementById("spartans-score").textContent = spartansTotal;

  const panameList = document.getElementById("paname-player-list");
  const spartansList = document.getElementById("spartans-player-list");
  panameList.innerHTML = "";
  spartansList.innerHTML = "";

  teams.Paname.forEach(player => {
    const li = document.createElement("li");
    li.innerHTML = `${player} <button class="remove-btn" onclick="removePlayer('Paname', '${player}')">Remove</button>`;
    panameList.appendChild(li);
  });
  teams.Spartans.forEach(player => {
    const li = document.createElement("li");
    li.innerHTML = `${player} <button class="remove-btn" onclick="removePlayer('Spartans', '${player}')">Remove</button>`;
    spartansList.appendChild(li);
  });
}

// Show dashboard on load for admins
if (isAdmin) showSection("dashboard");