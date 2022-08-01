import cloneleaderboard from "./handlers/cloneleaderboard";
import createentry from "./handlers/createentry";
import deleteleaderboard from "./handlers/deleteleaderboard";
import addallowence from "./handlers/addallowence";
import allleaderboards from "./handlers/allleaderboards";
import removeallowence from "./handlers/removeallowence";
import {
  CacheType,
  CommandInteraction,
  MessagePayload,
  WebhookEditMessageOptions,
} from "discord.js";
import help from "./handlers/help";
import { changeReply } from "./bot";

export const useLegacyInteractionHandling = async function (
  interaction: CommandInteraction<CacheType>
): Promise<string | MessagePayload | WebhookEditMessageOptions> {
  let reply: string | MessagePayload | WebhookEditMessageOptions = "";
  switch (interaction.commandName) {
    case "createentry":
      reply = await createentry(interaction);
      break;
    case "deleteleaderboard":
      reply = await deleteleaderboard(interaction);
      break;
    case "cloneleaderboard":
      reply = await cloneleaderboard(interaction);
      break;
    case "addallowence":
      reply = await addallowence(interaction);
      break;
    case "removeallowence":
      reply = await removeallowence(interaction);
      break;
    case "allleaderboards":
      reply = await allleaderboards(interaction);
      break;
    case "help":
      reply = await help(interaction);
      break;
    default:
      break;
  }
  return reply;
};
