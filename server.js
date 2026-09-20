const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(express.json());
app.use(cors());
app.use(express.static("public"));

mongoose.connect(process.env.MONGO_URI, {
    dbName: "HackathonDB"
})
    .then(() => {
        console.log("MongoDB connected successfully");
    })
    .catch((error) => {
        console.log("MongoDB connection failed");
        console.log(error);
    });

const hackathonSchema = new mongoose.Schema({
    name: String,
    date: String,
    prize: Number,
    teamSize: Number
});

const Hackathon = mongoose.model("Hackathon", hackathonSchema);

const teamSchema = new mongoose.Schema({
    teamName: String,
    leader: String,
    members: [String],
    hackathon: String
});

const Team = mongoose.model("Team", teamSchema);

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/public/index.html");
});

app.get("/api/hackathons", async (req, res) => {
    try {
        const hackathons = await Hackathon.find();
        res.json(hackathons);
    } catch (error) {
        res.status(500).json({
            message: "Error fetching hackathons"
        });
    }
});

app.post("/api/hackathons", async (req, res) => {
    try {
        const hackathon = new Hackathon(req.body);
        await hackathon.save();
        res.json(hackathon);
    } catch (error) {
        res.status(500).json({
            message: "Error creating hackathon"
        });
    }
});

app.get("/api/teams", async (req, res) => {
    try {
        const teams = await Team.find();
        res.json(teams);
    } catch (error) {
        res.status(500).json({
            message: "Error fetching teams"
        });
    }
});

app.post("/api/teams", async (req, res) => {
    try {
        const team = new Team(req.body);
        await team.save();
        res.json(team);
    } catch (error) {
        res.status(500).json({
            message: "Error creating team"
        });
    }
});

app.put("/api/teams/:id", async (req, res) => {
    try {
        const team = await Team.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );

        res.json(team);
    } catch (error) {
        res.status(500).json({
            message: "Error updating team"
        });
    }
});

app.delete("/api/teams/:id", async (req, res) => {
    try {
        await Team.findByIdAndDelete(req.params.id);

        res.json({
            message: "Team deleted successfully"
        });
    } catch (error) {
        res.status(500).json({
            message: "Error deleting team"
        });
    }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});