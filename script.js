console.log("script.js loaded");

document.addEventListener("DOMContentLoaded", () => {
  const database = window.firebaseDB;
  const ref = window.firebaseRef;
  const push = window.firebasePush;
  const onValue = window.firebaseOnValue;

  function showSection(sectionId) {
    document.querySelectorAll(".section").forEach(section => section.style.display = "none");
    document.getElementById(sectionId).style.display = "block";
  }
  window.showSection = showSection;

  function addPlayer(team) {
    const input = document.getElementById(`${team.toLowerCase()}-add-player`);
    const playerName = input.value.trim();

    if (playerName === "") {
      alert("Please enter a valid player name.");
      return;
    }

    const teamRef = ref(database, `teams/${team}`);

    onValue(teamRef, snapshot => {
      if (snapshot.size < 18) {
        push(teamRef, { name: playerName }).then(() => {
          input.value = "";
          loadPlayers();
        });
      } else {
        alert("Maximum 18 players allowed per team.");
      }
    }, { onlyOnce: true });
  }
  window.addPlayer = addPlayer;

  function loadPlayers() {
    ["Paname", "Spartans"].forEach(team => {
      const teamRef = ref(database, `teams/${team}`);
      onValue(teamRef, snapshot => {
        const list = document.getElementById(`${team.toLowerCase()}-player-list`);
        list.innerHTML = "";
        snapshot.forEach(childSnapshot => {
          let li = document.createElement("li");
          li.textContent = childSnapshot.val().name;
          list.appendChild(li);
        });
      });
    });
  }

  function generateGamePairs(game) {
    ["Paname", "Spartans"].forEach(team => {
      const teamRef = ref(database, `teams/${team}`);
      onValue(teamRef, snapshot => {
        const players = [];
        snapshot.forEach(childSnapshot => players.push(childSnapshot.val().name));
        const shuffled = players.sort(() => 0.5 - Math.random());
        const pairs = [];

        for (let i = 0; i < shuffled.length; i += 2) {
          if (shuffled[i + 1]) {
            pairs.push(`${shuffled[i]} & ${shuffled[i + 1]}`);
          }
        }

        const pairList = document.getElementById(`${game.toLowerCase()}-pairs-list`);
        pairList.innerHTML = "";
        pairs.forEach(pair => {
          const li = document.createElement("li");
          li.textContent = pair;
          pairList.appendChild(li);
        });
      }, { onlyOnce: true });
    });
  }
  window.generateGamePairs = generateGamePairs;

  loadPlayers();
});
