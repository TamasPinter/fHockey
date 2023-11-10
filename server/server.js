const mongoose = require("mongoose");
const express = require("express");
const bodyParser = require("body-parser");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const { User, Player, Group } = require("./models/models");

const app = express();
const PORT = process.env.PORT || 3001;
app.use(bodyParser.json());

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error:"));
db.once("open", () => {
  console.log("Connected to MongoDB");
});

const jwtSecretKey = process.env.JWT_SECRET_KEY || "secretKey";

const authenticateJWT = (req, res, next) => {
  const token = req.header("Authorization");
  if (!token) {
    return res.sendStatus(401);
  }
  jwt.verify(token, jwtSecretKey, (err, user) => {
    if (err) {
      return res.sendStatus(403);
    }
    req.user = user;
    next();
  });
};

//Routing for users
app.get("/api/users/:userId", authenticateJWT, async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await User.findById(
      userId,
      "username email profilePicture totalPoints fantasyTeam"
    ).populate({
      path: "fantasyTeam.forwards fantasyTeam.defenders fantasyTeam.goalie",
      select: "name position fantasyPoints",
    });

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }
    res.json(user);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

app.get("/api/users", async (req, res) => {
  try {
    const users = await User.find({}, "username totalPoints");
    res.json(users);
  } catch {
    res.status(500).send(error.message);
  }
});

app.post("/api/users", async (req, res) => {
  try {
    const newUser = await User.create(req.body);
    res.json(newUser);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

app.patch(
  "/api/users/:userId/profilePicture",
  authenticateJWT,
  async (req, res) => {
    const { userId } = req.params;
    const { profilePicture } = req.body;

    try {
      await User.findByIdAndUpdate(userId, { profilePicture }, { new: true });
      res.json({ message: "Profile Picture Updated!" });
    } catch (error) {
      res.status(500).send(error.message);
    }
  }
);

app.patch("/api/users/:userId/group", authenticateJWT, async (req, res) => {
  const { userId } = req.params;
  const { groupId } = req.body;

  try {
    await User.findByIdAndUpdate(
      userId,
      { $push: { groups: groupId } },
      { new: true }
    );
    res.json({ message: "User Group Added!" });
  } catch (error) {
    res.status(500).send(error.message);
  }
});

app.delete(
  "/api/users/:userId/fantasyTeam/:playerId",
  authenticateJWT,
  async (req, res) => {
    const { userId, playerId } = req.params;

    try {
      const currentUser = await User.findById(userId);

      const isPlayerInFantasyTeam =
        currentUser.fantasyTeam.forwards.includes(playerId) ||
        currentUser.fantasyTeam.defenders.includes(playerId) ||
        currentUser.fantasyTeam.goalie === playerId;

      if (!isPlayerInFantasyTeam) {
        return res.status(404).json({ message: "Player is not in team" });
      }

      currentUser.fantasyTeam.forwards =
        currentUser.fantasyTeam.forwards.filter((id) => id !== playerId);
      currentUser.fantasyTeam.defenders =
        currentUser.fantasyTeam.defenders.filter((id) => id !== playerId);
      if (currentUser.fantasyTeam.goalie === playerId) {
        currentUser.fantasyTeam.goalie = null;
      }

      await currentUser.save();
      res.json({ message: "Player removed successfully" });
    } catch (error) {
      res.status(500).send(error.message);
    }
  }
);

app.patch(
  "/api/users/:userId/fantasyTeam",
  authenticateJWT,
  async (req, res) => {
    const { userId } = req.params;
    const { forwards, defenders, goalie } = req.body;

    try {
      const currentUser = await User.findById(userId);
      const numForwards = forwards.length;
      const numDefenders = defenders.length;
      const numGoalies = goalie ? 1 : 0;

      if (numForwards > 3 || numDefenders > 2 || numGoalies > 1) {
        return res.status(400).json({
          message:
            "Invalid team, make sure there are no more than 3 forwards, 2 defenders and 1 goalie",
          action: "removePlayer",
        });
      }

      const allPlayers = [...forwards, ...defenders, goalie];
      const uniquePlayerIds = new Set(
        allPlayers.map((player) => player.toString())
      );

      if (allPlayers.length !== uniquePlayerIds.size) {
        return res.status(400).json({
          message: "invalid team, ensure all players are unique.",
          action: "removePlayer",
        });
      }

      await User.findByIdAndUpdate(userId, {
        $set: {
          "fantasyTeam.forwards": forwards,
          "fantasyTeam.defenders": defenders,
          "fantasyTeam.goalie": goalie,
        },
      });

      res.json({ message: "fantasy Team Updated!" });
    } catch (error) {
      res.status(500).send(error.message);
    }
  }
);

app.delete("/api/users/:userId", authenticateJWT, async (req, res) => {
  const { userId } = req.params;

  try {
    await User.findByIdAndDelete(userId);
    res.json({ message: "User deleted!" });
  } catch (error) {
    res.status(500).send(error.message);
  }
});

//Routing for players
app.get(
  "/api/users/:userId/fantasyTeam/players",
  authenticateJWT,
  async (req, res) => {
    const { userId } = req.params;

    try {
      const currentUser = await User.findById(userId).populate({
        path: "fantasyTeam.forwards fantasyTeam.defenders fantasyTeam.goalie",
        select: "name position team fantasyPoints",
      });

      if (!currentUser) {
        return res.status(404).json({ message: "user not found!" });
      }

      const forwards = currentUser.fantasyTeam.forwards.map((player) => ({
        name: player.name,
        position: player.position,
        team: player.team,
        fantasyPoints: player.fantasyPoints,
      }));

      const defenders = currentUser.fantasyTeam.defenders.map((player) => ({
        name: player.name,
        position: player.position,
        team: player.team,
        fantasyPoints: player.fantasyPoints,
      }));

      const goalie = currentUser.fantasyTeam.goalie
        ? {
            name: currentUser.fantasyTeam.goalie.name,
            position: currentUser.fantasyTeam.goalie.position,
            team: currentUser.fantasyTeam.goalie.team,
            fantasyPoints: currentUser.fantasyTeam.goalie.fantasyPoints,
          }
        : null;

      const allPlayers = [...forwards, ...defenders, goalie].filter(Boolean);
      res.json(allPlayers);
    } catch (error) {
      res.status(500).send(error.message);
    }
  }
);

//Routing for Groups

app.get("/api/groups", async (req, res) => {
  try {
    const groups = await Group.find({}, "name groupTotalPoints");
    res.json(groups);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

app.get("/api/groups/:groupId", async (req, res) => {
  const { groupId } = req.params;

  try {
    const group = await Group.findById(groupId).populate({
      path: "users",
      select: "username profilePicture totalPoints fantasyTeam",
      populate: {
        path: "fantasyTeam.forwards fantasyTeam.defenders fantasyTeam.goalie",
        select: "name position team fantasyPoints",
      },
    });

    if (!group) {
      return res.status(404).json({ message: "Group not found." });
    }

    res.json({
      name: group.name,
      members: group.members,
      groupTotalPoints: group.groupTotalPoints,
    });
  } catch (error) {
    res.status(500).send(error.message);
  }
});

app.post("/api/groups", authenticateJWT, async (req, res) => {
  const { groupName } = req.body;

  try {
    const newGroup = await Group.create({ name: groupName });
    const userId = req.user.userId;

    const user = await User.findByIdAndUpdate(
      userId,
      { $push: { groups: newGroup._id } },
      { new: true }
    );
    res.json({
      message: "Group created and joined!",
      group: newGroup,
      user: user,
    });
  } catch (error) {
    res.status(500).send(error.message);
  }
});

app.delete("/api/groups/:groupId", authenticateJWT, async (req, res) => {
  const { groupId } = req.params;

  try {
    const group = await Group.findByIdAndDelete(groupId);

    if (!groupId) {
      return res.status(404).json({ message: "group not found!" });
    }

    await User.updateMany({ groups: groupId }, { $pull: { groups: groupId } });
    res.json({ message: "group deleted!" });
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
