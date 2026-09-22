const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

// Redact credentials from any logged text.
function redact(value) {
    return String(value).replace(
        /(mongodb\+srv:\/\/|mongodb:\/\/)[^@\s]+@/g,
        "$1*****@"
    );
}

const app = express();

app.use(express.json());
app.use(cors());
app.use(express.static("public"));

async function connectDB() {
    const uri = process.env.MONGO_URI;

    if (!uri) {
        console.error(
            "MONGO_URI is not set in the .env file. Cannot connect to MongoDB."
        );
        return;
    }

    try {
        await mongoose.connect(uri, {
            dbName: "HackathonDB",
            serverSelectionTimeoutMS: 10000,
            connectTimeoutMS: 10000,
            retryWrites: true
        });

        console.log("MongoDB connected successfully");
    } catch (error) {
        console.error("MongoDB connection failed");
        console.error(redact(error.message));
        console.error(
            "Check: (1) Atlas Network Access -> allow your current IP, " +
            "(2) your .env MONGO_URI is copied exactly from Atlas > Drivers, " +
            "(3) the database user password is correct, " +
            "(4) the cluster is not paused."
        );
    }
}

const hackathonSchema = new mongoose.Schema({
    name: { type: String, required: true },
    date: { type: String, required: true },
    prize: { type: Number, required: true },
    teamSize: { type: Number, required: true }
});

const Hackathon = mongoose.model("Hackathon", hackathonSchema);

const teamSchema = new mongoose.Schema({
    teamName: { type: String, required: true },
    leader: { type: String, required: true },
    members: { type: [String], default: [] },
    hackathon: { type: String, required: true }
});

const Team = mongoose.model("Team", teamSchema);

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/public/index.html");
});

app.get("/api/hackathons", async (req, res) => {
    try {
        const hackathons = await Hackathon.find().sort({ name: 1 });
        res.json(hackathons);
    } catch (error) {
        console.error("GET /api/hackathons failed:", redact(error.message));
        res.status(500).json({
            message: "Error fetching hackathons"
        });
    }
});

app.post("/api/hackathons", async (req, res) => {
    try {
        const { name, date, prize, teamSize } = req.body;

        if (!name || !date || prize == null || teamSize == null) {
            return res.status(400).json({
                message: "name, date, prize and teamSize are required"
            });
        }

        const hackathon = new Hackathon({
            name,
            date,
            prize,
            teamSize
        });

        await hackathon.save();

        res.status(201).json(hackathon);
    } catch (error) {
        console.error("POST /api/hackathons failed:", redact(error.message));
        res.status(500).json({
            message: "Error creating hackathon"
        });
    }
});

app.put("/api/hackathons/:id", async (req, res) => {
    try {
        const { name, date, prize, teamSize } = req.body;

        const updates = {};
        if (name !== undefined) updates.name = name;
        if (date !== undefined) updates.date = date;
        if (prize !== undefined) updates.prize = prize;
        if (teamSize !== undefined) updates.teamSize = teamSize;

        const hackathon = await Hackathon.findByIdAndUpdate(
            req.params.id,
            updates,
            { new: true, runValidators: true }
        );

        if (!hackathon) {
            return res.status(404).json({
                message: "Hackathon not found"
            });
        }

        res.json(hackathon);
    } catch (error) {
        console.error("PUT /api/hackathons/:id failed:", redact(error.message));
        res.status(500).json({
            message: "Error updating hackathon"
        });
    }
});

app.delete("/api/hackathons/:id", async (req, res) => {
    try {
        const deleted = await Hackathon.findByIdAndDelete(req.params.id);

        if (!deleted) {
            return res.status(404).json({
                message: "Hackathon not found"
            });
        }

        res.json({
            message: "Hackathon deleted successfully"
        });
    } catch (error) {
        console.error("DELETE /api/hackathons/:id failed:", redact(error.message));
        res.status(500).json({
            message: "Error deleting hackathon"
        });
    }
});

app.get("/api/teams", async (req, res) => {
    try {
        const teams = await Team.find().sort({ teamName: 1 });
        res.json(teams);
    } catch (error) {
        console.error("GET /api/teams failed:", redact(error.message));
        res.status(500).json({
            message: "Error fetching teams"
        });
    }
});

app.post("/api/teams", async (req, res) => {
    try {
        const { teamName, leader, members, hackathon } = req.body;

        if (!teamName || !leader || !hackathon) {
            return res.status(400).json({
                message: "teamName, leader and hackathon are required"
            });
        }

        const team = new Team({
            teamName,
            leader,
            members: Array.isArray(members) ? members : [],
            hackathon
        });

        await team.save();

        res.status(201).json(team);
    } catch (error) {
        console.error("POST /api/teams failed:", redact(error.message));
        res.status(500).json({
            message: "Error creating team"
        });
    }
});

app.put("/api/teams/:id", async (req, res) => {
    try {
        const { teamName, leader, members, hackathon } = req.body;

        const updates = {};
        if (teamName !== undefined) updates.teamName = teamName;
        if (leader !== undefined) updates.leader = leader;
        if (members !== undefined) updates.members = members;
        if (hackathon !== undefined) updates.hackathon = hackathon;

        const team = await Team.findByIdAndUpdate(
            req.params.id,
            updates,
            { new: true, runValidators: true }
        );

        if (!team) {
            return res.status(404).json({
                message: "Team not found"
            });
        }

        res.json(team);
    } catch (error) {
        console.error("PUT /api/teams/:id failed:", redact(error.message));
        res.status(500).json({
            message: "Error updating team"
        });
    }
});

app.delete("/api/teams/:id", async (req, res) => {
    try {
        const deleted = await Team.findByIdAndDelete(req.params.id);

        if (!deleted) {
            return res.status(404).json({
                message: "Team not found"
            });
        }

        res.json({
            message: "Team deleted successfully"
        });
    } catch (error) {
        console.error("DELETE /api/teams/:id failed:", redact(error.message));
        res.status(500).json({
            message: "Error deleting team"
        });
    }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

connectDB();