import {
  CacheType,
  CommandInteraction,
  MessagePayload,
  WebhookEditMessageOptions,
} from "discord.js";
import legacyHandlers from "./handlers";

export const useLegacyInteractionHandling = async function (
  interaction: CommandInteraction<CacheType>
): Promise<string | MessagePayload | WebhookEditMessageOptions> {
  let reply: string | MessagePayload | WebhookEditMessageOptions = "";
  switch (interaction.commandName) {
    case "createentry":
      reply = await legacyHandlers.createentry(interaction);
      break;
    case "deleteleaderboard":
      reply = await legacyHandlers.deleteleaderboard(interaction);
      break;
    case "cloneleaderboard":
      reply = await legacyHandlers.cloneleaderboard(interaction);
      break;
    case "addallowence":
      reply = await legacyHandlers.addallowence(interaction);
      break;
    case "removeallowence":
      reply = await legacyHandlers.removeallowence(interaction);
      break;
    case "allleaderboards":
      reply = await legacyHandlers.allleaderboards(interaction);
      break;
    case "help":
      reply = await legacyHandlers.help(interaction);
      break;
    default:
      console.error(
        `did not find a legacy handler to use for ${interaction.commandName}`
      );
      break;
  }
  return reply;
};
