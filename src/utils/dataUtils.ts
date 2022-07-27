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
  creatorId: string;
  guildId?: string;
  description?: string;
  protected?: boolean;
  allowedList?: string[];
  entries: IEntry[];
}

const entrySchema = new Schema({
  userId: { type: String, required: true },
  time: { type: Number, required: true },
  notes: String,
});

const leaderboardSchema = new Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  creatorId: { type: String, required: true },
  guildId: String,
  entries: [entrySchema],
  protected: Boolean,
  allowedList: [String],
});

const Leaderboard = model<ILeaderboard>("Leaderboard", leaderboardSchema);
const Entry = model<IEntry>("Entry", entrySchema);

export async function createleaderboard(
  name: string,
  description: string,
  executorId: string,
  protectedFlag: boolean = false
): Promise<ILeaderboard | undefined> {
  let leaderboard: ILeaderboard = new Leaderboard();
  leaderboard.name = name;
  leaderboard.description = description;
  leaderboard.protected = protectedFlag;
  leaderboard.creatorId = executorId;
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
    console.log(`Allowed: ${allowedPersons} user: ${executor}`);

    if (
      leaderboard.protected &&
      !allowedPersons.find((userId) => userId === executor)
    )
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

export function getAllowedPersons(leaderboard: ILeaderboard): Array<string> {
  let result: Array<string> = [];
  if (leaderboard.protected) {
    result.push(leaderboard.creatorId);
    if (leaderboard.allowedList)
      Array.prototype.push.apply(result, leaderboard.allowedList);
  }

  return result;
}

export async function addAllowence(
  leaderboardId: string,
  userId: string,
  executor: string
) {
  const leaderboard = await Leaderboard.findById(leaderboardId);
  if (!leaderboard) throw new Error("Leaderboard not found!");
  if (leaderboard.creatorId !== executor) throw new Error("Not allowed.");

  if (!leaderboard.allowedList) leaderboard.allowedList = [userId];
  else {
    leaderboard.allowedList.push(userId);
  }
  await leaderboard.save();
}

export async function removeAllowence(
  leaderboardId: string,
  userId: string,
  executor: string
) {
  const leaderboard = await Leaderboard.findById(leaderboardId);
  if (!leaderboard) throw new Error("Leaderboard not found!");
  if (leaderboard.creatorId !== executor) throw new Error("Not allowed.");

  if (!leaderboard.allowedList) return;
  if (leaderboard.allowedList.find((entry) => entry === userId))
    leaderboard.allowedList = leaderboard.allowedList.filter(
      (entry) => entry !== userId
    );

  await leaderboard.save();
}
