import { CacheType, Client, Intents, Interaction } from "discord.js";
import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/rest/v10";
import cloneleaderboard from "./handlers/cloneleaderboard";
import createentry from "./handlers/createentry";
import createleaderboard from "./handlers/createleaderboard";
import deleteentry from "./handlers/deleteentry";
import deleteleaderboard from "./handlers/deleteleaderboard";
import addallowence from "./handlers/addallowence";
import allleaderboards from "./handlers/allleaderboards";
import removeallowence from "./handlers/removeallowence";

import { commands } from "./commands";

const client = new Client({
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.GUILD_MEMBERS,
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
    switch (interaction.commandName) {
      case "deleteentry":
        await deleteentry(interaction);
        break;
      case "createentry":
        await createentry(interaction);
        break;
      case "deleteleaderboard":
        await deleteleaderboard(interaction);
        break;
      case "createleaderboard":
        await createleaderboard(interaction);
        break;
      case "cloneleaderboard":
        await cloneleaderboard(interaction);
        break;
      case "addallowence":
        await addallowence(interaction);
        break;
      case "removeallowence":
        await removeallowence(interaction);
        break;
      case "allleaderboards":
        await allleaderboards(interaction);
        break;
      default:
        break;
    }
    if (!interaction.replied) {
      interaction.reply({ content: "👍", ephemeral: true });
    }
  }
};
