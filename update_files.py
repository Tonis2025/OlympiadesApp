import os
import json

# Directory where your project files live
BASE_DIR = os.path.expanduser("~/Desktop/OlympiadesApp")

# File paths
FILES = {
    "index": os.path.join(BASE_DIR, "index.html"),
    "styles": os.path.join(BASE_DIR, "styles.css"),
    "script": os.path.join(BASE_DIR, "script.js")
}

def update_file(file_key, new_content):
    """Update the specified file with new content."""
    with open(FILES[file_key], "w") as f:
        f.write(new_content)
    print(f"Updated {FILES[file_key]}")

def apply_patch(patch):
    """Apply the patch to the specified files."""
    for file_key, content in patch.items():
        if file_key in FILES and content:
            update_file(file_key, content)
        else:
            print(f"No update needed for {file_key}")

if __name__ == "__main__":
    # Patch from the last bracket enhancement
    patch = {
        "index": None,
        "styles": """/* ... (unchanged styles above) ... */

/* Sub-Teams */
div[id$="-subteams"] {
  margin: 10px 0;
  padding: 15px;
  background: #f9f9f9;
  border-radius: 10px;
  border: 1px solid #eee;
  font-size: 0.9em;
  color: #444;
}
.pairing-form {
  margin: 15px 0;
}
.pairing-form select, .pairing-form button {
  margin: 5px;
}
.pair-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: center;
}
.pair-card {
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 5px;
  padding: 10px;
  width: 150px;
  text-align: center;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

/* Bracket Container */
.bracket-container {
  margin: 20px 0;
  padding: 15px;
  background: #f9f9f9;
  border-radius: 10px;
  border: 1px solid #eee;
  overflow-x: auto;
}
.bracket-setup {
  margin-bottom: 20px;
}
.bracket-match-form {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: center;
}
.bracket-match-form select {
  width: 150px;
}
.bracket {
  display: flex;
  justify-content: space-between;
  min-width: 600px;
  position: relative;
}
.bracket-round {
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  flex: 1;
  padding: 10px;
}
.bracket-match {
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 5px;
  padding: 10px;
  margin: 20px 0;
  min-height: 60px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  position: relative;
}
.bracket-match p {
  margin: 5px 0;
  font-size: 0.9em;
}
.bracket-match select {
  width: 100%;
  margin-top: 5px;
}
.bracket-match::after {
  content: '';
  position: absolute;
  top: 50%;
  right: -20px;
  width: 20px;
  height: 1px;
  background: #999;
}
.bracket-match:nth-child(even)::before {
  content: '';
  position: absolute;
  top: -50%;
  right: 0;
  width: 1px;
  height: 50%;
  background: #999;
}
.bracket-match:nth-child(odd)::after {
  content: '';
  position: absolute;
  top: 50%;
  right: 0;
  width: 1px;
  height: 50%;
  background: #999;
}
.bracket-round:last-child .bracket-match::after,
.bracket-round:last-child .bracket-match::before {
  display: none;
}

/* ... (unchanged styles below) ... */""",
        "script": """function setupSubTeams(game) {
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
      </div>
      <div class="pair-list">
        ${subTeams.Paname[game].map(pair => `<div class="pair-card">${pair.join(" & ")}</div>`).join('') || '<p>No pairs yet</p>'}
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
      </div>
      <div class="pair-list">
        ${subTeams.Spartans[game].map(pair => `<div class="pair-card">${pair.join(" & ")}</div>`).join('') || '<p>No pairs yet</p>'}
      </div>
    `;
  } else {
    subTeamsDiv.innerHTML += `
      <p>Paname Team: ${teams.Paname.join(", ")}</p>
      <p>Spartans Team: ${teams.Spartans.join(", ")}</p>
    `;
  }
}

function setupBracket(game) {
  if (!isAdmin) return;
  const allPairs = [...(subTeams.Paname[game] || []), ...(subTeams.Spartans[game] || [])];
  if (allPairs.length < 2) {
    alert("Need at least 2 pairs to setup a bracket!");
    return;
  }

  const bracketDiv = document.getElementById(`${game.toLowerCase()}-bracket`);
  bracketDiv.innerHTML = "<h5>Setup Initial Bracket Matches</h5>";

  if (!brackets[game].length) {
    const matchCount = Math.ceil(allPairs.length / 2);
    let matchHTML = '<div class="bracket-setup">';
    for (let i = 0; i < matchCount; i++) {
      matchHTML += `
        <div class="bracket-match-form">
          <select id="${game}-match-${i}-pair1">
            <option value="">Pair 1</option>
            ${allPairs.map(pair => `<option value="${pair.join(" & ")}">${pair.join(" & ")}</option>`).join('')}
          </select>
          <span>vs</span>
          <select id="${game}-match-${i}-pair2">
            <option value="">Pair 2</option>
            ${allPairs.map(pair => `<option value="${pair.join(" & ")}">${pair.join(" & ")}</option>`).join('')}
          </select>
        </div>
      `;
    }
    matchHTML += `<button onclick="saveBracket('${game}', ${matchCount})">Save Bracket</button></div>`;
    bracketDiv.innerHTML += matchHTML;
  } else {
    bracketDiv.innerHTML += `<div class="bracket" id="${game}-bracket-visual"></div>`;
    updateBracket(game);
  }
}

function saveBracket(game, matchCount) {
  const initialMatches = [];
  const usedPairs = new Set();

  for (let i = 0; i < matchCount; i++) {
    const pair1 = document.getElementById(`${game}-match-${i}-pair1`).value;
    const pair2 = document.getElementById(`${game}-match-${i}-pair2`).value;

    if (pair1 && pair2 && pair1 !== pair2 && !usedPairs.has(pair1) && !usedPairs.has(pair2)) {
      initialMatches.push({ pair1, pair2, winner: null });
      usedPairs.add(pair1);
      usedPairs.add(pair2);
    } else if (pair1 || pair2) {
      alert("Please select valid, unique pairs for each match!");
      return;
    }
  }

  if (initialMatches.length === 0) {
    alert("Please set up at least one match!");
    return;
  }

  brackets[game] = [initialMatches];
  if (db) {
    db.ref("brackets").set(brackets).then(() => {
      console.log(`Saved initial bracket for ${game}`);
      const bracketDiv = document.getElementById(`${game.toLowerCase()}-bracket`);
      bracketDiv.innerHTML = `<div class="bracket" id="${game}-bracket-visual"></div>`;
      updateBracket(game);
    }).catch(error => console.error("Error saving brackets:", error.message));
  } else {
    const bracketDiv = document.getElementById(`${game.toLowerCase()}-bracket`);
    bracketDiv.innerHTML = `<div class="bracket" id="${game}-bracket-visual"></div>`;
    updateBracket(game);
  }
}"""
    }
    try:
        apply_patch(patch)
        print("Patch applied successfully. Run 'git status' to check changes.")
    except Exception as e:
        print(f"Error applying patch: {e}")