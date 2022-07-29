import {
  CacheType,
  Client,
  CommandInteraction,
  Intents,
  Interaction,
  MessagePayload,
  WebhookEditMessageOptions,
} from "discord.js";
import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/rest/v10";

import handlers, { commandList } from "./handlers";

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
    body: commandList,
  })) as Array<{ id: string; name: string }>;

  client.on("interactionCreate", handleInteractions);

  const cmdList = response.map((cmd) => {
    return { id: cmd.id, name: cmd.name };
  });
  console.log("updated commands", cmdList);
}

const handleInteractions = async (interaction: Interaction<CacheType>) => {
  if (interaction.isCommand()) {
    // TODO: this is not needed, is it?
    if (!interaction.guild || !interaction.user?.id) {
      throw new Error("what shall i do if mandatory data is not present?");
    }

    console.log(`trying to use handler for command ${interaction.commandName}`);

    const definition = commandList.find(
      (cmd) => cmd.name === interaction.commandName
    );

    if (!definition) {
      return console.error(
        `could not find command definition for ${interaction.commandName}`
      );
    }

    if (!handlers[interaction.commandName]) {
      return console.error(
        `missing handler implementation for ${interaction.commandName}.`
      );
    }

    await interaction.reply({ content: "wait a second", ephemeral: true });

    const response: string | MessagePayload | WebhookEditMessageOptions =
      await handlers[interaction.commandName](
        interaction.options,
        interaction.user?.id,
        interaction.guildId
      );

    console.log(
      `handler for ${interaction.commandName} returned with response`,
      response
    );

    changeReply(interaction, response);
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
