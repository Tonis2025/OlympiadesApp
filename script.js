let panameTotal = 0;
let spartansTotal = 0;

let teams = { Paname: [], Spartans: [] };
let schedule = {};
const gamesList = ["Padel", "Football", "Quizz", "Volleyball", "Darts", "Pétanque", "Bowling"];
const bracketGames = ["Padel", "Darts", "Pétanque"];

// Check if in admin mode (?admin=true in URL)
const urlParams = new URLSearchParams(window.location.search);
const isAdmin = urlParams.get("admin") === "true";
if (isAdmin) {
  document.body.classList.add("admin-mode");
}

// Load saved data from localStorage
function loadData() {
  const savedTeams = localStorage.getItem("teams");
  const savedSchedule = localStorage.getItem("schedule");
  const savedScores = localStorage.getItem("scores");
  if (savedTeams) teams = JSON.parse(savedTeams);
  if (savedSchedule) schedule = JSON.parse(savedSchedule);
  if (savedScores) {
    const scores = JSON.parse(savedScores);
    panameTotal = scores.panameTotal || 0;
    spartansTotal = scores.spartansTotal || 0;
  }
  updateDisplay();
}
loadData();

// Add Player (Admin Only)
function addPlayer(team) {
  if (!isAdmin) return;
  const input = document.getElementById(`${team.toLowerCase()}-add-player`);
  const playerName = input.value.trim();
  if (playerName && !teams[team].includes(playerName)) {
    teams[team].push(playerName);
    localStorage.setItem("teams", JSON.stringify(teams));
    updateDisplay();
    input.value = "";
  }
}

// Remove Player (Admin Only)
function removePlayer(team, player) {
  if (!isAdmin) return;
  teams[team] = teams[team].filter(p => p !== player);
  localStorage.setItem("teams", JSON.stringify(teams));
  updateDisplay();
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
  localStorage.setItem("schedule", JSON.stringify(schedule));
  generateSchedule();
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

  const shuffle = (array) => array.sort(() => Math.random() - 0.5);
  const subTeamsDiv = document.getElementById(`${game.toLowerCase()}-subteams`);
  subTeamsDiv.innerHTML = `<h4>${game} Sub-Teams</h4>`;

  const shuffledPaname = shuffle([...teams.Paname]);
  const shuffledSpartans = shuffle([...teams.Spartans]);

  if (bracketGames.includes(game)) {
    const panamePairs = [];
    const spartansPairs = [];
    for (let i = 0; i < shuffledPaname.length; i += 2) {
      if (i + 1 < shuffledPaname.length) {
        panamePairs.push([shuffledPaname[i], shuffledPaname[i + 1]]);
      }
    }
    for (let i = 0; i < shuffledSpartans.length; i += 2) {
      if (i + 1 < shuffledSpartans.length) {
        spartansPairs.push([shuffledSpartans[i], shuffledSpartans[i + 1]]);
      }
    }
    subTeamsDiv.innerHTML += `
      <p>Paname Pairs: ${panamePairs.map(pair => pair.join(" & ")).join(", ")}</p>
      <p>Spartans Pairs: ${spartansPairs.map(pair => pair.join(" & ")).join(", ")}</p>
    `;
  } else {
    subTeamsDiv.innerHTML += `
      <p>Paname Team: ${shuffledPaname.join(", ")}</p>
      <p>Spartans Team: ${shuffledSpartans.join(", ")}</p>
    `;
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

  localStorage.setItem("scores", JSON.stringify({ panameTotal, spartansTotal }));
  updateDisplay();
  document