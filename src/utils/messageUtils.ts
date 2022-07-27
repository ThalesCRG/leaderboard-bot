import { getBestPerPerson, IEntry, ILeaderboard } from "./dataUtils";
import { TextBasedChannel, MessageOptions, MessageEmbed } from "discord.js";
var moment = require("moment");
import momentDurationFormatSetup from "moment-duration-format";
momentDurationFormatSetup(moment);

const MAX_FIELD_LENGTH = 1024;

export async function printLeaderboard(
  leaderboard: ILeaderboard,
  channel: TextBasedChannel
) {
  if (!leaderboard || !channel) return;
  const entries = parseEntries(leaderboard.entries);

  const embeds = generateEmbeds(leaderboard, entries);

  try {
    await channel.send({ embeds: [embeds] });
  } catch (error) {
    console.log(error);
  }
}

export function printFilteredLeaderboard(
  leaderboard: ILeaderboard,
  channel: TextBasedChannel
) {
  if (!leaderboard || !channel) return;

  const entries = parseEntries(getBestPerPerson(leaderboard));

  const embeds = generateEmbeds(leaderboard, entries);
  try {
    channel.send({ embeds: [embeds] });
  } catch (error) {
    console.log(error);
  }
}

function parseEntries(entries: IEntry[]): string[] {
  let resultArray = new Array<string>;
  let result = "";

  entries.sort((firstEntry, secondEntry) => {
    return firstEntry.time - secondEntry.time;
  });

  entries.forEach((entry, index) => {
    const parsedEntry = parseOneEntry(entry, index + 1);
    if (result.length + parsedEntry.length > MAX_FIELD_LENGTH){
      resultArray.push(result);
      result = "";
    }
    result += parsedEntry;
    result += "\n";
  });
  
  if (!result) result = "No entires found";
  resultArray.push(result)

  return resultArray;
}

function parseOneEntry(entry: IEntry, position: number): string {
  let result = "";

  if (entry) {
    result = `${position}. ${mentionUser(entry.userId)} ${parseTime(
      entry.time
    )} ${entry.notes ? "  ||  " + entry.notes : ""}`;
  }

  return result;
}

function parseTime(time: number): string {
  const duration = moment.duration(time);

  return duration.format("mm:ss.SSS");
}

function mentionUser(userId: string): string {
  return `<@${userId}>`;
}

function generateEmbeds(leaderboard: ILeaderboard, entriesArray: string[]) {
  const embeds = {
    color: 0xfe6f27,
    title: leaderboard.name,

    description: leaderboard.description,
    fields: new Array(),
    footer: {
      text: `LeaderboardID: ${leaderboard.id}`,
    },
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
