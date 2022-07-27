import { Client, Intents } from "discord.js";
import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/rest/v10";
import cloneleaderboard from "./commands/cloneleaderboard";
import createentry from "./commands/createentry";
import createleaderboard from "./commands/createleaderboard";
import deleteentry from "./commands/deleteentry";
import deleteleaderboard from "./commands/deleteleaderboard";
import addallowence from "./commands/addallowence";
import allleaderboards from "./commands/allleaderboards";
import removeallowence from "./commands/removeallowence";

import { commands } from "./commands";

require("dotenv").config();

export const client = new Client({
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.GUILD_MEMBERS,
  ],
});

client.login(process.env.BOT_TOKEN).then(() => {
  console.log("Bot logged in successfully");
});

const rest = new REST({ version: "9" }).setToken(process.env.BOT_TOKEN || "");

client.on("ready", () => {
  (async () => {
    try {
      console.log("Started refreshing application (/) commands.");
      await rest
        .put(Routes.applicationCommands(process.env.APPLICATION_ID || ""), {
          body: commands,
        })
        .then(console.log);
      console.log("Successfully reloaded application (/) commands.");
    } catch (error) {
      console.error(error);
    }
  })();
});

client.on("interactionCreate", async (interaction) => {
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
});
