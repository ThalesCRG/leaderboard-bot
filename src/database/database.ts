import { inlineCode, userMention } from "discord.js";
import { connect, connection, model, Schema } from "mongoose";
import { CreateEntry } from "../bot/handlers/create-entry";
import { CreateLeaderboard } from "../bot/handlers/create-leaderboard";
import { DeleteLeaderboard } from "../bot/handlers/delete-leaderboard";
import { SetDescription } from "../bot/handlers/set-description";
import { SetProtected } from "../bot/handlers/set-protected";
import { ConvertTimeStringToMilliseconds } from "../utils/time-utils";
import {
  Allowence,
  IEntryEntity,
  ILeaderboardEntity,
  LeaderboardMessage,
  ILeaderboardMessages,
  ProtectedResponse,
} from "./database-types";

const reqString = { type: String, required: true };
const entrySchema = new Schema({
  userId: reqString,
  time: { type: Number, required: true },
  notes: String,
});

const leaderboardSchema = new Schema({
  name: reqString,
  description: reqString,
  creatorId: reqString,
  guildId: String,
  entries: [entrySchema],
  protected: Boolean,
  allowedList: [String],
});

const leaderboardMessageSchema = new Schema({
  channelId: reqString,
  filtered: Boolean,
  messageId: reqString,
});

const leaderboardMessagesSchema = new Schema({
  leaderboardId: reqString,
  messages: [leaderboardMessageSchema],
});

const Leaderboard = model<ILeaderboardEntity>("Leaderboard", leaderboardSchema);
const Entry = model<IEntryEntity>("Entry", entrySchema);
const LeaderboardMessages = model<ILeaderboardMessages>(
  "LeaderboardMessages",
  leaderboardMessagesSchema
);

export async function initConnection(connectionString: string) {
  if (!connectionString) {
    return console.error("connection string is not set. check env DB_URI");
  }

  const uri = connectionString.slice(
    connectionString.indexOf("@") + 1,
    connectionString.indexOf("?") >= 0
      ? connectionString.indexOf("?")
      : undefined
  );
  console.log(`trying to connect to db ${uri}`);

  try {
    await connect(connectionString);
  } catch (error) {
    console.error(`initial connection to db failed`, error);
    throw "database connection failed";
  }

  console.log("database connection succesful");

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
  if (!guildId) return [];
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
  model: Allowence,
  executorId: string
): Promise<Allowence | undefined> {
  const leaderboard = await Leaderboard.findById(model.leaderboardId);
  if (!leaderboard) throw new Error("Leaderboard not found!");
  if (leaderboard.creatorId !== executorId)
    throw new Error(
      "Only the creator of the leaderboard can add or remove allowences."
    );

  if (!leaderboard.allowedList) leaderboard.allowedList = [model.userId];
  else {
    if (!leaderboard.allowedList.find((entry) => entry === model.userId)) {
      leaderboard.allowedList.push(model.userId);
    } else throw new Error("This User is already allowed to create Entries.");
  }
  try {
    await leaderboard.save();
    return model;
  } catch (error) {
    console.error(error);
  }
}

export async function removeAllowence(
  model: Allowence,
  executorId: string
): Promise<Allowence | undefined> {
  const leaderboard = await Leaderboard.findById(model.leaderboardId);
  if (!leaderboard) throw new Error("Leaderboard not found!");

  if (leaderboard.creatorId !== executorId)
    throw new Error(
      "Only the creator of the leaderboard can add or remove allowences."
    );

  if (!leaderboard.allowedList) return model;

  if (leaderboard.allowedList.find((entry: any) => entry === model.userId)) {
    leaderboard.allowedList = leaderboard.allowedList.filter(
      (entry: any) => entry !== model.userId
    );
  } else
    throw new Error(
      `${userMention(
        model.userId
      )} was not on the allow-list for leaderboard ${leaderboard._id.toString()}`
    );
  try {
    await leaderboard.save();
    return model;
  } catch (error) {
    console.error(error);
    return;
  }
}

export async function deleteLeaderboard(
  model: DeleteLeaderboard,
  executor: string
): Promise<{ leaderboardId: string } | undefined> {
  const leaderboard = await Leaderboard.findById(model.leaderboardId);
  if (!leaderboard) throw new Error("Leaderboard not found!");

  if (leaderboard.creatorId !== executor)
    throw new Error(
      "Not authorized to delete Leaderboard. Only the creator of the leaderboard is allowed to delete."
    );

  try {
    await leaderboard.remove();
    return { leaderboardId: leaderboard.id };
  } catch (error) {
    console.log(error);
  }
}

export async function setProtected(
  model: SetProtected,
  executor: string
): Promise<ProtectedResponse | undefined> {
  const leaderboard = await Leaderboard.findById(model.leaderboardId);
  if (!leaderboard) throw new Error("Leaderboard not found!");

  if (executor !== leaderboard.creatorId) throw new Error("Not allowed.");

  leaderboard.protected = model.protectedFlag;
  try {
    leaderboard.save();
    return {
      leaderboardId: leaderboard.id,
      protectedFlag: leaderboard.protected,
    };
  } catch (error) {
    console.log(error);
  }
}

export async function getUserLeaderboards(
  userId: string
): Promise<Array<ILeaderboardEntity>> {
  const leaderboards = await Leaderboard.find({ "entries.userId": userId });
  return leaderboards;
}

export async function setLeaderboardDescription(
  model: SetDescription,
  executor: string
): Promise<ILeaderboardEntity | undefined> {
  const leaderboard = await Leaderboard.findById(model.leaderboardId);
  if (!leaderboard)
    throw new Error(
      `Leaderboard with id ${inlineCode(model.leaderboardId)} does not exist`
    );

  if (leaderboard.creatorId !== executor)
    throw new Error(
      `Only the creator of the leaderboard may update the description.`
    );

  leaderboard.description = model.description;
  try {
    leaderboard.save();
    return leaderboard;
  } catch (error) {
    console.log(error);
  }
}

export async function getLeaderboardMessages(
  leaderboardId: string
): Promise<ILeaderboardMessages | null> {
  const leaderboardMesssages = await LeaderboardMessages.findOne({
    leaderboardId,
  });

  return leaderboardMesssages;
}

export async function addLeaderboardMessage(
  leaderboardId: string,
  message: { channelId: string; messageId: string; filtered: boolean }
): Promise<ILeaderboardMessages> {
  const existingleaderboardMesssages = await LeaderboardMessages.findOne({
    leaderboardId,
  });

  if (!existingleaderboardMesssages) {
    const leaderboardMessages = new LeaderboardMessages();
    leaderboardMessages.leaderboardId = leaderboardId;
    leaderboardMessages.messages = [message];
    await leaderboardMessages.save();
    return leaderboardMessages;
  }

  existingleaderboardMesssages.messages.push(message);
  await existingleaderboardMesssages.save();
  return existingleaderboardMesssages;
}

export async function removeMessage(
  messageId: string,
  channelId: string,
  leaderboardId: string
) {
  const Leaderboard = await LeaderboardMessages.findOne({ leaderboardId });
  if (!Leaderboard) return;

  Leaderboard.messages = Leaderboard.messages.filter((entry) => {
    return entry.channelId !== channelId && entry.messageId !== messageId;
  });

  console.log(
    `Deleted Message ${messageId} in Channel ${channelId} from Leaderboard ${leaderboardId}`
  );
  await Leaderboard.save();
}
