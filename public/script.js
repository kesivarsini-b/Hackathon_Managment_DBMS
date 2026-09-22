function esc(value) {
    return String(value === null || value === undefined ? "" : value).replace(
        /[&<>"']/g,
        (ch) => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        })[ch]
    );
}

function makeHackathonCard(hackathon, withActions) {
    const card = document.createElement("div");
    card.className = "card";

    let actions = "";
    if (withActions) {
        actions = `
            <div class="team-actions">
                <button type="button" onclick="updateHackathon('${hackathon._id}')">Update</button>
                <button type="button" class="btn-delete" onclick="deleteHackathon('${hackathon._id}')">Delete</button>
            </div>
        `;
    }

    card.innerHTML = `
        <h3>${esc(hackathon.name)}</h3>
        <p><strong>Date:</strong> ${esc(hackathon.date)}</p>
        <p><strong>Prize:</strong> ₹${esc(hackathon.prize)}</p>
        <p><strong>Team Size:</strong> ${esc(hackathon.teamSize)} members</p>
        ${actions}
    `;
    return card;
}

function makeTeamCard(team, withActions) {
    const card = document.createElement("div");
    card.className = "team-card";

    const members = Array.isArray(team.members) && team.members.length
        ? team.members.join(", ")
        : "-";

    let actions = "";
    if (withActions) {
        actions = `
            <div class="team-actions">
                <button type="button" onclick="updateTeam('${team._id}')">Update</button>
                <button type="button" class="btn-delete" onclick="deleteTeam('${team._id}')">Delete</button>
            </div>
        `;
    }

    card.innerHTML = `
        <h3>${esc(team.teamName)}</h3>
        <p><strong>Leader:</strong> ${esc(team.leader)}</p>
        <p><strong>Members:</strong> ${esc(members)}</p>
        <p><strong>Hackathon:</strong> ${esc(team.hackathon)}</p>
        ${actions}
    `;
    return card;
}

function syncHackathonOptions(hackathons) {
    const select = document.getElementById("selectedHackathon");
    if (!select) {
        return;
    }

    const current = select.value;

    select.innerHTML = "";

    const placeholder = document.createElement("option");
    placeholder.value = "";
    placeholder.textContent = "Select Hackathon";
    select.appendChild(placeholder);

    hackathons.forEach(function (hackathon) {
        if (!hackathon || !hackathon.name) {
            return;
        }

        const option = document.createElement("option");
        option.value = hackathon.name;
        option.textContent = hackathon.name;
        select.appendChild(option);
    });

    select.value = current;
}

async function loadHackathons() {
    const hackathonList = document.getElementById("hackathonList");
    if (!hackathonList) {
        return;
    }

    try {
        const response = await fetch("/api/hackathons");
        if (!response.ok) {
            throw new Error("Server returned an error");
        }

        const hackathons = await response.json();

        hackathonList.innerHTML = "";
        syncHackathonOptions(hackathons);

        if (!hackathons.length) {
            hackathonList.innerHTML =
                '<p class="empty-note">No hackathons found. Add your first one above.</p>';
            return;
        }

        hackathons.forEach((hackathon) => {
            hackathonList.appendChild(makeHackathonCard(hackathon));
        });
    } catch (error) {
        console.error("Could not load hackathons:", error);
        if (!hackathonList.querySelector(".card")) {
            hackathonList.innerHTML =
                '<p class="empty-note">Could not load hackathons. Check that the server and MongoDB are running.</p>';
        }
    }
}

async function loadHackathonsForManagement() {
    const manageHackathonList = document.getElementById("manageHackathonList");
    if (!manageHackathonList) {
        return;
    }

    try {
        const response = await fetch("/api/hackathons");
        if (!response.ok) {
            throw new Error("Server returned an error");
        }

        const hackathons = await response.json();

        manageHackathonList.innerHTML = "";

        if (!hackathons.length) {
            manageHackathonList.innerHTML =
                '<p class="empty-note">No hackathons found. Add one above to manage it.</p>';
            return;
        }

        hackathons.forEach((hackathon) => {
            manageHackathonList.appendChild(
                makeHackathonCard(hackathon, true)
            );
        });
    } catch (error) {
        console.error("Could not load hackathons for management:", error);
        manageHackathonList.innerHTML =
            '<p class="empty-note">Could not load hackathons. Check that the server and MongoDB are running.</p>';
    }
}

async function loadTeams() {
    const teamList = document.getElementById("teamList");
    if (!teamList) {
        return;
    }

    try {
        const response = await fetch("/api/teams");
        if (!response.ok) {
            throw new Error("Server returned an error");
        }

        const teams = await response.json();

        teamList.innerHTML = "";

        if (!teams.length) {
            teamList.innerHTML =
                '<p class="empty-note">No teams registered yet. Register your team above.</p>';
            return;
        }

        teams.forEach((team) => {
            teamList.appendChild(makeTeamCard(team, false));
        });
    } catch (error) {
        console.error("Could not load teams:", error);
        if (!teamList.querySelector(".team-card")) {
            teamList.innerHTML =
                '<p class="empty-note">Could not load teams. Check that the server and MongoDB are running.</p>';
        }
    }
}

async function loadTeamsForManagement() {
    const manageTeamList = document.getElementById("manageTeamList");
    if (!manageTeamList) {
        return;
    }

    try {
        const response = await fetch("/api/teams");
        if (!response.ok) {
            throw new Error("Server returned an error");
        }

        const teams = await response.json();

        manageTeamList.innerHTML = "";

        if (!teams.length) {
            manageTeamList.innerHTML =
                '<p class="empty-note">No teams registered yet. Register a team above to manage it.</p>';
            return;
        }

        teams.forEach((team) => {
            manageTeamList.appendChild(makeTeamCard(team, true));
        });
    } catch (error) {
        console.error("Could not load teams for management:", error);
        manageTeamList.innerHTML =
            '<p class="empty-note">Could not load teams. Check that the server and MongoDB are running.</p>';
    }
}

const hackathonForm = document.getElementById("hackathonForm");

hackathonForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const name = document.getElementById("hackathonName").value;
    const date = document.getElementById("hackathonDate").value;
    const prize = Number(document.getElementById("hackathonPrize").value);
    const teamSize = Number(document.getElementById("teamSize").value);

    const submitButton = this.querySelector('button[type="submit"]');
    submitButton.disabled = true;

    try {
        const response = await fetch("/api/hackathons", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ name, date, prize, teamSize })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || "Could not add hackathon");
        }

        hackathonForm.reset();

        alert("Hackathon added successfully!");

        loadHackathons();
    } catch (error) {
        console.error("Add hackathon failed:", error);
        alert("Hackathon was not saved: " + error.message);
    } finally {
        submitButton.disabled = false;
    }
});

async function updateHackathon(id) {
    const name = prompt("Enter new hackathon name:");

    if (!name || !name.trim()) {
        return;
    }

    const date = prompt("Enter new date (YYYY-MM-DD):");

    if (!date || !date.trim()) {
        return;
    }

    const prizeInput = prompt("Enter new prize amount:");

    if (prizeInput === null || prizeInput.trim() === "") {
        return;
    }

    const prize = Number(prizeInput);

    const teamSizeInput = prompt("Enter new maximum team size:");

    if (teamSizeInput === null || teamSizeInput.trim() === "") {
        return;
    }

    const teamSize = Number(teamSizeInput);

    try {
        const response = await fetch(`/api/hackathons/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                name: name.trim(),
                date: date.trim(),
                prize,
                teamSize
            })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || "Could not update hackathon");
        }

        alert("Hackathon updated successfully!");

        loadHackathons();
        loadHackathonsForManagement();
    } catch (error) {
        console.error("Update hackathon failed:", error);
        alert("Error updating hackathon: " + error.message);
    }
}

async function deleteHackathon(id) {
    const confirmDelete = confirm(
        "Are you sure you want to delete this hackathon?"
    );

    if (!confirmDelete) {
        return;
    }

    try {
        const response = await fetch(`/api/hackathons/${id}`, {
            method: "DELETE"
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || "Could not delete hackathon");
        }

        alert("Hackathon deleted successfully!");

        loadHackathons();
        loadHackathonsForManagement();
    } catch (error) {
        console.error("Delete hackathon failed:", error);
        alert("Error deleting hackathon: " + error.message);
    }
}

const teamForm = document.getElementById("teamForm");

teamForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const teamName = document.getElementById("teamName").value;
    const leader = document.getElementById("leaderName").value;
    const member1 = document.getElementById("member1").value;
    const member2 = document.getElementById("member2").value;
    const hackathon = document.getElementById("selectedHackathon").value;

    const members = [member1];
    if (member2 && member2.trim()) {
        members.push(member2.trim());
    }

    const submitButton = this.querySelector('button[type="submit"]');
    submitButton.disabled = true;

    try {
        const response = await fetch("/api/teams", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ teamName, leader, members, hackathon })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || "Could not register team");
        }

        teamForm.reset();

        alert("Team registered successfully!");

        loadTeams();
        loadTeamsForManagement();
    } catch (error) {
        console.error("Register team failed:", error);
        alert("Team was not registered: " + error.message);
    } finally {
        submitButton.disabled = false;
    }
});

async function updateTeam(id) {
    const teamName = prompt("Enter new team name:");

    if (!teamName || !teamName.trim()) {
        return;
    }

    const leader = prompt("Enter new team leader:");

    if (!leader || !leader.trim()) {
        return;
    }

    const membersInput = prompt("Enter members separated by commas:");

    if (!membersInput || !membersInput.trim()) {
        return;
    }

    const hackathon = prompt("Enter hackathon name:");

    if (!hackathon || !hackathon.trim()) {
        return;
    }

    const members = membersInput
        .split(",")
        .map((member) => member.trim())
        .filter(Boolean);

    try {
        const response = await fetch(`/api/teams/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                teamName: teamName.trim(),
                leader: leader.trim(),
                members: members,
                hackathon: hackathon.trim()
            })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || "Could not update team");
        }

        alert("Team updated successfully!");

        loadTeams();
        loadTeamsForManagement();
    } catch (error) {
        console.error("Update team failed:", error);
        alert("Error updating team: " + error.message);
    }
}

async function deleteTeam(id) {
    const confirmDelete = confirm(
        "Are you sure you want to delete this team?"
    );

    if (!confirmDelete) {
        return;
    }

    try {
        const response = await fetch(`/api/teams/${id}`, {
            method: "DELETE"
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || "Could not delete team");
        }

        alert("Team deleted successfully!");

        loadTeams();
        loadTeamsForManagement();
    } catch (error) {
        console.error("Delete team failed:", error);
        alert("Error deleting team: " + error.message);
    }
}

loadHackathons();
loadHackathonsForManagement();
loadTeams();
loadTeamsForManagement();