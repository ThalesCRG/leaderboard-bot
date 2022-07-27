import { model, Schema, Model, Document, connect, connection } from "mongoose";
require("dotenv").config();

console.log(process.env.DB_URI);
connect(process.env.DB_URI || "");
connection.once("open", () => {
  console.log("Connected to MongoDB");
});

export interface IEntry extends Document {
  userId: string;
  time: number;
  notes?: string;
}

export interface ILeaderboard extends Document {
  name: string;
  creatorId?: string;
  guildId?: string;
  description?: string;
  protected?: boolean;
  entries: IEntry[];
}

const entrySchema = new Schema({
  userId: { type: String, required: true },
  time: { type: Number, required: true },
  notes: String,
});

const leaderboardSchema = new Schema({
  name: { type: String, required: true },
  description: String,
  creatorId: String,
  guildId: String,
  entries: [entrySchema],
  protected: Boolean,
});

const Leaderboard = model<ILeaderboard>("Leaderboard", leaderboardSchema);
const Entry = model<IEntry>("Entry", entrySchema);

export async function createleaderboard(
  name: string,
  description: string,
  publicFlag: boolean = false
): Promise<ILeaderboard | undefined> {
  let leaderboard: ILeaderboard = new Leaderboard();
  leaderboard.name = name;
  leaderboard.description = description;
  leaderboard.protected = publicFlag;
  try {
    const result = await leaderboard.save();
    console.log(`Created new Leaderboard: ${JSON.stringify(result)}`);
    return result;
  } catch (error) {
    console.log(error);
  }
}

export async function addEntry(
  userId: string,
  time: number,
  leaderboardId: string,
  executor: string,
  notes?: string
) {
  const entry = new Entry();
  entry.userId = userId;
  entry.time = time;
  if (notes) entry.notes = notes;

  console.log(`Adding entry: ${JSON.stringify(entry)}`);

  try {
    const leaderboard = await Leaderboard.findById(leaderboardId);
    if (!leaderboard) throw new Error("leaderboard not found");
    const allowedPersons = getAllowedPersons(leaderboard);
    if (allowedPersons && !allowedPersons.find((userId) => userId === executor))
      throw new Error("executor not allowed");

    leaderboard.entries.push(entry);

    await leaderboard.save();
    return leaderboard;
  } catch (error) {
    console.log(error);
  }
}

export async function getLeaderboard(
  leaderboardId: string
): Promise<ILeaderboard | undefined> {
  try {
    const leaderboard = await Leaderboard.findById(leaderboardId);
    if (!leaderboard) throw new Error("leaderboard not found");

    return leaderboard;
  } catch (error) {
    console.log(error);
  }
}

export function getBestPerPerson(
  leaderboard?: ILeaderboard,
  entries?: Array<IEntry>
): Array<IEntry> {
  if (entries) {
    return getBestPerPersonByEntries(entries);
  } else {
    if (leaderboard) return getBestPerPersonByEntries(leaderboard.entries);
  }
  return [];
}

function getBestPerPersonByEntries(entries: IEntry[]): Array<IEntry> {
  let result: IEntry[] = [];

  entries.forEach((element: IEntry) => {
    if (!result.find((entry) => entry.userId === element.userId)) {
      const userEntries = entries.filter(
        (entry: IEntry) => entry.userId === element.userId
      );
      result.push(
        userEntries?.reduce((acc: IEntry, entry: IEntry) =>
          acc.time > entry.time ? entry : acc
        )
      );
    }
  });

  return result;
}

function getAllowedPersons(
  leaderboard: ILeaderboard
): Array<string | undefined> {
  let result: Array<string | undefined> = [];
  if (leaderboard.protected) return [leaderboard.creatorId];

  return result;
}
