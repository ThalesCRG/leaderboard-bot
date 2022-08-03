import { MessageEmbedOptions, WebhookEditMessageOptions } from "discord.js";
import { Command, HandlerResponse } from "../../types";
import { CommandNames } from "../command-names";

export function helpHandler(): HandlerResponse {
  return {
    message: {
      content: "We're glad to help:",
      embeds: [messegeEmbed],
    },
  };
}

export const helpCommand: Command = {
  name: CommandNames.help,
  description: "Prints a help message",
};

const messegeEmbed: MessageEmbedOptions = {
  title: "RDC Leaderboard Bot - Help Message",
  description: "We're happy to help you! Try those commands:",
  color: "#fe6f27",
  fields: [
    { name: "/createleaderboard", value: "Create a new leaderboard" },
    {
      name: "/createentry",
      value:
        "Create a new entry. Please pass the leaderboardid of the Leaderboard and your time in this format: MM:SS.sss",
    },
    {
      name: "/cloneleaderboard",
      value: "prints the leaderboard that has the ID you provided",
    },
    {
      name: "/allleaderboards",
      value: "prints all leaderboards that were created on this Discord",
    },
    {
      name: "/addallowence",
      value:
        "When a Leaderboard is protected only the creator and allowed person can create entries. With this command you can add somebody to the allowlist",
    },
    { name: "/removeallowence", value: "Removes somebody from the allowlist" },
    {
      name: "/deleteleaderboard",
      value: "Deletes the leaderboard with the ID you provided",
    },
    {
      name: "/setprotected",
      value:
        "You can change the protection status of your leaderboard. If a Leaderboard is protected only allowed person can create entries.",
    },
    {
      name: "/myleaderboards",
      value: "Send's you a DM with all leaderboards where you are a entry.",
    },
    {
      name: "/help",
      value: "Replies with this message",
    },
  ],
};
