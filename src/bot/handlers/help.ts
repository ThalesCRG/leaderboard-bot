import { APIEmbed, inlineCode } from "discord.js";
import { Command, HandlerResponse } from "../../types";
import { CommandNames } from "../command-names";
import { AllowenceSubcommand } from "./allowence";

export function helpHandler(): HandlerResponse {
  return {
    message: {
      content: "We're glad to help:",
      embeds: [messageEmbed],
    },
  };
}

export const helpCommand: Command = {
  name: CommandNames.help,
  description: "Prints a help message",
};

const messageEmbed: APIEmbed = {
  title: "RDC Leaderboard Bot - Help Message",
  description: "We're happy to help you! Try those commands:",
  color: 0xfe6f27,
  fields: [
    { name: CommandNames.createLeaderboard, value: "Create a new leaderboard" },
    {
      name: CommandNames.createEntry,
      value:
        "Create a new entry. Please pass the ID of the leaderboard and your time in the format MM:SS.sss",
    },
    {
      name: CommandNames.cloneLeaderboard,
      value: "Prints the leaderboard that has the ID you provided and updates it on new entries.",
    },
    {
      name: CommandNames.allLeaderboards,
      value: "Clones all leaderboards that were created on this Discord server",
    },
    {
      name: `${CommandNames.allowence} ${inlineCode(
        `${AllowenceSubcommand.add} / ${AllowenceSubcommand.remove}`
      )}`,
      value:
        "When a Leaderboard is protected, only the creator and allowed person can create entries. With this command you can add or remove somebody to the list of users, who are allowed to post new times",
    },
    {
      name: CommandNames.deleteLeaderboard,
      value: "Deletes the leaderboard with the ID you provided",
    },
    {
      name: CommandNames.setProtected,
      value:
        "You can change the protection status of your leaderboard. If a Leaderboard is set to be protected only allowed person can create entries",
    },
    {
      name: CommandNames.myLeaderboards,
      value:
        "Sends a direct message to your account with all leaderboards your user shows up in",
    },
    {
      name: CommandNames.setDescription,
      value: "Changes the description of a Leaderboard",
    },
    {
      name: CommandNames.help,
      value: "Replies with this message",
    },
  ],
};
