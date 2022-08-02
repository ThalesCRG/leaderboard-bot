import {
  CacheType,
  Client,
  CommandInteraction,
  Intents,
  Interaction,
  InteractionReplyOptions,
  MessagePayload,
  WebhookEditMessageOptions,
} from "discord.js";
import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/rest/v10";
import cloneleaderboard from "./handlers/cloneleaderboard";
import createentry from "./handlers/createentry";
import createleaderboard from "./handlers/createleaderboard";
import deleteleaderboard from "./handlers/deleteleaderboard";
import addallowence from "./handlers/addallowence";
import allleaderboards from "./handlers/allleaderboards";
import removeallowence from "./handlers/removeallowence";

import { commands } from "./commands";
import help from "./handlers/help";
import setprotected from "./handlers/set-protected";
import { myleaderboards } from "./handlers/myleaderboards";

const client = new Client({
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.GUILD_MEMBERS,
    Intents.FLAGS.DIRECT_MESSAGES,
  ],
});

export async function initConnection(token: string, appId: string) {
  console.log("trying bot login...");

  await client.login(token);

  console.log("Bot login successful");

  const rest = new REST({ version: "9" }).setToken(token);

  console.log("Started refreshing application (/) commands.");

  const response = (await rest.put(Routes.applicationCommands(appId), {
    body: commands,
  })) as Array<{ id: string; name: string }>;

  client.on("interactionCreate", handleInteractions);

  const cmdList = response.map((cmd) => {
    return { id: cmd.id, name: cmd.name };
  });
  console.log("updated commands", cmdList);
}

const handleInteractions = async (interaction: Interaction<CacheType>) => {
  if (interaction.isCommand()) {
    await interaction.reply({ content: "wait a second", ephemeral: true });
    let reply: string | MessagePayload | WebhookEditMessageOptions = "";
    switch (interaction.commandName) {
      case "createentry":
        reply = await createentry(interaction);
        break;
      case "deleteleaderboard":
        reply = await deleteleaderboard(interaction);
        break;
      case "createleaderboard":
        reply = await createleaderboard(interaction);
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
      case "setprotected":
        reply = await setprotected(interaction);
        break;
      case "myleaderboards":
        reply = await myleaderboards(interaction);
      default:
        break;
    }
    changeReply(interaction, reply);
  }
};

async function changeReply(
  interaction: CommandInteraction,
  content: string | MessagePayload | WebhookEditMessageOptions
): Promise<void> {
  if (!content) return;
  try {
    interaction.editReply(content);
  } catch (error) {
    console.log("Could not change reply - error: ", error);
  }
}
