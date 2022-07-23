import mongoose from "mongoose";

mongoose.connect("mongodb://localhost:27017/leaderboard-bot");

const Schema = mongoose.Schema;

const entrySchema = new Schema({
  name: String,
  time: Number,
  notes: { type: String, required: false },
});

const LeaderboardSchema = new Schema({
  name: String,
  description: String,
  entries: [entrySchema],
});

const Leaderboard = mongoose.model("Leaderboard", LeaderboardSchema);
const Entry = mongoose.model("entry", entrySchema);

export async function createleaderboard(name: string, description: string) {
  let leaderboard = new Leaderboard();
  leaderboard.name = name;
  leaderboard.description = description;
  const result = await leaderboard.save();
  console.log(JSON.stringify(result));
}

export async function addEntry(
  name: string,
  time: number,
  leaderboardId: string,
  note?: string
) {
  throw new Error("Not implemented.");
}
