import { connect, connection } from "mongoose";
import { Entry, IEntry, ILeaderboard, Leaderboard } from "./database-types";
require("dotenv").config();

console.log(process.env.DB_URI);
connect(process.env.DB_URI || "");
connection.once("open", () => {
  console.log("Connected to MongoDB");
});

export async function createleaderboard(
  name: string,
  description: string,
  executorId: string,
  guildId: string,
  protectedFlag: boolean = false
): Promise<ILeaderboard | undefined> {
  let leaderboard = new Leaderboard();
  leaderboard.name = name;
  leaderboard.description = description;
  leaderboard.protected = protectedFlag;
  leaderboard.creatorId = executorId;
  leaderboard.guildId = guildId;

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

export async function getAllLeaderboardsOfGuild(guildId: string) {
  const leaderboards = await Leaderboard.find({ guildId: guildId });
  return leaderboards;
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
  if (leaderboard.allowedList.find((entry: any) => entry === userId))
    leaderboard.allowedList = leaderboard.allowedList.filter(
      (entry: any) => entry !== userId
    );

  await leaderboard.save();
}

export async function deleteLeaderboard(
  leaderboardId: string,
  executor: string
) {
  const leaderboard = await Leaderboard.findById(leaderboardId);
  if (!leaderboard) throw new Error("Leaderboard not found!");

  if (leaderboard.creatorId !== executor)
    throw new Error("Not authorized to deleteLeaderboard");

  try {
    await leaderboard.remove();
  } catch (error) {
    console.log(error);
  }
}
