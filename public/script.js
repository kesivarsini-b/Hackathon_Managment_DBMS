const hackathonForm = document.getElementById("hackathonForm");
const teamForm = document.getElementById("teamForm");

hackathonForm.addEventListener("submit", function (event) {

    event.preventDefault();

    const name = document.getElementById("hackathonName").value;
    const date = document.getElementById("hackathonDate").value;
    const prize = document.getElementById("hackathonPrize").value;
    const teamSize = document.getElementById("teamSize").value;

    const hackathonList = document.getElementById("hackathonList");

    const card = document.createElement("div");

    card.className = "card";

    card.innerHTML = `
        <h3>${name}</h3>
        <p><strong>Date:</strong> ${date}</p>
        <p><strong>Prize:</strong> ₹${prize}</p>
        <p><strong>Team Size:</strong> ${teamSize} members</p>
    `;

    hackathonList.appendChild(card);

    hackathonForm.reset();

    alert("Hackathon added successfully!");
});


teamForm.addEventListener("submit", function (event) {

    event.preventDefault();

    const teamName = document.getElementById("teamName").value;
    const leader = document.getElementById("leaderName").value;
    const member1 = document.getElementById("member1").value;
    const member2 = document.getElementById("member2").value;
    const hackathon = document.getElementById("selectedHackathon").value;

    const teamList = document.getElementById("teamList");

    const teamCard = document.createElement("div");

    teamCard.className = "team-card";

    teamCard.innerHTML = `
        <h3>${teamName}</h3>
        <p><strong>Leader:</strong> ${leader}</p>
        <p><strong>Members:</strong> ${member1}, ${member2}</p>
        <p><strong>Hackathon:</strong> ${hackathon}</p>
    `;

    teamList.appendChild(teamCard);

    teamForm.reset();

    alert("Team registered successfully!");
});