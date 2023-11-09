const mongoose = require("mongoose");
//Schemas

const groupSchema = new mongoose.Schema({
  name: String,
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  groupTotalPoints: {
    type: Number,
    default: 0,
  },
});

const userSchema = new mongoose.Schema({
  username: String,
  password: String,
  email: String,
  profilePicture: String,
  fantasyTeam: {
    forwards: [
      { type: mongoose.Schema.Types.ObjectId.ObjectId, ref: "Player" },
    ],
    defenders: [{ type: mongoose.Schema.Types.ObjectId, ref: "Player" }],
    goalie: { type: mongoose.Schema.Types.ObjectId, ref: "Player" },
  },
  totalPoints: {
    type: Number,
    default: 0,
  },
  groups: [groupSchema],
});

const playerSchema = new mongoose.Schema({
  name: String,
  position: String,
  team: String,
  fantasyPoints: Number,
});

const User = mongoose.model("User", userSchema);
const Player = mongoose.model("player", playerSchema);
const Group = mongoose.model("Group", groupSchema);

module.exports = { User, Player, Group };
