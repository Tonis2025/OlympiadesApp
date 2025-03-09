console.log("script.js loaded");

document.addEventListener("DOMContentLoaded", () => {
  const database = window.firebaseDB;
  const ref = window.firebaseRef;
  const push = window.firebasePush;
  const onValue = window.firebaseOnValue;
  const remove = window.firebaseRemove;
  const child = window.firebaseChild;

  // Function to Show Sections with Browser Back Support
  function showSection(sectionId, addToHistory = true) {
    document.querySelectorAll(".section").forEach(section => section.style.display = "none");
    document.getElementById(sectionId).style.display = "block";

    if (addToHistory) {
      history.pushState({ section: sectionId }, "", `#${sectionId}`);
    }
  }
  window.showSection = showSection;

  // Handle browser back/forward navigation
  window.addEventListener("popstate", (event) => {
    if (event.state && event.state.section) {
      showSection(event.state.section, false);
    }
  });

  // Function to Add Player
  function addPlayer(team) {
    const input = document.getElementById(`${team.toLowerCase()}-add-player`);
    const playerName = input.value.trim();

    if (playerName === "") {
      alert("Please enter a valid player name.");
      return;
    }

    const teamRef = ref(database, `teams/${team}`);

    push(teamRef, { name: playerName }).then(() => {
      input.value = "";
    }).catch(error => {
      console.error("Error adding player:", error);
    });
  }
  window.addPlayer = addPlayer;

  // Function to Remove Player
  function removePlayer(team, playerId) {
    const playerRef = ref(database, `teams/${team}/${playerId}`);
  
    remove(playerRef)
      .then(() => {
        console.log(`Player ${playerId} removed successfully.`);
        // Update the UI by reloading the player list
        loadPlayers();
      })
      .catch(error => {
        console.error("Error removing player:", error);
      });
  }
  
  window.removePlayer = removePlayer;

  // Function to Load Players (Now Ignores Empty Data & Shows Correct UI)
  function loadPlayers() {
    ["Paname", "Spartans"].forEach(team => {
      const teamRef = ref(database, `teams/${team}`);

      onValue(teamRef, (snapshot) => {
        const list = document.getElementById(`${team.toLowerCase()}-player-list`);
        list.innerHTML = ""; // Clear the list before adding elements

        if (!snapshot.exists()) {
          console.log(`No players found for ${team}`);
          return;
        }

        snapshot.forEach((childSnapshot) => {
          const playerData = childSnapshot.val();
          if (!playerData || !playerData.name) return; // Ignore empty players

          let li = document.createElement("li");
          li.textContent = playerData.name;
          li.classList.add("player-item");

          let deleteBtn = document.createElement("button");
          deleteBtn.textContent = "✖";
          deleteBtn.classList.add("delete-btn");
          deleteBtn.onclick = () => {
            removePlayer(team, childSnapshot.key);
            li.remove(); // Instantly remove from UI
          };

          li.appendChild(deleteBtn);
          list.appendChild(li);
        });
      });
    });
  }

  // Load Players on Startup
  loadPlayers();

  // Check URL on Load (for Browser Back Support)
  if (window.location.hash) {
    showSection(window.location.hash.substring(1), false);
  }
});
