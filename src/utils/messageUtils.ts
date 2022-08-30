import { IEntryEntity, ILeaderboardEntity } from "../database/database-types";
import {
  addLeaderboardMessage,
  getBestPerPerson,
  getLeaderboardMessages,
  removeMessage,
} from "../database/database";
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  DiscordAPIError,
  Message,
  TextBasedChannel,
  userMention,
} from "discord.js";
var moment = require("moment");
import momentDurationFormatSetup from "moment-duration-format";
import { fetchMessage } from "../bot/bot";
import { createEntryButtonprefix } from "../bot/handlers/create-entry";

momentDurationFormatSetup(moment);

const MAX_FIELD_LENGTH = 1024;
export const MAX_DESCRIPTION_LENGTH = 4096;

export async function printLeaderboard(
  leaderboard: ILeaderboardEntity,
  channel: TextBasedChannel,
  filtered = false
) {
  if (!leaderboard || !channel) return;
  const message = generateMessage(leaderboard, filtered);

  try {
    const response = await channel.send(message);
    addMessage(leaderboard.id, response, filtered);
  } catch (error) {
    console.log(error);
  }
}

function generateMessage(leaderboard: ILeaderboardEntity, filtered: boolean) {
  const embeds = generateEmbeds(
    leaderboard,
    parseEntries(filtered ? getBestPerPerson(leaderboard) : leaderboard.entries)
  );

  const actionBuilder = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId(`${createEntryButtonprefix}-${leaderboard.id}`)
      .setLabel("Add Entry")
      .setStyle(ButtonStyle.Success)
  );

  const message = { embeds: [embeds], components: [actionBuilder] };
  return message;
}

export async function printMultipleLeaderboards(
  leaderboards: ILeaderboardEntity[],
  channel: TextBasedChannel
) {
  for (const leaderboard of leaderboards) {
    printLeaderboard(leaderboard, channel);
  }
}

export async function printMultipleFilteredLeaderboards(
  leaderboards: ILeaderboardEntity[],
  channel: TextBasedChannel
) {
  for (const leaderboard of leaderboards) {
    printLeaderboard(leaderboard, channel, true);
  }
}

function parseEntries(entries: IEntryEntity[]): string[] {
  let resultArray = new Array<string>();
  let result = "";

  entries.sort((firstEntry, secondEntry) => {
    return firstEntry.time - secondEntry.time;
  });

  entries.forEach((entry, index) => {
    const parsedEntry = parseOneEntry(entry, index + 1);
    if (result.length + parsedEntry.length > MAX_FIELD_LENGTH) {
      resultArray.push(result);
      result = "";
    }
    result += parsedEntry;
    result += "\n";
  });

  if (!result) result = "No entries available.";
  resultArray.push(result);

  return resultArray;
}

function parseOneEntry(entry: IEntryEntity, position: number): string {
  let result = "";

  if (entry) {
    result = `${position}. ${userMention(entry.userId)} ${parseTime(
      entry.time
    )} ${entry.notes ? "  \\|\\|  " + entry.notes : ""}`;
  }

  return result;
}

function parseTime(time: number): string {
  const duration = moment.duration(time);

  return duration.format("mm:ss.SSS");
}

function generateEmbeds(
  leaderboard: ILeaderboardEntity & { id?: string },
  entriesArray: string[]
) {
  const embeds = {
    color: 0xfe6f27,
    title: leaderboard.name,

    description: leaderboard.description,
    fields: new Array(),
    footer: {
      text: `LeaderboardID: ${leaderboard.id}`,
    },
    timestamp: new Date().toISOString(),
  };
  for (const entries of entriesArray) {
    embeds.fields.push({
      name: "Standings:",
      value: entries,
      inline: true,
    });
  }

  return embeds;
}

function addMessage(
  leaderboardId: string | undefined,
  message: Message,
  filtered = true
) {
  if (!leaderboardId) return;
  const messageObject = {
    messageId: message.id,
    channelId: message.channelId,
    filtered: filtered,
  };
  addLeaderboardMessage(leaderboardId, messageObject);
}

export async function updateLeaderboardMessages(
  leaderboard: ILeaderboardEntity
) {
  if (!leaderboard.id) return;
  const leaderboardMessages = await getLeaderboardMessages(leaderboard.id);
  if (!leaderboardMessages) return;
  for (const message of leaderboardMessages) {
    try {
      const leaderboardMessage = await fetchMessage(
        message.channelId,
        message.messageId
      );

      const sendmessage = generateMessage(leaderboard, message.filtered);

      if (!leaderboardMessage) return;
      await leaderboardMessage.edit(sendmessage);
    } catch (error) {
      if (error instanceof DiscordAPIError && error.code === 10008) {
        removeMessage(message.messageId, message.channelId);
      } else {
        console.log(error);
      }
    }
  }
  console.log(`Updated ${leaderboardMessages.length} messages.`);
}
