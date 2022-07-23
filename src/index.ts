import { Client, Intents } from "discord.js";
import cloneleaderboard from "./commands/cloneleaderboard";
import command from "./commands/commands";
import createentry from "./commands/createentry";
import createleaderboard from "./commands/createleaderboard";
import deleteentry from "./commands/deleteentry";
import deleteleaderboard from "./commands/deleteleaderboard";
import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/rest/v10";

require("dotenv").config();

const commands: Array<command> = [
  {
    name: "cloneleaderboard",
    description: "Creates a Leaderboardmessage for your Channel",
    options: [
      {
        name: "leaderboardid",
        description: "The ID of the leaderboard that shall be cloned",
        required: true,
        type: 3,
      },
    ],
  },
  {
    name: "createleaderboard",
    description: "Creates a Leaderboard and posts it in your Channel",
    options: [
      {
        name: "leaderboardname",
        description: "The name of the leaderboard",
        type: 3,
        required: true,
      },
      {
        name: "description",
        description: "Description of the leaderboard",
        type: 3,
        required: true,
      },
      {
        name: "public",
        description: "Can everybody submit a time?",
        type: 5,
        required: false,
      },
    ],
  },
  {
    name: "deleteleaderboard",
    description: "Deletes a Leaderboard",
    options: [
      {
        name: "leaderboarid",
        description: "Id of the Leaderboard that shall be deleted",
        type: 3,
        required: true,
      },
    ],
  },
  {
    name: "createentry",
    description: "Add an entry to the leaderboard",
    options: [
      {
        name: "leaderboarid",
        description: "Id of the Leaderboard to which the entry shall be added",
        type: 3,
        required: true,
      },
      {
        name: "time",
        description: "Time in format MM:SS.mmm",
        type: 3,
        required: true,
      },
      {
        name: "driver",
        description: "Driver who drove this time defaults to yourself",
        type: 6,
        required: false,
      },
    ],
  },
  {
    name: "deleteentry",
    description: "Deletes an entry from the leaderboard",
    options: [
      {
        name: "leaderboarid",
        description: "The leaderboard ID of the entry to be deleted",
        type: 3,
        required: true,
      },
      {
        name: "driver",
        description: "The driver whose entry to be deleted",
        type: 6,
        required: true,
      },
    ],
  },
];

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

const rest = new REST({ version: "9" }).setToken(
  process.env.DISCORD_TOKEN || ""
);

client.on("ready", () => {
  (async () => {
    try {
      console.log("Started refreshing application (/) commands.");
      await rest
        .put(Routes.applicationCommands(process.env.APP_ID || ""), {
          body: commands,
        })
        .then(console.log);
      console.log("Successfully reloaded application (/) commands.");
    } catch (error) {
      console.error(error);
    }
  })();
});

client.on("interactionCreate", (interaction) => {
  if (interaction.isCommand()) {
    switch (interaction.commandName) {
      case "deleteentry":
        deleteentry(interaction);
        break;
      case "createentry":
        createentry(interaction);
        break;
      case "deleteleaderboard":
        deleteleaderboard(interaction);
        break;
      case "createleaderboard":
        createleaderboard(interaction);
        break;
      case "cloneleaderboard":
        cloneleaderboard(interaction);
        break;
      default:
        break;
    }
    if (!interaction.replied) {
      interaction.reply({ content: "👍", ephemeral: true });
    }
  }
});

require("./utils/dataUtils").createleaderboard("Test", "Testdescription");
require("./utils/dataUtils").addEntry(
  "Testentry",
  1,
  "62dc40480adf3f89b5713c70"
);
