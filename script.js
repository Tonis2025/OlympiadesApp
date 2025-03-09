// Wait for the document to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
  // Firebase Configuration
  const firebaseConfig = {
    apiKey: "AIzaSyAMpVUbMj-drEejxTIdziKBFeTUs_5Mbzo",
    authDomain: "olympiades-2025.firebaseapp.com",
    databaseURL: "https://olympiades-2025-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "olympiades-2025",
    storageBucket: "olympiades-2025.firebasestorage.app",
    messagingSenderId: "516570819182",
    appId: "1:516570819182:web:5c469efe13b71a6e64947f"
  };

  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);
  const database = firebase.database();

  // Make functions globally available
  window.showSection = showSection;
  window.addPlayer = addPlayer;
  window.removePlayer = removePlayer;
  window.switchGameTab = switchGameTab;
  window.selectPlayer = selectPlayer;
  window.createPair = createPair;
  window.removePair = removePair;

  // Store selected players for each game
  const selectedPlayers = {
    Padel: [],
    Petanque: [],
    Darts: []
  };

  // Function to show sections with browser back support
  function showSection(sectionId, addToHistory = true) {
    document.querySelectorAll(".section").forEach(section => section.style.display = "none");
    document.getElementById(sectionId).style.display = "block";

    if (addToHistory) {
      history.pushState({ section: sectionId }, "", `#${sectionId}`);
    }

    // If showing games section, load players for pair creation
    if (sectionId === 'games') {
      loadPlayersForPairCreation();
    }
  }

  // Handle browser back/forward navigation
  window.addEventListener("popstate", (event) => {
    if (event.state && event.state.section) {
      showSection(event.state.section, false);
    }
  });

  // Function to add a player to a team
  function addPlayer(team) {
    const input = document.getElementById(`${team.toLowerCase()}-add-player`);
    const playerName = input.value.trim();

    if (playerName === "") {
      alert("Please enter a valid player name.");
      return;
    }

    const teamRef = database.ref(`teams/${team}`);

    teamRef.push({ name: playerName })
      .then(() => {
        console.log(`Added player ${playerName} to ${team}`);
        input.value = "";
      })
      .catch(error => {
        console.error("Error adding player:", error);
        alert("Error adding player: " + error.message);
      });
  }

  // Function to remove a player from a team
  function removePlayer(team, playerId) {
    const playerRef = database.ref(`teams/${team}/${playerId}`);

    playerRef.remove()
      .then(() => {
        console.log(`Player ${playerId} removed successfully.`);
      })
      .catch(error => {
        console.error("Error removing player:", error);
        alert("Error removing player: " + error.message);
      });
  }

  // Function to load players from a team
  function loadPlayers() {
    ["Paname", "Spartans"].forEach(team => {
      const teamRef = database.ref(`teams/${team}`);

      teamRef.on('value', (snapshot) => {
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
          };

          li.appendChild(deleteBtn);
          list.appendChild(li);
        });
      });
    });
  }

  // Function to switch between game tabs
  function switchGameTab(gameType) {
    // Update tab buttons
    document.querySelectorAll('.tab-btn').forEach(tab => {
      tab.classList.remove('active');
    });
    document.querySelector(`.tab-btn[onclick="switchGameTab('${gameType}')"]`).classList.add('active');
    
    // Update tab content
    document.querySelectorAll('.game-tab-content').forEach(content => {
      content.classList.remove('active');
    });
    document.getElementById(`${gameType}-tab`).classList.add('active');
    
    // Update selected players display
    updateSelectedPlayersDisplay(gameType);
  }

  // Function to load players for pair creation
  function loadPlayersForPairCreation() {
    const games = ['Padel', 'Petanque', 'Darts'];
    const teams = ['Paname', 'Spartans'];
    
    teams.forEach(team => {
      database.ref(`teams/${team}`).once('value', (snapshot) => {
        if (!snapshot.exists()) {
          console.log(`No players found for ${team}`);
          return;
        }
        
        games.forEach(game => {
          const playerList = document.getElementById(`${game.toLowerCase()}-${team.toLowerCase()}-players`);
          playerList.innerHTML = ''; // Clear existing players
          
          snapshot.forEach((childSnapshot) => {
            const playerId = childSnapshot.key;
            const playerData = childSnapshot.val();
            
            if (!playerData || !playerData.name) return;
            
            const playerElement = document.createElement('li');
            playerElement.classList.add('player-option');
            playerElement.dataset.playerId = playerId;
            playerElement.dataset.team = team;
            playerElement.textContent = playerData.name;
            playerElement.onclick = () => selectPlayer(game, playerId, team, playerData.name);
            
            playerList.appendChild(playerElement);
          });
        });
      });
    });
    
    // Load existing pairs
    games.forEach(game => {
      loadPairs(game);
    });
  }

  // Function to select a player for pairing
  function selectPlayer(gameType, playerId, team, playerName) {
    const playerElement = document.querySelector(`#${gameType.toLowerCase()}-${team.toLowerCase()}-players .player-option[data-player-id="${playerId}"]`);
    
    // Check if player is already selected
    const playerIndex = selectedPlayers[gameType].findIndex(p => p.id === playerId);
    
    if (playerIndex > -1) {
      // Deselect player
      selectedPlayers[gameType].splice(playerIndex, 1);
      playerElement.classList.remove('selected');
    } else {
      // Select player (max 2)
      if (selectedPlayers[gameType].length < 2) {
        selectedPlayers[gameType].push({
          id: playerId,
          name: playerName,
          team: team
        });
        playerElement.classList.add('selected');
      } else {
        alert("You can only select 2 players to form a pair.");
      }
    }
    
    updateSelectedPlayersDisplay(gameType);
  }

  // Update the display of selected players
  function updateSelectedPlayersDisplay(gameType) {
    const selectedDisplay = document.getElementById(`${gameType.toLowerCase()}-selected-players`);
    
    if (selectedPlayers[gameType].length === 0) {
      selectedDisplay.textContent = "None";
    } else {
      selectedDisplay.textContent = selectedPlayers[gameType].map(p => `${p.name} (${p.team})`).join(" & ");
    }
  }

  // Function to create a pair
  function createPair(gameType) {
    if (selectedPlayers[gameType].length !== 2) {
      alert("Please select exactly 2 players to form a pair.");
      return;
    }
    
    const pairRef = database.ref(`pairs/${gameType}`);
    
    pairRef.push({
      player1: selectedPlayers[gameType][0],
      player2: selectedPlayers[gameType][1],
      createdAt: firebase.database.ServerValue.TIMESTAMP
    })
    .then(() => {
      console.log(`Created ${gameType} pair successfully`);
      
      // Clear selection
      selectedPlayers[gameType] = [];
      document.querySelectorAll(`#${gameType.toLowerCase()}-tab .player-option.selected`).forEach(el => {
        el.classList.remove('selected');
      });
      updateSelectedPlayersDisplay(gameType);
    })
    .catch(error => {
      console.error(`Error creating ${gameType} pair:`, error);
      alert(`Error creating pair: ${error.message}`);
    });
  }

  // Function to load existing pairs
  function loadPairs(gameType) {
    const pairsRef = database.ref(`pairs/${gameType}`);
    
    pairsRef.on('value', (snapshot) => {
      const pairsList = document.getElementById(`${gameType.toLowerCase()}-pairs-list`);
      pairsList.innerHTML = '';
      
      if (!snapshot.exists()) {
        return;
      }
      
      snapshot.forEach((childSnapshot) => {
        const pairId = childSnapshot.key;
        const pairData = childSnapshot.val();
        
        if (!pairData || !pairData.player1 || !pairData.player2) return;
        
        const pairElement = document.createElement('li');
        pairElement.classList.add('pair-item');
        
        const pairInfo = document.createElement('div');
        pairInfo.classList.add('pair-info');
        
        // Player 1
        const player1Span = document.createElement('span');
        player1Span.textContent = pairData.player1.name;
        
        const team1Tag = document.createElement('span');
        team1Tag.classList.add('team-tag', pairData.player1.team.toLowerCase());
        team1Tag.textContent = pairData.player1.team.substring(0, 1);
        
        // Player 2
        const player2Span = document.createElement('span');
        player2Span.textContent = pairData.player2.name;
        
        const team2Tag = document.createElement('span');
        team2Tag.classList.add('team-tag', pairData.player2.team.toLowerCase());
        team2Tag.textContent = pairData.player2.team.substring(0, 1);
        
        pairInfo.appendChild(player1Span);
        pairInfo.appendChild(team1Tag);
        pairInfo.appendChild(document.createTextNode(' & '));
        pairInfo.appendChild(player2Span);
        pairInfo.appendChild(team2Tag);
        
        // Remove button
        const removeBtn = document.createElement('button');
        removeBtn.innerHTML = '<i class="fas fa-times"></i>';
        removeBtn.classList.add('remove-pair');
        removeBtn.onclick = () => removePair(gameType, pairId);
        
        pairElement.appendChild(pairInfo);
        pairElement.appendChild(removeBtn);
        pairsList.appendChild(pairElement);
      });
    });
  }

  // Function to remove a pair
  function removePair(gameType, pairId) {
    const pairRef = database.ref(`pairs/${gameType}/${pairId}`);
    
    pairRef.remove()
      .then(() => {
        console.log(`Removed ${gameType} pair successfully`);
      })
      .catch(error => {
        console.error(`Error removing ${gameType} pair:`, error);
        alert(`Error removing pair: ${error.message}`);
      });
  }

  // Load players on startup
  loadPlayers();

  // Check URL on load (for browser back support)
  if (window.location.hash) {
    const sectionId = window.location.hash.substring(1);
    if (document.getElementById(sectionId)) {
      showSection(sectionId, false);
    }
  }

  // Test connection to Firebase Realtime Database
  const connectedRef = database.ref('.info/connected');
  connectedRef.on('value', (snapshot) => {
    if (snapshot.val() === true) {
      console.log('✅ Connected to Firebase Realtime Database');
    } else {
      console.log('❌ Not connected to Firebase Realtime Database');
    }
  });
});
