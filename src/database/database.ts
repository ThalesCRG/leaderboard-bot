import { connect, connection, Model, model, Schema } from "mongoose";
import { CreateEntry } from "../bot/handlers/create-entry";
import { CreateLeaderboard } from "../bot/handlers/create-leaderboard";
import { ConvertTimeStringToMilliseconds } from "../utils/time-utils";
import { IEntryEntity, ILeaderboardEntity } from "./database-types";

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

const Leaderboard = model<ILeaderboardEntity>("Leaderboard", leaderboardSchema);
const Entry = model<IEntryEntity>("Entry", entrySchema);

export async function initConnection(connectionString: string) {
  if (!connectionString) {
    return console.error("connection string is not set. check env DB_URI");
  }

  const uri = connectionString.slice(
    connectionString.indexOf("@") + 1,
    connectionString.indexOf("?")
  );
  console.log(`trying to connect to db ${uri}`);

  try {
    await connect(connectionString);
  } catch (error) {
    console.error(`initial connection to db failed`, error);
    throw "database connection failed";
  }

  connection.once("open", () => {
    console.log("successfully connected to database");
  });
  connection.once("error", (error) => {
    console.log("connection error on database", error);
  });
}

export async function saveLeaderboard(
  model: CreateLeaderboard,
  creatorId: string,
  guildId: string
): Promise<string> {
  const leaderboard = new Leaderboard({
    name: model.name,
    description: model.description,
    protected: model.protected,
    creatorId,
    guildId,
  });

  try {
    const result = await leaderboard.save();
    console.log(`Created new Leaderboard: ${JSON.stringify(result)}`);
  } catch (error) {
    console.log(error);
    throw new Error(`could not persist leaderboard with name ${model.name}`);
  }

  return leaderboard.id as string;
}

const isPersonAllowed = (
  leaderboard: ILeaderboardEntity,
  userId: string
): boolean => {
  return (
    leaderboard.creatorId === userId ||
    leaderboard.allowedList?.indexOf(userId) !== -1
  );
};

export async function addEntry(
  model: CreateEntry,
  userId: string
): Promise<[string, ILeaderboardEntity]> {
  const leaderboard = await Leaderboard.findById(model.leaderboardId);

  if (leaderboard === null) {
    throw new Error(
      `Cannot add an entry to unknown leaderboard ${model.leaderboardId}`
    );
  }

  if (leaderboard?.protected === true) {
    if (!isPersonAllowed(leaderboard, userId)) {
      throw new Error(
        `Permission denied: ${userId} is not allowed to write to ${model.leaderboardId}`
      );
    }
  }

  const entry = new Entry({
    userId: model.driver,
    time: ConvertTimeStringToMilliseconds(model.time),
    notes: model.notes,
  });

  leaderboard?.entries.push(entry);
  try {
    const entry = await leaderboard?.save();
    console.log(`persisted new time entry ${entry.id} for ${leaderboard.id}`);
  } catch (error) {
    console.log(error);
    throw new Error(`could not save time entry for ${userId}`);
  }
  return [entry.id, leaderboard];
}

export async function getAllLeaderboardsOfGuild(guildId: string) {
  const leaderboards = await Leaderboard.find({ guildId: guildId });
  return leaderboards;
}

export async function getLeaderboard(
  leaderboardId: string
): Promise<ILeaderboardEntity | undefined> {
  try {
    const leaderboard = await Leaderboard.findById(leaderboardId);

    if (!leaderboard) throw new Error("leaderboard not found");

    return leaderboard;
  } catch (error) {
    console.log(error);
  }
}

export function getBestPerPerson(
  leaderboard?: ILeaderboardEntity,
  entries?: Array<IEntryEntity>
): Array<IEntryEntity> {
  if (entries) {
    return getBestPerPersonByEntries(entries);
  } else {
    if (leaderboard) return getBestPerPersonByEntries(leaderboard.entries);
  }
  return [];
}

function getBestPerPersonByEntries(
  entries: IEntryEntity[]
): Array<IEntryEntity> {
  let result: IEntryEntity[] = [];

  entries.forEach((element: IEntryEntity) => {
    if (!result.find((entry) => entry.userId === element.userId)) {
      const userEntries = entries.filter(
        (entry: IEntryEntity) => entry.userId === element.userId
      );
      result.push(
        userEntries?.reduce((acc: IEntryEntity, entry: IEntryEntity) =>
          acc.time > entry.time ? entry : acc
        )
      );
    }
  });

  return result;
}

export function getAllowedPersons(
  leaderboard: ILeaderboardEntity
): Array<string> {
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
