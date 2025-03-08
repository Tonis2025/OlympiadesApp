console.log("script.js loaded");

function showSection(sectionId) {
  const sections = document.querySelectorAll(".section");
  sections.forEach(section => section.style.display = "none");
  document.getElementById(sectionId).style.display = "block";
}

function addPlayer(team) {
  const input = document.getElementById(`${team.toLowerCase()}-add-player`);
  const playerName = input.value.trim();
  if (playerName) {
    const list = document.getElementById(`${team.toLowerCase()}-player-list`);
    const li = document.createElement("li");
    li.textContent = playerName;
    list.appendChild(li);
    input.value = "";
  }
}