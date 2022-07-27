import { getBestPerPerson, IEntry, ILeaderboard } from "./dataUtils";
import { TextBasedChannel, MessageOptions, MessageEmbed } from "discord.js";
var moment = require("moment");
import momentDurationFormatSetup from "moment-duration-format";
momentDurationFormatSetup(moment);

export function printLeaderboard(
  leaderboard: ILeaderboard,
  channel: TextBasedChannel
) {
  if (!leaderboard || !channel) return;
  const entries = parseEntries(leaderboard.entries);

  const embeds = {
    color: 0x0099ff,
    title: leaderboard.name,

    description: leaderboard.description,
    fields: [
      {
        name: "Standings:",
        value: entries,
        inline: true,
      },
    ],
    footer: {
      text: `LeaderboardID: ${leaderboard.id}`,
    },
  };
  channel.send({ embeds: [embeds] });
}

export function printFilteredLeaderboard(
  leaderboard: ILeaderboard,
  channel: TextBasedChannel
) {
  if (!leaderboard || !channel) return;
  console.log("2");

  const entries = parseEntries(getBestPerPerson(leaderboard));

  const embeds = {
    color: 0x0099ff,
    title: leaderboard.name,

    description: leaderboard.description,
    fields: [
      {
        name: "Standings:",
        value: entries,
        inline: true,
      },
    ],
    footer: {
      text: `LeaderboardID: ${leaderboard.id}`,
    },
  };
  channel.send({ embeds: [embeds] });
}

function parseEntries(entries: IEntry[]): string {
  let result = "";

  entries.sort((firstEntry, secondEntry) => {
    return firstEntry.time - secondEntry.time;
  });

  entries.forEach((entry, index) => {
    result += parseOneEntry(entry, index + 1);
    result += "\n";
  });

  if (!result) result = "No entires found";
  return result;
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
